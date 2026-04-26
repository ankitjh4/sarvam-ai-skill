"""
cashfree_client.py
------------------
Reusable Cashfree Payment Gateway client.
Docs:    https://www.cashfree.com/docs/api-reference/payments/latest/overview
Version: v2025-01-01 (latest)

Install: pip install cashfree-pg
Setup:
    export CASHFREE_APP_ID="your_app_id"
    export CASHFREE_SECRET_KEY="your_secret_key"
    export CASHFREE_ENV="TEST"   # or PRODUCTION

Usage:
    from cashfree_client import CashfreeClient
    cf = CashfreeClient()

    order  = cf.create_order(499.00, "cust_001", "9876543210")
    status = cf.get_order_status(order["order_id"])
    link   = cf.create_payment_link(999.00, "Rahul", "9876543210")
    refund = cf.refund_order(order["order_id"], 499.00, "refund_001")
"""

import os
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
from cashfree_pg.models.create_link_request import CreateLinkRequest
from cashfree_pg.models.link_customer_details_entity import LinkCustomerDetailsEntity
from cashfree_pg.models.link_notify_entity import LinkNotifyEntity
from cashfree_pg.models.order_meta import OrderMeta
from cashfree_pg.models.create_order_refund_request import CreateOrderRefundRequest
from cashfree_pg.api_client import ApiClient
from cashfree_pg.configuration import Configuration
from cashfree_pg import Cashfree

# ── Setup ─────────────────────────────────────────────────────────────────────

Cashfree.XClientId     = os.environ.get("CASHFREE_APP_ID", "")
Cashfree.XClientSecret = os.environ.get("CASHFREE_SECRET_KEY", "")
Cashfree.XEnvironment  = (
    Cashfree.XSandbox if os.environ.get("CASHFREE_ENV", "TEST") == "TEST"
    else Cashfree.XProduction
)
X_API_VERSION = "2025-01-01"


