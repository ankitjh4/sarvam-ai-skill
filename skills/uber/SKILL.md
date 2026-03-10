---
name: uber-india
description: Get Uber ride estimates, pricing, and availability in Indian cities. Use when user asks for "Uber price estimate", "Uber fare", "cab booking India", or "ride cost [destination]".
---

# Uber India API

Ride estimates and pricing in India.

## Quick Use

```bash
# Get price estimate
python3 scripts/uber.py price "Delhi" "Gurgaon"

# Get available services
python3 scripts/scripts/uber.py products "28.6139,77.2090"

# Get ETA
python3 scripts/uber.py eta "28.6139,77.2090"
```

## Note

Requires Uber API key. Get from https://developer.uber.com

## Environment Variable

```
UBER_SERVER_TOKEN
UBER_CLIENT_ID
UBER_CLIENT_SECRET
```

## Cities in India

- Delhi NCR
- Mumbai
- Bangalore
- Hyderabad
- Chennai
- Pune
- Kolkata
- Ahmedabad
- Jaipur
- Chandigarh
- etc.
