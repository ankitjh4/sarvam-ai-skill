#!/usr/bin/env python3
"""PhonePe UPI Payment CLI"""

import os
import json
import hashlib
import requests
import sys
import uuid
from datetime import datetime, timedelta

def get_config():
    merchant_id = os.environ.get("PHONEPE_MERCHANT_ID")
    salt_key = os.environ.get("PHONEPE_SALT_KEY")
    env = os.environ.get("PHONEPE_ENV", "sandbox")

    if not merchant_id or not salt_key:
        print("Error: Set PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY in Settings → Advanced")
        sys.exit(1)

    base_url = "https://api-preprod.phonepe.com" if env == "sandbox" else "https://api.phonepe.com"
    return merchant_id, salt_key, base_url

def create_x_verify(endpoint, body):
    """Generate X-Verify header"""
    salt_key = os.environ.get("PHONEPE_SALT_KEY")
    payload = json.dumps(body, separators=(',', ':'))
    payload_hash = hashlib.sha256(payload.encode()).hexdigest()
    string_to_hash = f"{payload_hash}/v1/{endpoint}{salt_key}"
    x_verify = hashlib.sha256(string_to_hash.encode()).hexdigest() + "###1"
    return x_verify

def create_payment_link(amount, phone, name, merchant_order_id=None):
    """Create a payment link"""
    merchant_id, salt_key, base_url = get_config()
    order_id = merchant_order_id or f"order_{uuid.uuid4().hex[:12]}"

    endpoint = f"apis/pg/paylinks/v1/pay"
    body = {
        "merchantOrderId": order_id,
        "amount": int(amount),
        "paymentFlow": {
            "type": "PAYLINK",
            "customerDetails": {
                "name": name,
                "phoneNumber": phone
            }
        }
    }
    headers = {
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchant_id,
        "X-Verify": create_x_verify(endpoint, body)
    }

    resp = requests.post(f"{base_url}/{endpoint}", json=body, headers=headers)
    if resp.status_code == 200:
        result = resp.json()
        print(json.dumps(result, indent=2))
        if result.get("success"):
            print(f"\nPayment Link: {result.get('data', {}).get('shortUrl')}")
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def check_payment_status(merchant_order_id):
    """Check payment status"""
    merchant_id, salt_key, base_url = get_config()
    endpoint = f"apis/pg/paylinks/v1/status/{merchant_order_id}"
    headers = {
        "X-MERCHANT-ID": merchant_id,
        "X-Verify": create_x_verify(endpoint, {})
    }

    resp = requests.get(f"{base_url}/{endpoint}", headers=headers)
    if resp.status_code == 200:
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

def validate_vpa(vpa):
    """Validate UPI VPA"""
    merchant_id, salt_key, base_url = get_config()
    endpoint = f"apis/pg/v2/validate/upi"
    body = {"type": "VPA", "vpa": vpa}
    headers = {
        "Content-Type": "application/json",
        "X-MERCHANT-ID": merchant_id,
        "X-Verify": create_x_verify(endpoint, body)
    }

    resp = requests.post(f"{base_url}/{endpoint}", json=body, headers=headers)
    if resp.status_code == 200:
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 phonepe.py <command> [args]")
        print("Commands:")
        print("  payment-link --amount <paise> --phone <number> --name <name>")
        print("  status --merchant_order_id <id>")
        print("  validate-vpa --vpa <upi-id>")
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd == "payment-link":
        amount = phone = name = order_id = None
        i = 0
        while i < len(args):
            if args[i] == "--amount" and i+1 < len(args):
                amount = args[i+1]
                i += 2
            elif args[i] == "--phone" and i+1 < len(args):
                phone = args[i+1]
                i += 2
            elif args[i] == "--name" and i+1 < len(args):
                name = args[i+1]
                i += 2
            elif args[i] == "--merchant_order_id" and i+1 < len(args):
                order_id = args[i+1]
                i += 2
            else:
                i += 1
        if not amount or not phone or not name:
            print("Error: --amount, --phone, --name required")
            sys.exit(1)
        create_payment_link(amount, phone, name, order_id)

    elif cmd == "status":
        order_id = None
        for i, arg in enumerate(args):
            if arg == "--merchant_order_id" and i+1 < len(args):
                order_id = args[i+1]
        if not order_id:
            print("Error: --merchant_order_id required")
            sys.exit(1)
        check_payment_status(order_id)

    elif cmd == "validate-vpa":
        vpa = None
        for i, arg in enumerate(args):
            if arg == "--vpa" and i+1 < len(args):
                vpa = args[i+1]
        if not vpa:
            print("Error: --vpa required")
            sys.exit(1)
        validate_vpa(vpa)

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
