# ONDC Buyer App References

## Official Documentation

- **User Manual**: https://docs.google.com/document/d/1pGPZ0jwQH9AP0rdZXUcdv8B1QZudr86W3qjABsrlEso/edit
- **API Contract v1.2**: https://docs.google.com/document/d/1brvcltG_DagZ3kGr1ZZQk4hG4tze3zvcxmGV4NMTzr8/edit
- **GitHub Repository**: https://github.com/ONDC-Official/ondc-sdk
- **ONDC Docs**: https://docs.ondc.org

## Key Components

### 1. Buyer Client (Node.js)
- **Repository**: https://github.com/ONDC-Official/biap-client-node-js
- **Language**: Node.js v16
- **Purpose**: Backend API layer for buyer operations
- **Key Features**:
  - Product search
  - Cart management
  - Order placement
  - Payment processing

### 2. Buyer Frontend (React)
- **Repository**: https://github.com/ONDC-Official/biap-app-ui-front
- **Language**: React JS v17
- **Purpose**: Web UI for buyers
- **Key Features**:
  - Product catalog
  - Shopping cart
  - Checkout flow
  - Order tracking

### 3. Protocol Layer (Python)
- **Repository**: https://github.com/ONDC-Official/py-protocol-layer
- **Language**: Python v3.7
- **Purpose**: ONDC protocol implementation
- **Key Features**:
  - Beckn protocol compliance
  - Request/response validation
  - Signature verification
  - Message encryption

### 4. IGM Service (Node.js)
- **Repository**: https://github.com/ONDC-Official/biap-igm-node-js
- **Language**: Node.js
- **Purpose**: Issue & Grievance Management
- **Key Features**:
  - Issue filing
  - Complaint tracking
  - Resolution status
  - Seller communication

### 5. Catalog Service (Node.js)
- **Repository**: https://github.com/ONDC-Official/catalog-service
- **Language**: Node.js
- **Purpose**: Catalog indexing and search
- **Key Features**:
  - Product indexing
  - Fast search
  - Filter and sort
  - Cache management

### 6. Bugzilla Service
- **Repository**: https://github.com/ONDC-Official/biap-bugzilla-service
- **Language**: Node.js
- **Purpose**: Bugzilla API wrapper
- **Key Features**:
  - Ticket creation
  - Status tracking
  - Comment management
  - Search and filtering

## Environment Setup

### Required Services

1. **Firebase** - Authentication
   - Email/Password
   - Phone OTP
   - Google Sign-in

2. **Juspay** - Payment Gateway
   - Card payments
   - UPI
   - Net banking
   - Wallets

3. **Map My India** - Location Services
   - Address autocomplete
   - PIN code lookup
   - Geocoding
   - Delivery radius

4. **MongoDB** - Database
   - User profiles
   - Cart data
   - Order history
   - Search cache

### Database Schema

**MongoDB Collections**:
- `users` - Buyer accounts
- `carts` - Shopping carts
- `orders` - Order history
- `addresses` - Delivery addresses
- `payments` - Payment transactions
- `issues` - IGM tickets
- `catalog_cache` - Cached products

## API Endpoints

