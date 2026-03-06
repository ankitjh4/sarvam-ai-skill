---
name: razorpay
description: Accept payments in India using Razorpay payment gateway. Supports UPI, cards, netbanking, wallets. Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings.
metadata:
  author: buckbuckbot
  category: Payments
---

# Razorpay Payment Integration

Accept payments in India via UPI, cards, netbanking, and wallets using Razorpay.

## Setup

1. Get API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Add secrets in [Settings → Advanced](/?t=settings&s=advanced):
   - `RAZORPAY_KEY_ID` = your key id (e.g., `rzp_test_xxxx`)
   - `RAZORPAY_KEY_SECRET` = your key secret

## Usage

```bash
# Create payment order
python3 scripts/razorpay.py create-order --amount 10000 --currency INR

# Check payment status
python3 scripts/razorpay.py status --order_id order_xxxx

# Create refund
python3 scripts/razorpay.py refund --payment_id pay_xxxx --amount 5000
```

## Endpoints Used

- Base: `https://api.razorpay.com/v1`
- Auth: Basic Auth (base64(KEY_ID:KEY_SECRET))
- Orders API, Payments API, Refunds API
