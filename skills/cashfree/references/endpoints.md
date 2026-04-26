# Cashfree API — Endpoint & Error Reference
# Base (sandbox):    https://sandbox.cashfree.com/pg
# Base (production): https://api.cashfree.com/pg
# API version:       2025-01-01 (v5, latest)
# Source: https://www.cashfree.com/docs/api-reference/payments/latest/overview

## Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Create order → get payment_session_id |
| GET  | /orders/{order_id} | Fetch order details + status |
| GET  | /orders/{order_id}/payments | All payment attempts for an order |
| GET  | /orders/{order_id}/payments/{cf_payment_id} | Specific payment by ID |
| GET  | /orders/{order_id}/settlements | Settlement for a paid order |
| GET  | /orders/{order_id}/refunds | All refunds for an order |

## Refunds
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders/{order_id}/refunds | Create a refund |
| GET  | /orders/{order_id}/refunds/{refund_id} | Fetch refund status |

## Payment Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /links | Create payment link |
| GET  | /links/{link_id} | Fetch link details |
| GET  | /links/{link_id}/orders | Orders created from a link |
| PATCH| /links/{link_id}/cancel | Cancel an active link |

## Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /settlements | All settlements (filter by date/UTR) |
| GET | /settlement/recon | Reconciliation by date range |

---

## Authentication Headers (required on every request)
```
x-client-id:     <your app ID>
x-client-secret: <your secret key>
x-api-version:   2025-01-01
Content-Type:    application/json
```

---

## Order Statuses
| Status | Meaning |
|--------|---------|
| ACTIVE | Created, awaiting payment |
| PAID | Payment successful ✅ |
| EXPIRED | Order expired (default 1hr) |
| TERMINATED | Manually cancelled |

## Payment Statuses
| Status | Meaning |
|--------|---------|
| SUCCESS | Payment captured ✅ |
| FAILED | Payment failed |
| PENDING | Payment in progress |
| USER_DROPPED | User abandoned checkout |
| VOID | Payment voided (preauth) |
| CANCELLED | Cancelled by user |

## Refund Statuses
| Status | Meaning |
|--------|---------|
| PENDING | Processing |
| SUCCESS | Refund complete (2-7 business days) |
| CANCELLED | Refund cancelled |
| ONHOLD | Under review |

---

## Common Error Codes
| Code | HTTP | Meaning | Fix |
|------|------|---------|-----|
| `authentication_error` | 401 | Wrong App ID or Secret | Check credentials in dashboard |
| `rate_limit_exceeded` | 429 | Too many requests | Back off, retry after 1s |
| `order_already_paid` | 400 | Order already paid | Check order status first |
| `invalid_request_error` | 400 | Bad params | Check required fields |
| `order_expiry` | 400 | Order has expired | Create a new order |
| `link_already_cancelled` | 400 | Link already cancelled | No action needed |
| `refund_amount_exceeded` | 400 | Refund > payment amount | Check original amount |

---

## Test Data (Sandbox only)
| Method | Success | Failure |
|--------|---------|---------|
| Card | `4111 1111 1111 1111` any expiry CVV `123` | `4111 1111 1111 1112` |
| UPI | `success@cashfree` | `failure@cashfree` |
| Net Banking | Select any bank, use shown test credentials | — |

Full test data: https://www.cashfree.com/docs/api-reference/payments/data-to-test-integration

---

## Key Rules
- `order_amount` is in **rupees** (not paise) — ₹499 = `499.00`
- `customer_phone` = 10 digits, NO `+91` prefix
- `order_id` max 50 chars, alphanumeric + `_` `-` only
- Order expires in **1 hour** by default — set `order_expiry_time` to override
- Refund window: **180 days** from payment date
- Webhook handlers must be **idempotent** — Cashfree retries on failure
