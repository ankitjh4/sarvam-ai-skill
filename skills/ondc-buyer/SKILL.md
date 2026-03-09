---
name: ondc-buyer
description: Deploy and manage ONDC buyer applications. Set up buyer reference apps with product discovery, cart management, checkout flows, and order tracking. Handle payment integration, delivery tracking, and ONDC protocol compliance for consumer-facing applications.
compatibility: Created for Zo Computer
metadata:
  author: buckbuckbot.zo.computer
  category: commerce
  tags: ondc, buyer, ecommerce, retail, india, shopping
---

# ONDC Buyer Skill

This skill helps you deploy and manage ONDC (Open Network for Digital Commerce) buyer applications. ONDC is India's digital commerce network enabling buyers to discover and purchase from sellers across multiple platforms.

## What This Skill Does

- **Deploy ONDC Buyer Apps**: Set up the complete buyer reference application
- **Product Discovery**: Search and browse products across ONDC network
- **Shopping Cart**: Manage cart, apply customizations, and handle variants
- **Checkout Flow**: Handle select, init, confirm, and payment flows
- **Order Tracking**: Track orders in real-time with GPS/URL-based tracking
- **Returns & Cancellations**: Process returns, cancellations, and refunds
- **IGM Support**: File and track issues/complaints with sellers

## Architecture Overview

The ONDC Buyer App uses microservice architecture:
- **biap-client-node-js**: Node.js backend API layer
- **biap-app-ui-front**: React web application (served via nginx)
- **py-ondc-protocol**: Python protocol layer for ONDC communication
- **biap-igm-node-js**: Node.js IGM service for issue management
- **biap-bugzilla-service**: Bugzilla integration for ticket management
- **catalog-service**: Catalog indexing and search service

## Prerequisites

Before using this skill, ensure you have:

1. **Docker & Docker Compose** installed
2. **Git** with submodule support
3. **Domain name** or ngrok for public endpoint
4. **Required service accounts**:
   - Firebase (authentication)
   - Juspay or other payment gateway
   - Map My India (location services)
5. **MongoDB** (included in docker-compose)
6. **ONDC Registry Access** (for production deployment)

## Quick Start

### 1. Clone and Initialize

```bash
cd /home/workspace
git clone https://github.com/ONDC-Official/ondc-sdk.git ondc-buyer-app
cd ondc-buyer-app
git submodule init
git submodule update
```

### 2. Generate Cryptographic Keys

```bash
bun /home/workspace/Skills/ondc-buyer/scripts/generate-keys.ts
```

This creates signing and encryption keys required for ONDC registration.

### 3. Configure Environment

```bash
bun /home/workspace/Skills/ondc-buyer/scripts/setup-env.ts \
  --domain "https://buyerapp.example.com" \
  --firebase-key "YOUR_KEY" \
  --juspay-merchant-id "MERCHANT_ID" \
  --mmi-client-id "MMI_CLIENT"
```

### 4. Deploy Locally (Development)

```bash
cd /home/workspace/ondc-buyer-app
docker-compose -f docker-compose-for-local.yaml --env-file .env-local up -d
```

Access the app at `http://localhost` (or your configured domain).

### 5. Register with ONDC

Once deployed, use the registration helper:

```bash
bun /home/workspace/Skills/ondc-buyer/scripts/register.ts \
  --subscriber-url "https://buyerapp.example.com" \
  --signing-key "path/to/signing_public.pem" \
  --crypto-key "path/to/crypto_public.pem"
```

## Common Operations

### Check Application Status

```bash
bun /home/workspace/Skills/ondc-buyer/scripts/check-status.ts
```

Shows the status of all services (client, frontend, protocol, IGM, catalog).

### Search Products

```bash
# Search across ONDC network
bun /home/workspace/Skills/ondc-buyer/scripts/search.ts --query "smartphones" --city "Bangalore"

# Search by category
bun /home/workspace/Skills/ondc-buyer/scripts/search.ts --category "Grocery" --location "110001"

# Get provider details
bun /home/workspace/Skills/ondc-buyer/scripts/search.ts --provider-id "PROVIDER123"
```

### Manage Orders