### Buyer Client APIs

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/search
POST   /api/v1/cart
GET    /api/v1/cart
PUT    /api/v1/cart/:id
DELETE /api/v1/cart/:id
POST   /api/v1/checkout/select
POST   /api/v1/checkout/init
POST   /api/v1/checkout/confirm
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/track
POST   /api/v1/orders/:id/cancel
POST   /api/v1/orders/:id/return
POST   /api/v1/issues
GET    /api/v1/issues/:id
```

### ONDC Protocol APIs (Beckn)

```
POST   /on_search        - Receive search results
POST   /on_select        - Receive quote
POST   /on_init          - Receive order draft
POST   /on_confirm       - Receive order confirmation
POST   /on_status        - Receive status updates
POST   /on_track         - Receive tracking info
POST   /on_cancel        - Receive cancellation
POST   /on_update        - Receive updates
POST   /on_rating        - Rating acknowledgment
POST   /on_support       - Support response
```

## Registration Process

1. **Generate Keys**
   ```bash
   openssl genpkey -algorithm ED25519 -out signing_private.pem
   openssl pkey -in signing_private.pem -pubout -out signing_public.pem
   openssl genpkey -algorithm X25519 -out crypto_private.pem
   openssl pkey -in crypto_private.pem -pubout -out crypto_public.pem
   ```

2. **Create Registration Payload**
   ```json
   {
     "country": "IND",
     "city": "*",
     "type": "BAP",
     "subscriber_id": "https://buyerapp.example.com",
     "subscriber_url": "https://buyerapp.example.com",
     "domain": "nic2004:52110",
     "signing_public_key": "<SIGNING_PUBLIC_KEY>",
     "encr_public_key": "<CRYPTO_PUBLIC_KEY>",
     "created": "2024-01-01T00:00:00.000Z",
     "valid_from": "2024-01-01T00:00:00.000Z",
     "valid_until": "2034-01-01T00:00:00.000Z",
     "updated": "2024-01-01T00:00:00.000Z"
   }
   ```

3. **Submit to ONDC Registry**
   - Form: https://forms.gle/registrationform
   - Approval time: 2-3 business days
   - Receive: ukId (unique key ID)

4. **Configure Environment**
   ```bash
   BAP_UNIQUE_KEY_ID=<received-ukid>
   BAP_PRIVATE_KEY=<signing-private-key>
   BAP_PUBLIC_KEY=<signing-public-key>
   ```

## Payment Integration

### Juspay Setup

1. **Create Account**
   - Visit: https://dashboard.juspay.in
   - Sign up for merchant account
   - Complete KYC

2. **Generate Credentials**
   - API Key from console
   - Merchant ID
   - Download certificate (.pem)

3. **Configure Webhooks**
   - Payment success: `/api/v1/payment/success`
   - Payment failure: `/api/v1/payment/failure`
   - Webhook auth: Username + Password

4. **Environment Variables**
   ```bash
   JUSPAY_MERCHANT_ID=your_merchant_id
   JUSPAY_API_KEY=your_api_key
   JUSPAY_SECRET_KEY_PATH=/path/to/cert.pem
   JUSPAY_BASE_URL=https://sandbox.juspay.in
   JUSPAY_WEBHOOK_USERNAME=webhook_user
   JUSPAY_WEBHOOK_PASSWORD=webhook_pass
   ```

5. **Frontend Config**
   ```bash
   REACT_APP_JUSTPAY_CLIENT_AND_MERCHANT_KEY=merchant_id
   REACT_APP_MERCHANT_KEY_ID=merchant_id
   REACT_APP_PAYMENT_SDK_ENV=sandbox
   REACT_APP_PAYMENT_SERVICE_URL=https://api.juspay.in
   ```

### Testing Payment Flow

1. Use Juspay test cards:
   - Success: 4111 1111 1111 1111
   - Failure: 4000 0000 0000 0002
   - CVV: 123
   - Expiry: Any future date

2. Test UPI:
   - UPI ID: success@upi
   - UPI ID: failure@upi

## Map My India Integration

### Required APIs

1. **Authentication**
   - Endpoint: `https://outpost.mapmyindia.com/api`
   - Get access token

2. **Place Search**
   - Endpoint: `https://atlas.mapmyindia.com/api/places/search/json`
   - Autocomplete addresses

3. **Geocoding**
   - Endpoint: `https://atlas.mappls.com/api/places/geocode`
   - Get lat/long from address

4. **Reverse Geocoding**
   - Endpoint: `https://apis.mapmyindia.com/advancedmaps/v1`
   - Get address from lat/long

### Environment Variables

