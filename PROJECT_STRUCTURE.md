# Flow / RAMarket - Project Structure

## Overview
Production-ready MVP web application for decentralized compute marketplace (RAM/GPU rental).

## File Tree

```
flow-ramarket/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── signup/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── refresh/route.ts
│   │   ├── offers/              # Offer management
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── rentals/             # Rental management
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── payments/            # x402 payment endpoints
│   │   │   ├── quote/route.ts
│   │   │   ├── authorize/route.ts
│   │   │   ├── complete/route.ts
│   │   │   └── settle/route.ts
│   │   ├── nodes/               # Node management
│   │   │   ├── route.ts
│   │   │   └── [id]/heartbeat/route.ts
│   │   └── cron/                # Background jobs
│   │       └── metering/route.ts
│   ├── (pages)/                 # Page routes
│   │   ├── dashboard/page.tsx
│   │   ├── market/page.tsx
│   │   ├── provider/page.tsx
│   │   ├── consumer/page.tsx
│   │   └── docs/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                 # Landing page
│   └── globals.css
├── components/                   # React Components
│   ├── calculator/
│   │   └── RentalCalculator.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/                          # Utility Libraries
│   ├── auth/                     # Authentication
│   │   ├── jwt.ts
│   │   ├── middleware.ts
│   │   └── password.ts
│   ├── db/
│   │   └── prisma.ts            # Prisma client
│   ├── payments/                 # Payment logic
│   │   ├── calculator.ts
│   │   └── x402/                # x402 protocol
│   │       ├── types.ts
│   │       ├── provider.ts
│   │       └── mock.ts
│   ├── jobs/                     # Background jobs
│   │   └── metering.ts
│   └── utils/                    # Utilities
│       ├── errors.ts
│       ├── api-response.ts
│       └── validation.ts
├── prisma/                       # Prisma ORM
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed script
├── __tests__/                    # Test files
│   ├── calculator.test.ts
│   └── x402-payment.test.ts
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── jest.config.js
├── jest.setup.js
├── .prettierrc
├── .env.example
├── README.md
└── package.json
```

## Key Components

### Authentication Flow
- JWT tokens stored in httpOnly cookies
- Refresh token mechanism
- OAuth support (Google) via NextAuth.js
- Role-based access control (CONSUMER, PROVIDER, ADMIN)

### x402 Payment Protocol
- Mock implementation for MVP
- HTTP 402 payment challenges
- Payment proof verification
- Settlement processing
- Ready for real provider integration

### Database Schema
- User management with roles
- Offer and rental tracking
- Payment and invoice records
- Usage metering and settlement
- Node management
- Audit logging

### API Endpoints
- RESTful API design
- Input validation with Zod
- Error handling with custom error classes
- HTTP 402 for payment challenges

### UI/UX
- Dark theme with minimalist design
- Responsive layout
- Interactive calculator
- Real-time updates (structure ready)

## Next Steps for Production

1. **Real x402 Provider**: Replace mock with Coinbase x402 integration
2. **Container Provisioning**: Integrate Kubernetes/Firecracker
3. **WebSocket/SSE**: Implement real-time updates
4. **Rate Limiting**: Add rate limiting middleware
5. **Monitoring**: Add logging and monitoring
6. **KYC Integration**: Real KYC provider integration
7. **Multi-currency**: Support multiple currencies
8. **Advanced Analytics**: Provider/consumer dashboards

