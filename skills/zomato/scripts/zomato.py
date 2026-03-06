#!/usr/bin/env python3
"""Zomato Restaurant API CLI"""

import os
import json
import requests
import sys

BASE_URL = "https://developers.zomato.com/api/v2.1"

def get_api_key(api_key=None):
    """Get API key from args or env"""
    if api_key:
        return api_key
    key = os.environ.get("ZOMATO_API_KEY")
    if not key:
        print("Error: Set ZOMATO_API_KEY in Settings → Advanced or pass --api-key")
        sys.exit(1)
    return key

def get_headers(api_key):
    return {"user-key": api_key}

def search_city(name, api_key):
    """Get city ID by name"""
    headers = get_headers(api_key)
    params = {"q": name}
    resp = requests.get(f"{BASE_URL}/cities", headers=headers, params=params)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("location_suggestions"):
            city = data["location_suggestions"][0]
            print(f"City: {city['name']} (ID: {city['id']}, Country: {city['country_name']})")
            return city['id']
        print("City not found")
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def get_cuisines(city_id, api_key):
    """Get available cuisines in a city"""
    headers = get_headers(api_key)
    params = {"city_id": city_id}
    resp = requests.get(f"{BASE_URL}/cuisines", headers=headers, params=params)
    if resp.status_code == 200:
        data = resp.json()
        cuisines = data.get("cuisines", [])
        print(f"Cuisines in city {city_id}:")
        for c in cuisines[:20]:
            print(f"  - {c['cuisine']['cuisine_name']} (ID: {c['cuisine']['cuisine_id']})")
    else:
        print(f"Error: {resp.status_code}")

def search_restaurants(city, cuisine=None, api_key=None):
    """Search restaurants"""
    api_key = get_api_key(api_key)
    headers = get_headers(api_key)

    # First get city ID
    params = {"q": city}
    resp = requests.get(f"{BASE_URL}/cities", headers=headers, params=params)
    if resp.status_code != 200 or not resp.json().get("location_suggestions"):
        print(f"City '{city}' not found")
        return

    city_id = resp.json()["location_suggestions"][0]["id"]

    # Search
    params = {"entity_id": city_id, "entity_type": "city", "count": 10}
    if cuisine:
        params["cuisines"] = cuisine

    resp = requests.get(f"{BASE_URL}/search", headers=headers, params=params)
    if resp.status_code == 200:
        results = resp.json().get("restaurants", [])
        print(f"\nFound {len(results)} restaurants in {city}:")
        for r in results:
            res = r["restaurant"]
            print(f"\n  {res['name']}")
            print(f"  Cuisine: {res['cuisines']}")
            print(f"  Rating: {res['user_rating']['aggregate_rating']} ({res['user_rating']['votes']} votes)")
            print(f"  Address: {res['location']['address']}")
            print(f"  Cost for two: {res['currency']} {res['average_cost_for_two']}")
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def get_restaurant(res_id, api_key=None):
    """Get restaurant details"""
    api_key = get_api_key(api_key)
    headers = get_headers(api_key)

    resp = requests.get(f"{BASE_URL}/restaurant", headers=headers, params={"res_id": res_id})
    if resp.status_code == 200:
        res = resp.json()
        print(f"\n{res['name']}")
        print(f"Cuisines: {res['cuisines']}")
        print(f"Rating: {res['user_rating']['aggregate_rating']}/5")
        print(f"Address: {res['location']['address']}")
        print(f"City: {res['location']['city']}")
        print(f"Cost for two: {res['currency']} {res['average_cost_for_two']}")
        print(f"Highlights: {', '.join(res.get('highlights', [])[:5])}")
        print(f"\nMenu: {res.get('menu_url', 'N/A')}")
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 zomato.py <command> [args]")
        print("Commands:")
        print("  city --name <city>")
        print("  cuisines --city-id <id>")
        print("  search --city <name> [--cuisine <type>] [--api-key <key>]")
        print("  restaurant --res-id <id> [--api-key <key>]")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    api_key = None
    filtered_args = []
    for i, arg in enumerate(args):
        if arg == "--api-key" and i+1 < len(args):
            api_key = args[i+1]
        else:
            filtered_args.append(arg)
    args = filtered_args

    if cmd == "city":
        name = None
        for i, arg in enumerate(args):
            if arg == "--name" and i+1 < len(args):
                name = args[i+1]
        if not name:
            print("Error: --name required")
            sys.exit(1)
        search_city(name, api_key or os.environ.get("ZOMATO_API_KEY", ""))

    elif cmd == "cuisines":
        city_id = None
        for i, arg in enumerate(args):
            if arg == "--city-id" and i+1 < len(args):
                city_id = args[i+1]
        if not city_id:
            print("Error: --city-id required")
            sys.exit(1)
        get_cuisines(city_id, api_key or os.environ.get("ZOMATO_API_KEY", ""))

    elif cmd == "search":
        city = cuisine = None
        for i, arg in enumerate(args):
            if arg == "--city" and i+1 < len(args):
                city = args[i+1]
            elif arg == "--cuisine" and i+1 < len(args):
                cuisine = args[i+1]
        if not city:
            print("Error: --city required")
            sys.exit(1)
        search_restaurants(city, cuisine, api_key)

    elif cmd == "restaurant":
        res_id = None
        for i, arg in enumerate(args):
            if arg == "--res-id" and i+1 < len(args):
                res_id = args[i+1]
        if not res_id:
            print("Error: --res-id required")
            sys.exit(1)
        get_restaurant(res_id, api_key)

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
