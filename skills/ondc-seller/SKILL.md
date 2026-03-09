---
name: ondc-seller
description: Deploy and manage ONDC seller applications. Set up seller reference apps with catalog management, order fulfillment, IGM support, and logistics integration. Handle provider registration, store operations, and ONDC protocol compliance for retail sellers.
compatibility: Created for Zo Computer
metadata:
  author: buckbuckbot.zo.computer
  category: commerce
  tags: ondc, seller, ecommerce, retail, india
---

# ONDC Seller Skill

This skill helps you deploy and manage ONDC (Open Network for Digital Commerce) seller applications. ONDC is India's digital commerce network enabling sellers to reach buyers across multiple platforms.

## What This Skill Does

- **Deploy ONDC Seller Apps**: Set up the complete seller reference application
- **Catalog Management**: Manage products, stores, inventory, and pricing
- **Order Processing**: Handle search, select, init, confirm, status, update, and cancel flows
- **Logistics Integration**: Connect with logistics providers for fulfillment
- **IGM Support**: Manage Issue & Grievance Management for customer complaints
- **Registry Operations**: Register with ONDC staging/production networks

## Architecture Overview

The ONDC Seller App uses microservice architecture:
- **seller-app**: Node.js backend API layer
- **seller-app-frontend**: React web application (served via nginx)
- **seller-app-protocol**: Python protocol layer for ONDC communication
- **seller-app-igm**: Node.js IGM service for issue management
- **seller-bugzilla-service**: Bugzilla integration for ticket management

## Prerequisites

Before using this skill, ensure you have:

1. **Docker & Docker Compose** installed
2. **Git** with submodule support
3. **Domain name** or ngrok for public endpoint
4. **Required service accounts**:
   - Firebase (authentication)
   - SMTP server (email notifications)
   - AWS S3 (asset storage)
   - Map My India (location services)
5. **ONDC Registry Access** (for production deployment)

## Quick Start

### 1. Clone and Initialize

```bash
cd /home/workspace
git clone https://github.com/ONDC-Official/seller-app-sdk.git ondc-seller-app
cd ondc-seller-app
git submodule init
git submodule update
```

### 2. Generate Cryptographic Keys

```bash
bun /home/workspace/Skills/ondc-seller/scripts/generate-keys.ts
```

This creates signing and encryption keys required for ONDC registration.

### 3. Configure Environment

```bash
bun /home/workspace/Skills/ondc-seller/scripts/setup-env.ts \
  --domain "https://yourdomain.com" \
  --firebase-key "YOUR_KEY" \
  --smtp-host "smtp.example.com" \
  --s3-bucket "your-bucket"
```

### 4. Deploy Locally (Development)

```bash
cd /home/workspace/ondc-seller-app
docker-compose -f docker-compose-for-local.yaml --env-file .env-local up -d
```

### 5. Register with ONDC

Once deployed, use the registration helper:

```bash
bun /home/workspace/Skills/ondc-seller/scripts/register.ts \
  --subscriber-url "https://yourdomain.com" \
  --signing-key "path/to/signing_public.pem" \
  --crypto-key "path/to/crypto_public.pem"
```

## Common Operations

### Check Application Status

```bash
bun /home/workspace/Skills/ondc-seller/scripts/check-status.ts
```

Shows the status of all services (seller-app, frontend, protocol, IGM).

### Manage Catalog

```bash
# View catalog summary
bun /home/workspace/Skills/ondc-seller/scripts/manage-catalog.ts --action list

# Enable/disable store
bun /home/workspace/Skills/ondc-seller/scripts/manage-catalog.ts --action toggle-store --store-id "STORE123"

# Update item availability
bun /home/workspace/Skills/ondc-seller/scripts/manage-catalog.ts --action update-item --item-id "ITEM456" --available true
```

### View Orders

```bash
# List recent orders
bun /home/workspace/Skills/ondc-seller/scripts/view-orders.ts --limit 10

# Get order details
bun /home/workspace/Skills/ondc-seller/scripts/view-orders.ts --order-id "ORDER123"

# Filter by status
bun /home/workspace/Skills/ondc-seller/scripts/view-orders.ts --status "Pending"
```