class CashfreeClient:

    def __init__(self, app_id: str = None, secret_key: str = None, env: str = None):
        if app_id:     Cashfree.XClientId     = app_id
        if secret_key: Cashfree.XClientSecret = secret_key
        if env:
            Cashfree.XEnvironment = (
                Cashfree.XSandbox if env.upper() == "TEST" else Cashfree.XProduction
            )

    # ── Orders ────────────────────────────────────────────────────────────────

    def create_order(self, amount: float, customer_id: str, customer_phone: str,
                     customer_name: str = "", customer_email: str = "",
                     order_id: str = None, return_url: str = None,
                     notify_url: str = None, note: str = "") -> dict:
        """
        Create a Cashfree payment order.
        Args:
            amount:         Order amount in rupees (e.g. 499.00 for ₹499)
            customer_id:    Your internal customer ID
            customer_phone: 10-digit mobile number (no +91)
            customer_name:  Customer's full name
            customer_email: Customer's email
            order_id:       Your unique order ID (auto-generated if None)
            return_url:     Redirect URL after payment ({order_id} will be appended)
            notify_url:     Webhook URL for async payment events
            note:           Optional order note
        Returns:
            dict with order_id, payment_session_id, cf_order_id, order_status
        """
        customer = CustomerDetails(
            customer_id=customer_id,
            customer_phone=customer_phone,
            customer_name=customer_name or None,
            customer_email=customer_email or None
        )

        meta = OrderMeta(
            return_url=return_url or "https://yourapp.com/payment?order_id={order_id}",
            notify_url=notify_url or None
        )

        req = CreateOrderRequest(
            order_amount=amount,
            order_currency="INR",
            customer_details=customer,
            order_meta=meta,
            order_note=note or None
        )
        if order_id:
            req.order_id = order_id

        resp = Cashfree().PGCreateOrder(X_API_VERSION, req)
        data = resp.data
        print(f"Order created: {data.order_id} | ₹{amount} | {data.order_status}")
        return {
            "order_id":           data.order_id,
            "payment_session_id": data.payment_session_id,
            "cf_order_id":        data.cf_order_id,
            "order_status":       data.order_status,
            "order_expiry_time":  str(data.order_expiry_time)
        }

    def get_order_status(self, order_id: str) -> dict:
        """
        Fetch order details and current status.
        Returns dict with order_status: PAID | ACTIVE | EXPIRED | TERMINATED
        """
        resp = Cashfree().PGFetchOrder(X_API_VERSION, order_id)
        data = resp.data
        print(f"Order {order_id}: {data.order_status}")
        return {
            "order_id":     data.order_id,
            "order_status": data.order_status,
            "order_amount": data.order_amount,
            "cf_order_id":  data.cf_order_id
        }

    def get_order_payments(self, order_id: str) -> list:
        """Get all payment attempts for an order."""
        resp = Cashfree().PGOrderFetchPayments(X_API_VERSION, order_id)
        payments = []
        for p in (resp.data or []):
            payments.append({
                "cf_payment_id":  p.cf_payment_id,
                "payment_status": p.payment_status,
                "payment_amount": p.order_amount,
                "payment_method": str(p.payment_method)
            })
            print(f"  Payment {p.cf_payment_id}: {p.payment_status} ₹{p.order_amount}")
        return payments

    # ── Refunds ───────────────────────────────────────────────────────────────

    def refund_order(self, order_id: str, refund_amount: float,
                     refund_id: str, note: str = "") -> dict:
        """
        Initiate a refund for a PAID order.
        Args:
            order_id:      The original order ID
            refund_amount: Amount to refund in rupees (can be partial)
            refund_id:     Your unique refund ID
            note:          Reason for refund
        Returns:
            dict with refund_id, refund_status, refund_amount
        """
        req = CreateOrderRefundRequest(
            refund_amount=refund_amount,
            refund_id=refund_id,
            refund_note=note or None
        )
        resp = Cashfree().PGOrderCreateRefund(X_API_VERSION, order_id, req)
        data = resp.data
        print(f"Refund {refund_id}: {data.refund_status} ₹{refund_amount}")
        return {
            "refund_id":     data.refund_id,
            "refund_status": data.refund_status,
            "refund_amount": data.refund_amount,
            "cf_refund_id":  data.cf_refund_id
        }

    def get_refund_status(self, order_id: str, refund_id: str) -> dict:
        """Fetch status of a specific refund."""
        resp = Cashfree().PGOrderFetchRefund(X_API_VERSION, order_id, refund_id)
        data = resp.data
        print(f"Refund {refund_id}: {data.refund_status}")
        return {
            "refund_id":     data.refund_id,
            "refund_status": data.refund_status,
            "refund_amount": data.refund_amount
        }

    # ── Payment Links ─────────────────────────────────────────────────────────

    def create_payment_link(self, amount: float, customer_name: str,
                             customer_phone: str, customer_email: str = "",
                             link_id: str = None, purpose: str = "",
                             send_sms: bool = True, send_email: bool = True,
                             expiry: str = None) -> dict:
        """
        Create a shareable payment link (no checkout integration needed).
        Returns dict with link_id and link_url to share with customer.
        """
        customer = LinkCustomerDetailsEntity(
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email or None
        )
        notify = LinkNotifyEntity(send_sms=send_sms, send_email=send_email)

        req = CreateLinkRequest(
            link_amount=amount,
            link_currency="INR",
            link_purpose=purpose or "Payment",
            customer_details=customer,
            link_notify=notify,
            link_expiry_time=expiry or None,
            link_partial_payments=False
        )
        if link_id:
            req.link_id = link_id

        resp = Cashfree().PGCreateLink(X_API_VERSION, req)
        data = resp.data
        print(f"Link created: {data.link_url}")
        return {
            "link_id":     data.link_id,
            "link_url":    data.link_url,
            "link_status": data.link_status
        }

    def cancel_payment_link(self, link_id: str) -> dict:
        """Cancel an active payment link."""
        resp = Cashfree().PGCancelLink(X_API_VERSION, link_id)
        data = resp.data
        print(f"Link {link_id} cancelled: {data.link_status}")
        return {"link_id": data.link_id, "link_status": data.link_status}

    # ── Webhook Verification ──────────────────────────────────────────────────

    @staticmethod
    def verify_webhook(timestamp: str, signature: str,
                       raw_body: bytes, secret: str = None) -> bool:
        """
        Verify Cashfree webhook signature.
        Args:
            timestamp:  Value of x-webhook-timestamp header
            signature:  Value of x-webhook-signature header
            raw_body:   Raw request body bytes (don't parse JSON first)
            secret:     Secret key (uses env var if not provided)
        Returns:
            True if valid, False if tampered
        """
        import hmac, hashlib, base64
        key = secret or os.environ["CASHFREE_SECRET_KEY"]
        message = timestamp + raw_body.decode()
        computed = base64.b64encode(
            hmac.new(key.encode(), message.encode(), hashlib.sha256).digest()
        ).decode()
        return hmac.compare_digest(computed, signature)
