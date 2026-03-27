---
name: razorpay
description: "Create payment orders, verify signatures, process refunds, and list transactions via Razorpay — India's leading payment gateway. Use when the user asks about Razorpay payments, Indian payment processing, INR checkout, payment orders, or RZP integration."
metadata:
  author: ankitjh4
  display-name: Razorpay Payments
---

# Razorpay Payment Gateway

Accept payments via Razorpay — India's leading payment gateway.

## Setup

1. Create account at https://razorpay.com
2. Get API keys from Dashboard → Settings → API Keys

```bash
export RAZORPAY_KEY_ID="key_id_xxxxx"
export RAZORPAY_KEY_SECRET="key_secret_xxxxx"
```

| Variable | Required | Description |
|----------|----------|-------------|
| RAZORPAY_KEY_ID | Yes | Key ID from Razorpay dashboard |
| RAZORPAY_KEY_SECRET | Yes | Key Secret from Razorpay dashboard |

## Payment Workflow

1. **Create order** — `python3 scripts/razorpay.py create-order 50000 "INR"` (amount in paise)
2. **Customer pays** — integrate Razorpay Checkout on frontend with the returned `order_id`
3. **Verify signature** — `python3 scripts/razorpay.py verify "order_id" "payment_id" "signature"` to confirm payment authenticity
4. **Check status** — `python3 scripts/razorpay.py status "pay_xxxxx"` to confirm final state

## Usage

```bash
# Create order (amount in paise — 50000 = ₹500)
python3 scripts/razorpay.py create-order 50000 "INR"

# Check payment status
python3 scripts/razorpay.py status "pay_xxxxx"

# List payments
python3 scripts/razorpay.py list-payments

# Process refund
python3 scripts/razorpay.py refund "pay_xxxxx" 10000
```

## Features

- Create payment orders
- Verify payment signatures
- Handle refunds
- List transactions

## API Reference

- Docs: https://razorpay.com/docs/payments/
- API: https://razorpay.com/docs/api/