```bash
MMI_CLIENT_ID=your_client_id
MMI_CLIENT_SECRET=your_client_secret
MMI_ADVANCE_API_KEY=your_api_key
```

## Deployment Options

### 1. Local Development (ngrok)
```bash
# Install ngrok
brew install --cask ngrok

# Start tunnel
ngrok http 5555

# Use ngrok URL
BAP_URL=https://abc123.ngrok.io
PROTOCOL_BASE_URL=https://abc123.ngrok.io
```

### 2. Staging Deployment
```bash
# Without SSL
docker-compose -f docker-compose-without-ssl.yaml --env-file .env-staging up -d
```

### 3. Production Deployment
```bash
# With Let's Encrypt SSL
./init-letsencrypt.sh
docker-compose -f docker-compose.yaml --env-file .env-prod up -d
```

### 4. Ansible Deployment
```bash
cd deploying_ansible
ansible-playbook -i ansible_hosts buyer-app-install-for-ssl.yaml
ansible-playbook -i ansible_hosts buyer-app-run.yaml
```

## Shopping Flow

### 1. Product Discovery
```
User searches → /search API → ONDC network
← /on_search with results ← Sellers
Display products to user
```

### 2. Add to Cart
```
User adds item → Local cart storage
User modifies quantity → Update cart
User proceeds to checkout → /select API
```

### 3. Get Quote
```
/select API → Selected items to seller
← /on_select with quote ← Seller
Display price breakdown to user
```

### 4. Initialize Order
```
User confirms → /init API with delivery address
← /on_init with payment methods ← Seller
Show payment options
```

### 5. Payment
```
User pays → Juspay payment gateway
← Payment success/failure ← Juspay
Webhook notification received
```

### 6. Confirm Order
```
Payment success → /confirm API
← /on_confirm with order details ← Seller
Show order confirmation
```

### 7. Track Order
```
User checks status → /status API
← /on_status with fulfillment updates ← Seller
Display tracking info

User tracks → /track API
← /on_track with live location ← Seller
Show map with delivery partner
```

## Troubleshooting

### Common Issues

1. **Search Returns No Results**
   - Check protocol layer connectivity
   - Verify registry configuration
   - Review /search request format
   - Check seller availability in area

2. **Payment Failures**
   - Verify Juspay credentials
   - Check webhook URL accessibility
   - Review payment service logs
   - Test with sandbox first

3. **Order Not Confirmed**
   - Check /on_confirm response
   - Verify payment callback
   - Review order validation
   - Check seller's inventory

4. **Tracking Not Working**
   - Verify seller provides tracking
   - Check GPS coordinate format
   - Review /on_track response
   - Ensure delivery partner integration

## Support Channels

- **ONDC Slack**: https://witsinnovationlab.slack.com/archives/C0280AR5CUQ
- **GitHub Issues**: https://github.com/ONDC-Official/ondc-sdk/issues
- **Email**: support@ondc.org
- **Documentation**: https://docs.ondc.org
- **Juspay Support**: https://support.juspay.in

## Compliance Requirements

### Data Privacy
- User consent for data collection
- Secure storage of personal data
- Right to delete account
- Data portability

### Security
- HTTPS for all endpoints
- Secure payment data handling
- PCI DSS compliance
- Regular security audits

### ONDC Protocol
- Beckn specification v1.1.0+
- Response time < 3 seconds
- 99.9% uptime SLA
- Proper error handling

## Best Practices

1. **User Experience**
   - Fast search results
   - Clear product information
   - Simple checkout flow
   - Real-time order updates

2. **Performance**
   - Cache catalog data
   - Optimize search queries
   - Lazy load images
   - CDN for static assets

3. **Reliability**
   - Handle network failures
   - Retry failed requests
   - Queue background jobs
   - Monitor error rates

4. **Customer Support**
   - Quick IGM resolution
   - Clear communication
   - Easy returns process
   - Refund within 7 days
