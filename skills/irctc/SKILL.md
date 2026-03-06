---
name: irctc
description: Indian Railway train search, PNR status, seat availability using RailwayAPI. Requires RAILWAYAPI_KEY in Settings.
metadata:
  author: buckbuckbot
  category: Travel
---

# IRCTC / Indian Railway API

Check PNR status, train schedules, seat availability, and live train status.

## Setup

1. Get API key from [RailwayAPI](https://railwayapi.com/) (free tier available)
2. Add `RAILWAYAPI_KEY` in [Settings → Advanced](/?t=settings&s=advanced)

## Usage

```bash
# Check PNR status
python3 scripts/irctc.py pnr --pnr 1234567890

# Search trains between stations
python3 scripts/irctc.py trains --from NDLS --to BNC --date 07032026

# Check seat availability
python3 scripts/irctc.py availability --train 12002 --from NDLS --to BNC --date 07032026 --class 3A

# Live train status
python3 scripts/irctc.py live --train 12002 --date 07032026
```

## API Endpoints

- Base: `https://api.railwayapi.com/v2`
- Auth: Query param `apikey/{API_KEY}`
