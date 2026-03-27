---
name: phonepe
description: "Process UPI payments via PhonePe — initiate collect requests, generate QR codes, check transaction status, and handle refunds. Use when the user asks about PhonePe payments, UPI integration, Indian mobile payments, or UPI collect/QR payment flows."
metadata:
  author: ankitjh4
  display-name: PhonePe UPI Payments
---

# PhonePe UPI Payment Gateway

Accept UPI payments via PhonePe — India's leading UPI platform.

## Setup

1. Register at https://business.phonepe.com
2. Get API credentials from merchant dashboard

```bash
export PHONEPE_MERCHANT_ID="your_merchant_id"
export PHONEPE_SALT_KEY="your_salt_key"
export PHONEPE_SALT_INDEX=1
export PHONEPE_ENV="preprod"  # "preprod" for testing, "production" for live
```

| Variable | Required | Description |
|----------|----------|-------------|
| PHONEPE_MERCHANT_ID | Yes | Merchant ID from PhonePe |
| PHONEPE_SALT_KEY | Yes | Salt key for signing requests |
| PHONEPE_SALT_INDEX | Yes | Salt index (usually 1) |
| PHONEPE_ENV | No | "preprod" or "production" (default: preprod) |

## Payment Workflow

1. **Initiate payment** — use `collect` (UPI request) or `qr` (QR code) command
2. **Customer authorises** — customer approves on their UPI app
3. **Check status** — `python3 scripts/phonepe.py status "txn_id"` to confirm payment
4. **Handle result** — status returns SUCCESS, PENDING, or FAILED; retry status check if PENDING

## Usage

```bash
# Initiate UPI collect request (amount in INR)
python3 scripts/phonepe.py collect "user@upi" 100 "order123"

# Generate QR code payment
python3 scripts/phonepe.py qr 500 "order456"

# Check transaction status
python3 scripts/phonepe.py status "txn_id"

# Process refund
python3 scripts/phonepe.py refund "txn_id" 100
```

## Features

- UPI Collect (request payment from VPA)
- QR Code payments
- Transaction status checks
- Refunds

## API Endpoints

- Sandbox: `https://api-preprod.phonepe.com`
- Production: `https://api.phonepe.com`
- Docs: https://developer.phonepe.com/
