---
name: zomato
description: Restaurant search and data from Zomato. Note: Zomato API now requires partnership approval. Use --api-key parameter if you have access.
metadata:
  author: buckbuckbot
  category: Food
---

# Zomato Restaurant API

Search restaurants, get menus, and restaurant details via Zomato API.

**Note:** Zomato's public API is now restricted. You need a partner API key.

## Setup

1. Apply for API access at [Zomato for Partners](https://developers.zomato.com/api)
2. Add `ZOMATO_API_KEY` in [Settings → Advanced](/?t=settings&s=advanced)
   OR pass `--api-key` directly

## Usage

```bash
# Search restaurants in a city
python3 scripts/zomato.py search --city "Mumbai" --cuisine "Chinese"

# Get restaurant details
python3 scripts/zomato.py restaurant --res_id 18456

# Get city ID
python3 scripts/zomato.py city --name "Delhi"

# Get cuisine list
python3 scripts/zomato.py cuisines --city_id 1
```

## API Endpoints

- Base: `https://developers.zomato.com/api/v2.1`
- Header: `user-key: {API_KEY}`
