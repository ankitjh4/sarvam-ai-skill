---
name: rapido
description: "Rapido ride-booking API integration for India — location search, geocoding, fare estimates, ride booking, tracking, and wallet management. Reverse-engineered from Rapido PWA. Use when the user wants to search locations via Rapido, geocode Indian addresses, book a Rapido ride, check Rapido fares, or interact with the Rapido platform."
compatibility: Created for Zo Computer
metadata:
  author: buckbuckbot.zo.computer
  category: transport
  tags: rapido, rides, booking, india, bikes, autos
---

# Rapido Ride Booking

API integration for Rapido — India's largest bike taxi service.

> **Status (March 2026):** Location search and geocoding work. Fare estimates and booking return encoded binary due to a protobuf schema change — a new HAR capture is needed to restore full functionality.

## Working Features

### Location Search

```bash
# Autocomplete
bun scripts/rapido.ts autocomplete --query "Horamavu"

# Geocode place ID to coordinates
bun scripts/rapido.ts geocode --place-id "ChIJ99zGooERrjsRzoxiOwCEUhQ"
```

## Authentication Flow

1. **Generate OTP** — `bun scripts/rapido.ts auth --mobile "9876543210"`
2. **Enter OTP** when prompted — receives JWT token and userId
3. **Use token** — all authenticated requests need header `x-consumer-username: {userId}:`

## Full Command Reference

```bash
# Install dependencies
bun init -y && bun add axios

# Fare estimate (currently returns encoded response)
bun scripts/rapido.ts fare-estimate \
  --from-lat "13.0401" --from-lng "77.6635" \
  --to-lat "12.9756" --to-lng "77.6027"

# Book a ride
bun scripts/rapido.ts book \
  --from-lat "13.0401" --from-lng "77.6635" --from-name "Horamavu" \
  --to-lat "12.9756" --to-lng "77.6027" --to-name "Church Street"

# Track / cancel / wallet
bun scripts/rapido.ts track --order-id "ORDER_ID"
bun scripts/rapido.ts cancel --order-id "ORDER_ID"
bun scripts/rapido.ts wallet
```

## Key API Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /unup/autocomplete/location` | No | Location search |
| `POST /unup/location/geocode/placeId` | No | Geocode place ID |
| `POST /auth/generateOtp` | No | OTP generation |
| `POST /auth/verifyOtp` | No | OTP verification |
| `POST /pricing/getFareEstimate` | Yes | Fare estimates |
| `POST /order/book` | Yes | Book ride |
| `POST /order/cancel` | Yes | Cancel ride |
| `POST /location/riderEta` | Yes | Live tracking |
| `POST /wallet/balance` | Yes | Wallet balance |

**Base URL:** `https://m.rapido.bike/pwa/api`

## SDK

See `scripts/rapido.ts` for the complete TypeScript SDK covering authentication, fare estimation, booking, tracking, cancellation, and wallet management.
