"""
test_cashfree.py
----------------
Smoke-test Cashfree APIs in sandbox. Completely safe — no real money.

    export CASHFREE_APP_ID="your_app_id"
    export CASHFREE_SECRET_KEY="your_secret_key"
    export CASHFREE_ENV="TEST"
    python test_cashfree.py
"""

import os, sys
from cashfree_client import CashfreeClient

if not os.environ.get("CASHFREE_APP_ID"):
    print("ERROR: Set CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV=TEST")
    sys.exit(1)

cf = CashfreeClient()

# ── Test 1: Create Order ───────────────────────────────────────────────────────
print("\n=== Test 1: Create Order ===")
order = cf.create_order(
    amount=1.00,                     # ₹1 minimum
    customer_id="test_cust_001",
    customer_phone="9999999999",     # dummy for sandbox
    customer_name="Test User",
    customer_email="test@example.com",
    order_id=f"test_order_{os.urandom(3).hex()}",
    note="Smoke test order"
)
print(f"  order_id:           {order['order_id']}")
print(f"  payment_session_id: {order['payment_session_id'][:30]}...")
print(f"  status:             {order['order_status']}")
print("✅ Order created")

# ── Test 2: Fetch Order Status ─────────────────────────────────────────────────
print("\n=== Test 2: Fetch Order Status ===")
status = cf.get_order_status(order["order_id"])
print(f"  Status: {status['order_status']}")
print("✅ Status fetch OK")

# ── Test 3: Create Payment Link ────────────────────────────────────────────────
print("\n=== Test 3: Create Payment Link ===")
link = cf.create_payment_link(
    amount=99.00,
    customer_name="Test User",
    customer_phone="9999999999",
    customer_email="test@example.com",
    purpose="Test payment link",
    send_sms=False,     # don't actually SMS in test
    send_email=False
)
print(f"  Link URL: {link['link_url']}")
print(f"  Status:   {link['link_status']}")
print("✅ Payment link created")

# ── Test 4: Cancel the Payment Link ───────────────────────────────────────────
print("\n=== Test 4: Cancel Payment Link ===")
cancelled = cf.cancel_payment_link(link["link_id"])
print(f"  Status: {cancelled['link_status']}")
print("✅ Link cancelled")

# ── Test 5: Simulate Payment (Dev Studio) ──────────────────────────────────────
print("\n=== Test 5: Simulate Payment ===")
print("  Open this URL to simulate a payment in the browser:")
print(f"  https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order['order_id']}")
print("  Use test card: 4111 1111 1111 1111 | any future expiry | CVV 123")
print("  Or test UPI:   success@cashfree")

print("\n✅ All safe tests passed. Sandbox only — no real money moved.")