```bash
# List user orders
bun /home/workspace/Skills/ondc-buyer/scripts/view-orders.ts --user-id "USER123" --limit 10

# Get order details and tracking
bun /home/workspace/Skills/ondc-buyer/scripts/view-orders.ts --order-id "ORDER456"

# Track order status
bun /home/workspace/Skills/ondc-buyer/scripts/track-order.ts --order-id "ORDER456"
```

### Handle Returns & Cancellations

```bash
# Initiate cancellation
bun /home/workspace/Skills/ondc-buyer/scripts/cancel-order.ts --order-id "ORDER789" --reason "Changed mind"

# Request return
bun /home/workspace/Skills/ondc-buyer/scripts/return-order.ts --order-id "ORDER789" --items "ITEM1,ITEM2"

# Check cancellation status
bun /home/workspace/Skills/ondc-buyer/scripts/check-cancellation.ts --order-id "ORDER789"
```

### Manage IGM Issues

```bash
# List user issues
bun /home/workspace/Skills/ondc-buyer/scripts/manage-igm.ts --action list --user-id "USER123"

# File new issue
bun /home/workspace/Skills/ondc-buyer/scripts/manage-igm.ts --action create \
  --order-id "ORDER123" \
  --type "PRODUCT_QUALITY" \
  --description "Product damaged"

# Track issue status
bun /home/workspace/Skills/ondc-buyer/scripts/manage-igm.ts --action track --issue-id "IGM456"
```

## Environment Variables

Key environment variables required (store in [Settings > Advanced](/?t=settings&s=advanced)):

```bash
# ONDC Registry
BAP_URL="https://buyerapp.example.com"
BAP_ID="buyerapp.example.com"
BAP_PRIVATE_KEY="signing_private_key"
BAP_PUBLIC_KEY="signing_public_key"
BAP_UNIQUE_KEY_ID="unique_key_id_from_registry"

# Firebase Auth
FIREBASE_ADMIN_SERVICE_ACCOUNT="/path/to/firebase-service-account.json"
REACT_APP_FIREBASE_API_KEY="firebase_api_key"
REACT_APP_FIREBASE_AUTH_DOMAIN="buyerapp.example.com"

# Juspay Payment Gateway
JUSPAY_SECRET_KEY_PATH="/path/to/juspay-creds.pem"
JUSPAY_BASE_URL="https://sandbox.juspay.in"
JUSPAY_MERCHANT_ID="merchant_id"
JUSPAY_API_KEY="access_key"
JUSPAY_WEBHOOK_USERNAME="webhook_user"
JUSPAY_WEBHOOK_PASSWORD="webhook_pass"

# Web App Payment Config
REACT_APP_JUSTPAY_CLIENT_AND_MERCHANT_KEY="merchant_id"
REACT_APP_MERCHANT_KEY_ID="merchant_id"
REACT_APP_PAYMENT_SDK_ENV="sandbox"
REACT_APP_PAYMENT_SERVICE_URL="https://api.juspay.in"

# Map My India
MMI_CLIENT_SECRET="mmi_secret"
MMI_CLIENT_ID="mmi_client_id"
MMI_ADVANCE_API_KEY="mmi_api_key"

# MongoDB
MONGO_DB_URL="mongodb://mongo:27017/ondc"
```

## Feature Support Matrix

The ONDC Buyer App implements ONDC Retail v1.2 specification:

| Feature | Status |
|---------|--------|
| Incremental catalog refresh | ✅ Available |
| Full catalog refresh | ✅ Available |
| Product search & discovery | ✅ Available |
| Shopping cart management | ✅ Available |
| Checkout flow (select/init/confirm) | ✅ Available |
| Payment integration (Juspay) | ✅ Available |
| Order tracking (GPS-based) | ✅ Available |
| Live order tracking | ✅ Available |
| Customization (selection) | ✅ Available |
| Variants support | ✅ Available |
| Return with liquidation | ✅ Available |
| Cancellation flows | ✅ Available |
| RTO (Return to Origin) | ✅ Available |
| IGM issue management | ✅ Available |
| Order history | ✅ Available |
| Multi-store cart | ✅ Available |
| Address management | ✅ Available |
| Customization (free text) | 📅 Future scope |
| Subscription orders | 📅 Future scope |
| Offers & discounts | 📅 Future scope |

