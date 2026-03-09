# ONDC Seller App References

## Official Documentation

- **User Manual**: https://docs.google.com/document/d/1-8OIo8Ka6Z4ey1amxG_a69lLM0B6tozsWmzwrQmgHKQ/edit
- **API Contract v1.2**: https://docs.google.com/document/d/1brvcltG_DagZ3kGr1ZZQk4hG4tze3zvcxmGV4NMTzr8/edit
- **GitHub Repository**: https://github.com/ONDC-Official/seller-app-sdk
- **ONDC Docs**: https://docs.ondc.org

## Key Components

### 1. Seller App (Node.js)
- **Repository**: https://github.com/ONDC-Official/seller-app
- **Language**: Node.js v16
- **Purpose**: Backend API layer for seller operations
- **Key Features**:
  - Catalog management
  - Order processing
  - Store management
  - Inventory updates

### 2. Seller App Frontend (React)
- **Repository**: https://github.com/ONDC-Official/seller-app-frontend
- **Language**: React JS v17
- **Purpose**: Web UI for sellers
- **Key Features**:
  - Dashboard
  - Product management
  - Order fulfillment
  - Analytics

### 3. Protocol Layer (Python)
- **Repository**: https://github.com/ONDC-Official/seller-app-protocol
- **Language**: Python v3.7
- **Purpose**: ONDC protocol implementation
- **Key Features**:
  - Beckn protocol compliance
  - Request/response validation
  - Signature verification
  - Message encryption

### 4. IGM Service (Node.js)
- **Repository**: https://github.com/ONDC-Official/seller-app-igm
- **Language**: Node.js
- **Purpose**: Issue & Grievance Management
- **Key Features**:
  - Issue creation
  - Resolution tracking
  - Escalation handling
  - Integration with Bugzilla

### 5. Bugzilla Service
- **Repository**: https://github.com/ONDC-Official/seller-bugzilla-service
- **Language**: Node.js
- **Purpose**: Bugzilla API wrapper
- **Key Features**:
  - Ticket creation
  - Status updates
  - Comment management
  - Search and filtering

## Environment Setup

### Required Services

1. **Firebase** - Authentication
   - Email/Password
   - Phone OTP
   - Social logins

2. **SMTP** - Email notifications
   - Login OTP
   - Order confirmations
   - Status updates

3. **AWS S3** - Asset storage
   - Product images
   - Documents
   - Catalog exports

4. **Map My India** - Location services
   - Address lookup
   - Geocoding
   - PIN code validation

### Database Schema

**MongoDB Collections**:
- `users` - Seller accounts
- `stores` - Store information
- `products` - Product catalog
- `orders` - Order data
- `issues` - IGM tickets
- `logs` - Transaction logs

## API Endpoints

### Seller App APIs

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/stores
POST   /api/v1/stores
PUT    /api/v1/stores/:id
GET    /api/v1/products
POST   /api/v1/products
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id
GET    /api/v1/orders
GET    /api/v1/orders/:id
PUT    /api/v1/orders/:id/status
POST   /api/v1/catalog/sync
```

### ONDC Protocol APIs (Beckn)

```
POST   /search           - Receive search requests
POST   /select           - Receive item selection
POST   /init             - Initialize order
POST   /confirm          - Confirm order
POST   /status           - Order status request
POST   /track            - Track fulfillment
POST   /cancel           - Cancel order
POST   /update           - Update order
POST   /rating           - Receive ratings
POST   /support          - Support requests
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
     "city": "std:080",
     "type": "BPP",
     "subscriber_id": "https://yourdomain.com",
     "subscriber_url": "https://yourdomain.com",
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

## Deployment Options

### 1. Local Development
- Use docker-compose-for-local.yaml
- ngrok for public endpoint
- Test with staging registry

### 2. Staging Deployment
- Use docker-compose-without-ssl.yaml
- Domain with HTTP (for testing)
- ONDC staging registry

### 3. Production Deployment
- Use docker-compose.yaml
- Domain with HTTPS (Let's Encrypt)
- ONDC production registry
- Ansible for automated deployment

## Troubleshooting

### Common Issues

1. **Signature Verification Failed**
   - Check private/public key pair
   - Verify key format (PEM)
   - Ensure correct algorithm (ED25519/X25519)

2. **Catalog Not Syncing**
   - Check MongoDB connection
   - Verify S3 bucket access
   - Review protocol layer logs

3. **Orders Not Appearing**
   - Check webhook configuration
   - Verify /on_search responses
   - Review order validation

4. **IGM Issues Not Creating**
   - Check Bugzilla API key
   - Verify SMTP configuration
   - Review IGM service logs

## Support Channels

- **ONDC Slack**: https://witsinnovationlab.slack.com/archives/C0280AR5CUQ
- **GitHub Issues**: https://github.com/ONDC-Official/seller-app-sdk/issues
- **Email**: support@ondc.org
- **Documentation**: https://docs.ondc.org

## Compliance Requirements

### Data Privacy
- GDPR compliance for international sellers
- Data retention policies
- User consent management

### Security
- HTTPS for all endpoints
- API key rotation
- Regular security audits
- PCI DSS for payment data

### ONDC Protocol
- Beckn specification v1.1.0+
- Response time < 3 seconds
- 99.9% uptime SLA
- Proper error handling

## Best Practices

1. **Catalog Management**
   - Use high-quality images (min 800x800px)
   - Accurate product descriptions
   - Real-time inventory updates
   - Proper categorization

2. **Order Fulfillment**
   - Quick order confirmation
   - Timely status updates
   - Accurate delivery estimates
   - Proactive communication

3. **Customer Service**
   - Quick IGM resolution
   - Professional communication
   - Refund within 7 days
   - Quality assurance

4. **Performance**
   - Monitor API response times
   - Optimize database queries
   - Cache catalog data
   - Load balancing for scale
