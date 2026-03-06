---
name: phonepe
description: Accept UPI payments in India using PhonePe. Supports UPI Collect, Payment Links, and checkout. Requires PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY in Settings.
metadata:
  author: buckbuckbot
  category: Payments
---

# PhonePe UPI Payment Integration

Accept UPI payments in India via PhonePe.

## Setup

1. Register at [PhonePe Business](https://business.phonepe.com/)
2. Get Merchant ID and Salt Key from dashboard
3. Add secrets in [Settings → Advanced](/?t=settings&s=advanced):
   - `PHONEPE_MERCHANT_ID` = your merchant ID
   - `PHONEPE_SALT_KEY` = your salt key
   - `PHONEPE_ENV` = sandbox (or `production`)

## Usage

```bash
# Create payment link
python3 scripts/phonepe.py payment-link --amount 10000 --phone 919999999999 --name "Customer Name"

# Check payment status
python3 scripts/phonepe.py status --merchant_order_id order_123

# Validate UPI address
python3 scripts/phonepe.py validate-vpa --vpa success@ybl
```

## Endpoints

- Sandbox: `https://api-preprod.phonepe.com`
- Production: `https://api.phonepe.com`
