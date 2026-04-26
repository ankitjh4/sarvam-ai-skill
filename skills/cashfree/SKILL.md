---
name: cashfree
description: Use this skill whenever the user wants to integrate Cashfree payment APIs. Triggers include: creating orders or payment sessions, accepting payments via UPI/cards/netbanking/wallets, generating payment links to share via SMS/email, handling refunds, verifying webhook signatures, fetching payment or settlement status, building a checkout flow, writing Python code for Cashfree, switching between test and production environments, or understanding Cashfree error codes. Also trigger when user mentions Cashfree PG, Cashfree Payouts, payment gateway India, or x-client-id credentials.
---

## Source — verified from live official docs
- API Reference: https://www.cashfree.com/docs/api-reference/payments/latest/overview
- Latest version: **v2025-01-01** (v5) — always use this for new integrations
- Official Python SDK: `pip install cashfree-pg`
- Dev Studio (interactive test): https://www.cashfree.com/devstudio/preview/pg/web/checkout

## Bundled Files
| File | Purpose |
|---|---|
| `scripts/cashfree_client.py` | Reusable Python client using official SDK |
| `scripts/test_cashfree.py` | Smoke-test in sandbox — safe to run |
| `scripts/requirements.txt` | Python dependencies |
| `references/endpoints.md` | Full endpoint + error code reference |

---

## Environments & Base URLs

| Environment | Base URL | Use for |
|---|---|---|
| **Sandbox (Test)** | `https://sandbox.cashfree.com/pg` | Development, testing |
| **Production** | `https://api.cashfree.com/pg` | Live payments |

> Always develop in sandbox. Test cards/UPI provided at: https://www.cashfree.com/docs/api-reference/payments/data-to-test-integration

---

## Step 0 — Get Credentials

1. Sign up at https://merchant.cashfree.com/merchants/signup
2. Dashboard → **Developers → API Keys**
3. Switch to **Test Mode** → generate test keys
4. You get two values:
   - `x-client-id` (App ID)
   - `x-client-secret` (Secret Key)

```bash
export CASHFREE_APP_ID="your_app_id"
export CASHFREE_SECRET_KEY="your_secret_key"
export CASHFREE_ENV="TEST"   # or "PRODUCTION"
```

---

## Authentication

Every request needs two headers — no Bearer token, no expiry:

```python
headers = {
    "x-client-id":     "your_app_id",
    "x-client-secret": "your_secret_key",
    "x-api-version":   "2025-01-01",
    "Content-Type":    "application/json"
}
```

> Unlike Shiprocket/Razorpay there is **no token to refresh** — credentials go directly in every request.

---

## Core Flow

```
1. Create Order   →  POST /orders                  (server-side, get payment_session_id)
2. Show Checkout  →  cashfree.js SDK               (client-side, customer pays)
3. Verify Payment →  GET  /orders/{order_id}        (server-side, confirm status)
4. Webhook        →  POST your endpoint             (async payment notifications)
5. Refund if need →  POST /orders/{order_id}/refunds
```

---

## 1. Create Order

```
POST https://sandbox.cashfree.com/pg/orders
```

```python
import requests, os

BASE = "https://sandbox.cashfree.com/pg"   # switch to api.cashfree.com/pg for prod
HEADERS = {
    "x-client-id":     os.environ["CASHFREE_APP_ID"],
    "x-client-secret": os.environ["CASHFREE_SECRET_KEY"],
    "x-api-version":   "2025-01-01",
    "Content-Type":    "application/json"
}

order_data = {
    "order_id":       "order_001",       # your unique ID (optional — auto-generated if omitted)
    "order_amount":   499.00,            # in rupees, up to 2 decimal places
    "order_currency": "INR",
    "customer_details": {
        "customer_id":    "cust_001",    # your internal customer ID
        "customer_name":  "Priya Patel",
        "customer_email": "priya@example.com",
        "customer_phone": "9876543210"   # 10 digits, no +91
    },
    "order_meta": {
        "return_url":  "https://yourapp.com/payment/return?order_id={order_id}",
        "notify_url":  "https://yourapp.com/webhook/cashfree"  # webhook endpoint
    },
    "order_note": "Payment for March subscription"
}

res = requests.post(f"{BASE}/orders", json=order_data, headers=HEADERS)
data = res.json()

order_id          = data["order_id"]           # "order_001"
payment_session_id = data["payment_session_id"] # pass this to frontend SDK
cf_order_id       = data["cf_order_id"]         # Cashfree's internal ID
print(f"Order: {order_id} | Session: {payment_session_id[:20]}...")
```

---

## 2. Frontend Checkout (JS SDK)

Pass `payment_session_id` from Step 1 to the browser:

```html
<script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
<script>
const cashfree = Cashfree({ mode: "sandbox" });  // "production" in live

function pay() {
    cashfree.checkout({
        paymentSessionId: "SESSION_ID_FROM_BACKEND",
        redirectTarget: "_self"   // redirect on same page
    });
}
</script>
<button onclick="pay()">Pay ₹499</button>
```

After payment, user is redirected to `return_url` with `order_id` as query param.

---

## 3. Fetch Order Status (Verify Payment)

```
GET https://sandbox.cashfree.com/pg/orders/{order_id}
```

