#!/usr/bin/env python3
"""Razorpay Payment Gateway CLI"""

import os
import json
import base64
import requests
import sys

BASE_URL = "https://api.razorpay.com/v1"

def get_auth():
    key_id = os.environ.get("RAZORPAY_KEY_ID")
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        print("Error: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Settings → Advanced")
        sys.exit(1)
    return base64.b64encode(f"{key_id}:{key_secret}".encode()).decode()

def create_order(amount, currency="INR", receipt=None):
    """Create a payment order"""
    auth = get_auth()
    data = {
        "amount": int(amount),  # in paise
        "currency": currency,
        "receipt": receipt or f"order_{int(os.time.time())}"
    }
    resp = requests.post(f"{BASE_URL}/orders", json=data, auth=(os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")))
    if resp.status_code == 200:
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def get_payment_status(payment_id):
    """Get payment details"""
    auth = get_auth()
    resp = requests.get(f"{BASE_URL}/payments/{payment_id}", auth=(os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")))
    if resp.status_code == 200:
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def create_refund(payment_id, amount=None):
    """Create refund for payment"""
    auth = get_auth()
    data = {}
    if amount:
        data["amount"] = int(amount)
    resp = requests.post(f"{BASE_URL}/payments/{payment_id}/refund", json=data, auth=(os.environ.get("RAZORPAY_KEY_ID"), os.environ.get("RAZORPAY_KEY_SECRET")))
    if resp.status_code == 200:
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 razorpay.py <command> [args]")
        print("Commands:")
        print("  create-order --amount <paise> [--currency INR]")
        print("  status --payment_id <id>")
        print("  refund --payment_id <id> [--amount <paise>]")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd == "create-order":
        amount = currency = receipt = None
        i = 0
        while i < len(args):
            if args[i] == "--amount" and i+1 < len(args):
                amount = args[i+1]
                i += 2
            elif args[i] == "--currency" and i+1 < len(args):
                currency = args[i+1]
                i += 2
            elif args[i] == "--receipt" and i+1 < len(args):
                receipt = args[i+1]
                i += 2
            else:
                i += 1
        if not amount:
            print("Error: --amount required")
            sys.exit(1)
        create_order(amount, currency, receipt)

    elif cmd == "status":
        payment_id = None
        for i, arg in enumerate(args):
            if arg == "--payment_id" and i+1 < len(args):
                payment_id = args[i+1]
        if not payment_id:
            print("Error: --payment_id required")
            sys.exit(1)
        get_payment_status(payment_id)

    elif cmd == "refund":
        payment_id = amount = None
        for i, arg in enumerate(args):
            if arg == "--payment_id" and i+1 < len(args):
                payment_id = args[i+1]
            elif arg == "--amount" and i+1 < len(args):
                amount = args[i+1]
        if not payment_id:
            print("Error: --payment_id required")
            sys.exit(1)
        create_refund(payment_id, amount)

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
