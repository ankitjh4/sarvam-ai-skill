#!/usr/bin/env python3
"""Indian Railway / IRCTC API CLI"""

import os
import json
import requests
import sys

BASE_URL = "https://api.railwayapi.com/v2"

def get_api_key():
    key = os.environ.get("RAILWAYAPI_KEY")
    if not key:
        print("Error: Set RAILWAYAPI_KEY in Settings → Advanced")
        sys.exit(1)
    return key

def check_pnr(pnr):
    """Check PNR status"""
    api_key = get_api_key()
    url = f"{BASE_URL}/pnr-status/pnr/{pnr}/apikey/{api_key}/"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("response_code") == 200:
            print(f"\nPNR: {pnr}")
            print(f"Train: {data.get('train_name')} ({data.get('train_num')})")
            print(f"Date: {data.get('doj')}")
            print(f"From: {data.get('from_station')} ({data.get('boarding_station')})")
            print(f"To: {data.get('to_station')} ({data.get('reservation_upto')})")
            print(f"Class: {data.get('journey_class')}")
            print(f"\nPassengers:")
            for p in data.get("passengers", []):
                print(f"  {p.get('no')}: {p.get('booking_status')} | Current: {p.get('current_status')}")
        else:
            print(f"Error: {data.get('message', 'Unknown error')}")
    else:
        print(f"Error: {resp.status_code}")

def search_trains(from_stn, to_stn, date):
    """Search trains between stations"""
    api_key = get_api_key()
    # date format: DDMMYYYY
    url = f"{BASE_URL}/between-station/apikey/{api_key}/from/{from_stn}/to/{to_stn}/date/{date}/"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("response_code") == 200:
            trains = data.get("trains", [])
            print(f"\nFound {len(trains)} trains from {from_stn} to {to_stn}:")
            for t in trains:
                print(f"\n{t['train_num']} - {t['name']}")
                print(f"  Departs: {t['src_departure_time']} | Arrives: {t['dst_arrival_time']}")
                print(f"  Duration: {t['duration']}")
                print(f"  Days: {', '.join(t['days'])}")
                classes = [c['class_code'] for c in t['classes']]
                print(f"  Classes: {', '.join(classes)}")
        else:
            print(f"Error: {data.get('message')}")
    else:
        print(f"Error: {resp.status_code}")

def check_availability(train_num, from_stn, to_stn, date, stn_class):
    """Check seat availability"""
    api_key = get_api_key()
    url = f"{BASE_URL}/availability/apikey/{api_key}/train/{train_num}/from/{from_stn}/to/{to_stn}/date/{date}/class/{stn_class}/quota/GN/"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("response_code") == 200:
            print(f"\nAvailability for {train_num} ({date}):")
            for av in data.get("availability", []):
                print(f"  {av.get('date')}: {av.get('status')}")
        else:
            print(f"Error: {data.get('message')}")
    else:
        print(f"Error: {resp.status_code}")

def live_status(train_num, date):
    """Get live train status"""
    api_key = get_api_key()
    url = f"{BASE_URL}/live/train/{train_num}/apikey/{api_key}/date/{date}/"
    resp = requests.get(url)
    if resp.status_code == 200:
        data = resp.json()
        if data.get("response_code") == 200:
            print(f"\nLive Status: {data.get('train_name')} ({data.get('train_num')})")
            print(f"Position: {data.get('position')}")
            print(f"Current Station: {data.get('current_station', {}).get('station_name')}")
            print(f"Last Updated: {data.get('last_updated')}")
            print("\nRoute:")
            for s in data.get("route", [])[:5]:
                print(f"  {s['station_name']} - {s.get('status', 'passed')}")
        else:
            print(f"Error: {data.get('message')}")
    else:
        print(f"Error: {resp.status_code}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 irctc.py <command> [args]")
        print("Commands:")
        print("  pnr --pnr <10-digit>")
        print("  trains --from <code> --to <code> --date <DDMMYYYY>")
        print("  availability --train <num> --from <code> --to <code> --date <DDMMYYYY> --class <3A>")
        print("  live --train <num> --date <DDMMYYYY>")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd == "pnr":
        pnr = None
        for i, arg in enumerate(args):
            if arg == "--pnr" and i+1 < len(args):
                pnr = args[i+1]
        if not pnr:
            print("Error: --pnr required")
            sys.exit(1)
        check_pnr(pnr)

    elif cmd == "trains":
        frm = to = date = None
        for i, arg in enumerate(args):
            if arg == "--from" and i+1 < len(args):
                frm = args[i+1]
            elif arg == "--to" and i+1 < len(args):
                to = args[i+1]
            elif arg == "--date" and i+1 < len(args):
                date = args[i+1]
        if not frm or not to or not date:
            print("Error: --from, --to, --date required")
            sys.exit(1)
        search_trains(frm, to, date)

    elif cmd == "availability":
        train = frm = to = date = stn_class = None
        for i, arg in enumerate(args):
            if arg == "--train" and i+1 < len(args):
                train = args[i+1]
            elif arg == "--from" and i+1 < len(args):
                frm = args[i+1]
            elif arg == "--to" and i+1 < len(args):
                to = args[i+1]
            elif arg == "--date" and i+1 < len(args):
                date = args[i+1]
            elif arg == "--class" and i+1 < len(args):
                stn_class = args[i+1]
        if not all([train, frm, to, date, stn_class]):
            print("Error: --train, --from, --to, --date, --class required")
            sys.exit(1)
        check_availability(train, frm, to, date, stn_class)

    elif cmd == "live":
        train = date = None
        for i, arg in enumerate(args):
            if arg == "--train" and i+1 < len(args):
                train = args[i+1]
            elif arg == "--date" and i+1 < len(args):
                date = args[i+1]
        if not train or not date:
            print("Error: --train, --date required")
            sys.exit(1)
        live_status(train, date)

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