```python
res = requests.get(f"{BASE}/orders/{order_id}", headers=HEADERS)
order = res.json()

status = order["order_status"]   # "PAID" | "ACTIVE" | "EXPIRED"
print(f"Order {order_id}: {status}")

# Get payment details
payments_res = requests.get(f"{BASE}/orders/{order_id}/payments", headers=HEADERS)
payments = payments_res.json()
for p in payments:
    print(f"  Payment: {p['cf_payment_id']} | {p['payment_status']} | ₹{p['order_amount']}")
```

### Order statuses
| Status | Meaning |
|---|---|
| `ACTIVE` | Created, awaiting payment |
| `PAID` | Payment successful |
| `EXPIRED` | Order expired (default: 1 hour) |
| `TERMINATED` | Manually cancelled |

---

## 4. Webhook — Verify & Handle

Set your `notify_url` when creating the order. Cashfree POSTs to it on every payment event.

```python
import hmac, hashlib, base64

def verify_cashfree_webhook(timestamp: str, signature: str,
                             raw_body: bytes, secret: str) -> bool:
    """Verify Cashfree webhook signature."""
    message = timestamp + raw_body.decode()
    computed = base64.b64encode(
        hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    ).decode()
    return hmac.compare_digest(computed, signature)

# Flask example
from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route("/webhook/cashfree", methods=["POST"])
def cashfree_webhook():
    ts  = request.headers.get("x-webhook-timestamp")
    sig = request.headers.get("x-webhook-signature")

    if not verify_cashfree_webhook(ts, sig, request.data,
                                   os.environ["CASHFREE_SECRET_KEY"]):
        return "Invalid signature", 400

    event = request.json
    event_type = event["type"]   # e.g. "PAYMENT_SUCCESS_WEBHOOK"

    if event_type == "PAYMENT_SUCCESS_WEBHOOK":
        order_id   = event["data"]["order"]["order_id"]
        payment_id = event["data"]["payment"]["cf_payment_id"]
        amount     = event["data"]["payment"]["payment_amount"]
        # fulfill order here

    return jsonify({"status": "ok"}), 200
```

### Key webhook event types
| Event | When |
|---|---|
| `PAYMENT_SUCCESS_WEBHOOK` | Payment captured successfully |
| `PAYMENT_FAILED_WEBHOOK` | Payment attempt failed |
| `PAYMENT_USER_DROPPED_WEBHOOK` | User closed checkout without paying |
| `REFUND_STATUS_WEBHOOK` | Refund processed |
| `DISPUTE_OPENED_WEBHOOK` | Customer raised a dispute |

---

## 5. Refunds

```
POST https://sandbox.cashfree.com/pg/orders/{order_id}/refunds
```

```python
refund_data = {
    "refund_amount": 499.00,          # partial or full
    "refund_id":     "refund_001",    # your unique refund ID
    "refund_note":   "Customer request"
}

res = requests.post(f"{BASE}/orders/{order_id}/refunds",
                    json=refund_data, headers=HEADERS)
refund = res.json()
print(f"Refund status: {refund['refund_status']}")  # PENDING → SUCCESS

# Fetch refund status
res = requests.get(f"{BASE}/orders/{order_id}/refunds/{refund_id}",
                   headers=HEADERS)
```

### Refund statuses
| Status | Meaning |
|---|---|
| `PENDING` | Initiated, being processed |
| `SUCCESS` | Refund completed (2-7 business days) |
| `CANCELLED` | Refund was cancelled |
| `ONHOLD` | Under review |

---

## 6. Payment Links (no checkout integration needed)

```
POST https://sandbox.cashfree.com/pg/links
```

```python
link_data = {
    "link_id":             "link_001",       # your unique ID
    "link_amount":         999.00,
    "link_currency":       "INR",
    "link_purpose":        "Course fee",
    "customer_details": {
        "customer_name":   "Rahul Sharma",
        "customer_phone":  "9876543210",
        "customer_email":  "rahul@example.com"
    },
    "link_notify": {
        "send_sms":   True,
        "send_email": True
    },
    "link_expiry_time":    "2025-05-01 23:59:59",  # optional
    "link_partial_payments": False
}

res = requests.post(f"{BASE}/links", json=link_data, headers=HEADERS)
link = res.json()
print(f"Payment link: {link['link_url']}")   # share this with customer
```

---

## Test Credentials (Sandbox only)

| Method | Details |
|---|---|
| Card (success) | `4111 1111 1111 1111`, any future expiry, CVV `123` |
| Card (failure) | `4111 1111 1111 1112` |
| UPI (success) | `success@cashfree` |
| UPI (failure) | `failure@cashfree` |
| Net banking | Any bank, use test credentials shown |

Full test data: https://www.cashfree.com/docs/api-reference/payments/data-to-test-integration

---

## Important Rules

| Rule | Detail |
|---|---|
| `order_amount` | In **rupees** with 2 decimal places — NOT paise (opposite of Razorpay) |
| `order_id` | Max 50 chars, alphanumeric + `_` and `-` only |
| `customer_phone` | 10 digits, no country code, no `+91` |
| `x-api-version` | Always send `2025-01-01` for latest APIs |
| Order expiry | Default 1 hour — set `order_expiry_time` to override |
| Refund window | Must refund within 180 days of payment |
| Webhook retry | Cashfree retries failed webhooks — make your handler idempotent |