## Payment Gateway Integration

### Juspay Setup

1. Create account at https://dashboard.juspay.in
2. Generate API credentials from console
3. Download merchant certificate (.pem file)
4. Configure environment variables
5. Set up webhook endpoints for payment callbacks

### Alternative Payment Gateways

To integrate other payment gateways (Razorpay, Paytm, etc.):

```bash
# Modify payment service integration
vim /home/workspace/ondc-buyer-app/biap-client-node-js/src/payment/
```

Update the payment service to match your gateway's API.

## Map My India Integration

MMI provides:
- Address autocomplete
- PIN code lookup
- State/city detection
- Geocoding (lat/long from address)

Required APIs:
- `https://outpost.mapmyindia.com/api` - Authentication
- `https://atlas.mapmyindia.com/api/places/search/json` - Search
- `https://explore.mappls.com` - Explore places
- `https://apis.mapmyindia.com/advancedmaps/v1` - Advanced mapping
- `https://atlas.mappls.com/api/places/geocode` - Geocoding

## Bugzilla Setup (Optional)

For IGM ticket management:

1. After deployment, visit `https://yourdomain.com/bugzilla/admin`
2. Login with username `admin` and password `password`
3. Configure SMTP settings for email notifications
4. Generate API key from dashboard
5. Add `BUGZILLA_API_KEY` to environment variables
6. Restart bugzilla container

**Note**: Bugzilla is optional but recommended for full IGM functionality.

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker logs ondc-buyer-client
docker logs ondc-buyer-frontend
docker logs ondc-buyer-protocol
docker logs ondc-catalog-service

# Restart specific service
docker-compose restart biap-client-node-js
```

### Search Not Working

- Verify protocol layer is running
- Check ONDC registry connectivity
- Review `/search` request/response logs
- Ensure catalog service is indexed

### Payment Failures

- Verify Juspay credentials
- Check webhook configuration
- Review payment service logs
- Test with Juspay sandbox first

### Order Tracking Issues

- Confirm seller provides tracking URLs
- Check GPS coordinate format
- Verify `/track` endpoint responses
- Review order status updates

## Security Notes

- Store all secrets in Zo's [Settings > Advanced](/?t=settings&s=advanced)
- Never commit `.env` files or credentials to version control
- Use HTTPS for all endpoints
- Implement rate limiting on public APIs
- Validate payment webhook signatures
- Sanitize user inputs
- Regular security audits

## Deployment Options

### Local Development (with ngrok)

```bash
# Install ngrok
brew install --cask ngrok

# Start tunnel
ngrok http 5555

# Use ngrok URL in BAP_URL and PROTOCOL_BASE_URL
```

### Production Deployment (with SSL)

```bash
# Use docker-compose with SSL
docker-compose -f docker-compose.yaml --env-file .env-prod up -d

# Initialize Let's Encrypt
./init-letsencrypt.sh
```

### Ansible Deployment

```bash
cd deploying_ansible
ansible-playbook -i ansible_hosts buyer-app-install-for-ssl.yaml
ansible-playbook -i ansible_hosts buyer-app-run.yaml
```

## References

See the `references/` folder for:
- ONDC API Contract v1.2 documentation
- Buyer app user manual
- Feature implementation guide
- Integration requirements
- Payment gateway setup guides

## Support

- ONDC Documentation: https://docs.ondc.org
- Buyer App Repo: https://github.com/ONDC-Official/ondc-sdk
- ONDC Slack: https://witsinnovationlab.slack.com/archives/C0280AR5CUQ
- Registry Form: https://forms.gle/registrationform
- Juspay Docs: https://developer.juspay.in

## When to Use This Skill

Use this skill when you need to:
- Deploy an ONDC-compliant buyer application
- Build a consumer-facing shopping experience on ONDC
- Integrate payment gateways with ONDC flows
- Implement product search and discovery
- Handle end-to-end order management
- Process returns and cancellations
- File and track customer issues (IGM)
- Scale buyer operations across India
