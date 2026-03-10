---
name: covid-india
description: Get COVID-19 statistics for India including state-wise and district-wise data. Use when user asks for "COVID India", "coronavirus India", "vaccination stats India", or "covid cases [state]".
---

# Covid-19 India API

Real-time COVID-19 data for India.

## Quick Use

```bash
# Get overall India stats
python3 scripts/covid.py india

# Get state-wise data
python3 scripts/covid.py states

# Get district data for a state
python3 scripts/covid.py district "Maharashtra"

# Get vaccination data
python3 scripts/covid.py vaccination
```

## API Used

https://api.covid19india.org (free, no key)

## Data Available

- Daily cases (confirmed, recovered, deceased)
- State-wise breakdown
- District-wise data
- Testing statistics
- Vaccination data
