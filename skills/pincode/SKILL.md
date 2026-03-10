---
name: pincode
description: Get Indian postal PIN code details including area, district, state. Use when user asks for "pincode", "postal code India", "pin code details", or wants address from PIN.
---

# India Pincode API

Indian postal code lookup.

## Quick Use

```bash
# Get details by pincode
python3 scripts/pincode.py 110001

# Search by area name
python3 scripts/pincode.py search "Connaught Place"

# Get post offices in a district
python3 scripts/pincode.py district "Central Delhi"
```

## API Used

https://api.postalpincode.in (free, no key)

## Data Available

- Area/locality name
- District
- State
- Post office type (HO, BO, SO)
- Delivery status
- Circle, Region, Division
