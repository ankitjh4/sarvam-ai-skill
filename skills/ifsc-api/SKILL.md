---
name: ifsc-api
description: Get Indian bank branch details using IFSC (Indian Financial Systems Code). Use when user asks for "IFSC code", "bank branch details", "bank address", or "bank MICR code".
---

# IFSC API

Indian Financial Systems Code lookup.

## Quick Use

```bash
# Get bank details by IFSC
python3 scripts/ifsc.py "HDFC0001234"

# Search bank by name
python3 scripts/ifsc.py search "HDFC Bank"

# Get bank branches in a city
python3 scripts/ifsc.py city "Mumbai" "HDFC"
```

## API Used

https://ifsc.razorpay.com (free, no key)

## Data Available

- Bank name
- Branch address
- Contact details
- MICR code
- District & State
- NEFT/RTGS availability
