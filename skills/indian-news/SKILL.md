---
name: indian-news
description: Get real-time Indian news headlines and articles using NewsData.io API. Supports category filtering, language filtering, and search.
metadata:
  author: buckbuckbot.zo.computer
  category: External
  display-name: Indian News API
---

# Indian News API

Get real-time Indian news headlines and articles using [NewsData.io](https://newsdata.io/).

## Required: API Key

**You need a free API key from NewsData.io**

1. Go to https://newsdata.io/
2. Sign up for free account
3. Get your API key
4. Add to Zo secrets: [Settings → Advanced](/?t=settings&s=advanced)
5. Add secret: `NEWSDATA_API_KEY` = your-api-key

## Usage

```bash
# Get latest Indian news
python3 scripts/news.py latest

# Get news by category
python3 scripts/news.py category technology

# Search news
python3 scripts/news.py search "artificial intelligence"

# Get Hindi news
python3 scripts/news.py latest --language hi
```

## Categories

- `business`
- `crime`
- `domestic`
- `education`
- `entertainment`
- `environment`
- `food`
- `health`
- `politics`
- `science`
- `sports`
- `technology`
- `top`
- `tourism`
- `world`

## Languages

- `en` - English (default)
- `hi` - Hindi
- `bn` - Bengali
- `ta` - Tamil
- `te` - Telugu
- `ml` - Malayalam
- `kn` - Kannada
- `mr` - Marathi
- `gu` - Gujarati
- `pa` - Punjabi
- `ur` - Urdu

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEWSDATA_API_KEY` | Yes | Your API key from newsdata.io |

## API Reference

- Dashboard: https://newsdata.io/
- Docs: https://docs.newsdata.io/
