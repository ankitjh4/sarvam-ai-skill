#!/usr/bin/env python3
"""Indian News CLI using NewsData.io API"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.parse
import urllib.error

API_BASE = "https://newsdata.io/api/1/latest"


def get_news(category=None, language="en", country="in", q=None, apikey=None):
    """Fetch news from NewsData.io API"""
    
    if not apikey:
        apikey = os.environ.get("NEWSDATA_API_KEY")
        if not apikey:
            print("Error: NEWSDATA_API_KEY not set. Get free key at https://newsdata.io/")
            sys.exit(1)
    
    params = {
        "apikey": apikey,
        "country": country,
        "language": language,
    }
    
    if category:
        params["category"] = category
    if q:
        params["q"] = q
    
    url = f"{API_BASE}?{urllib.parse.urlencode(params)}"
    
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode())
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


def print_news(data):
    """Pretty print news results"""
    
    if data.get("status") != "success":
        print(f"API Error: {data.get('message', 'Unknown error')}")
        return
    
    results = data.get("results", [])
    if not results:
        print("No news found.")
        return
    
    print(f"Found {len(results)} articles:\n")
    print("=" * 70)
    
    for i, article in enumerate(results, 1):
        title = article.get("title", "No title")
        source = article.get("source_id", "Unknown source")
        date = article.get("pubDate", "")
        desc = article.get("description", "")
        url = article.get("link", "")
        
        print(f"{i}. {title}")
        print(f"   Source: {source}")
        if date:
            print(f"   Date: {date}")
        if desc:
            print(f"   {desc[:100]}..." if len(desc) > 100 else f"   {desc}")
        if url:
            print(f"   Link: {url}")
        print("-" * 70)


def main():
    parser = argparse.ArgumentParser(description="Indian News CLI")
    parser.add_argument("command", choices=["latest", "category", "search"], 
                        help="Command to run")
    parser.add_argument("query", nargs="?", help="Category name or search query")
    parser.add_argument("--language", "-l", default="en", help="Language code (en, hi, bn, etc.)")
    parser.add_argument("--country", "-c", default="in", help="Country code (in, us, etc.)")
    parser.add_argument("--apikey", "-k", help="API key (or set NEWSDATA_API_KEY env)")
    
    args = parser.parse_args()
    
    category = None
    q = None
    
    if args.command == "category":
        if not args.query:
            print("Error: category command requires a category name")
            sys.exit(1)
        category = args.query.lower()
    elif args.command == "search":
        if not args.query:
            print("Error: search command requires a search query")
            sys.exit(1)
        q = args.query
    
    data = get_news(category=category, language=args.language, 
                    country=args.country, q=q, apikey=args.apikey)
    print_news(data)


if __name__ == "__main__":
    main()