### Handle IGM Issues

```bash
# List open issues
bun /home/workspace/Skills/ondc-seller/scripts/manage-igm.ts --action list

# View issue details
bun /home/workspace/Skills/ondc-seller/scripts/manage-igm.ts --action view --issue-id "IGM123"

# Update issue status
bun /home/workspace/Skills/ondc-seller/scripts/manage-igm.ts --action update --issue-id "IGM123" --status "Resolved"
```

## Environment Variables

Key environment variables required (store in [Settings > Advanced](/?t=settings&s=advanced)):

```bash
# ONDC Registry
BAP_URL="https://yourdomain.com"
BAP_ID="yourdomain.com"
BAP_PRIVATE_KEY="signing_private_key"
BAP_PUBLIC_KEY="signing_public_key"
BAP_UNIQUE_KEY_ID="unique_key_id_from_registry"

# Firebase Auth
REACT_APP_FIREBASE_API_KEY="firebase_api_key"
REACT_APP_FIREBASE_AUTH_DOMAIN="yourdomain.com"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_AUTH_USERNAME="user"
SMTP_AUTH_PASSWORD="pass"
SMTP_EMAIL_SENDER="noreply@yourdomain.com"

# AWS S3
AWS_ACCESS_KEY_ID="aws_key"
AWS_SECRET_ACCESS_KEY="aws_secret"
S3_REGION="ap-south-1"
S3_BUCKET="your-bucket"

# Map My India
MMI_CLIENT_SECRET="mmi_secret"
MMI_CLIENT_ID="mmi_client_id"
MMI_ADVANCE_API_KEY="mmi_api_key"
```

## Feature Support Matrix

The ONDC Seller App implements ONDC Retail v1.2 specification:

| Feature | Status |
|---------|--------|
| Incremental catalog refresh | ✅ Available |
| Full catalog refresh | ✅ Available |
| Order tracking (hyperlocal GPS) | ✅ Available |
| Order tracking (inter-city) | ✅ Available |
| Search, Select, Init, Confirm | ✅ Available |
| Return with liquidation | ✅ Available |
| Merchant partial cancel | ✅ Available |
| RTO (Return to Origin) | ✅ Available |
| Customization (selection) | ✅ Available |
| Variants support | ✅ Available |
| Custom menu | ✅ Available |
| Off-network logistics | 🚧 Under Development |
| Self-pickup | 🚧 Under Development |
| Slotted delivery | 🚧 Under Development |
| Customization (free text) | 📅 Future scope |
| Static terms | 📅 Future scope |
| BNP + logistics integration | 📅 Future scope |

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker logs ondc-seller-app
docker logs ondc-seller-frontend
docker logs ondc-seller-protocol

# Restart specific service
docker-compose restart seller-app
```

### Registration Issues

- Verify signing keys are generated correctly
- Ensure domain is publicly accessible
- Check ONDC registry payload format
- Confirm all required fields in registration payload

### Catalog Not Syncing

- Check MongoDB connection
- Verify protocol layer is running
- Review `/on_search` webhook responses
- Check S3 bucket permissions for images

## Security Notes

- Store all secrets in Zo's [Settings > Advanced](/?t=settings&s=advanced)
- Never commit `.env` files to version control
- Rotate signing keys periodically
- Use HTTPS for all endpoints
- Implement rate limiting on public APIs
- Regular security audits of dependencies

## References

See the `references/` folder for:
- ONDC API Contract v1.2 documentation
- Seller app user manual
- Feature implementation guide
- Integration requirements

## Support

- ONDC Documentation: https://docs.ondc.org
- Seller App Repo: https://github.com/ONDC-Official/seller-app-sdk
- ONDC Slack: https://witsinnovationlab.slack.com/archives/C0280AR5CUQ
- Registry Form: https://forms.gle/registrationform

## When to Use This Skill

Use this skill when you need to:
- Deploy an ONDC-compliant seller application
- Integrate your inventory with ONDC network
- Manage multi-store retail operations on ONDC
- Handle orders, returns, and cancellations
- Troubleshoot ONDC protocol issues
- Scale seller operations across India
