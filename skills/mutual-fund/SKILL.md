---
name: mutual-fund
description: Access Indian mutual fund data including NAV, schemes, and performance. Use when user asks for "mutual fund India", "NAV", "MF performance", or "investment schemes India".
---

# Indian Mutual Fund API

Access mutual fund data from AMFI India.

## Quick Use

```bash
# Get NAV for a scheme
python3 scripts/mf.py nav "HDFC Top 100"

# Search schemes
python3 scripts/mf.py search "bluechip"

# Get scheme details
python3 scripts/scripts/mf.py details "Scheme_Code"
```

## API Used

https://mfapi.in (free, no key)

## Data Available

- Daily NAV for all schemes
- Scheme master list
- Fund performance
- Historical NAV
- Scheme categories (equity, debt, hybrid, etc.)
