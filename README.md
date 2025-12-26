# Flow402

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg)](https://nextjs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

> Enterprise-grade decentralized compute marketplace for on-demand RAM and GPU resource allocation with HTTP 402 micropayment protocol integration.

## Overview

Flow402 is a production-ready web application that enables a decentralized marketplace for compute resources. Users can rent or provide RAM and GPU capacity on demand, with automatic payment handling through the Coinbase x402 payment protocol.

## Features

### Core Capabilities

- **Decentralized Marketplace**: Peer-to-peer resource trading with transparent pricing and availability
- **HTTP 402 Payments**: Native integration with Coinbase x402 protocol for micropayments
- **Resource Management**: Real-time tracking of compute nodes and resource utilization
- **Multi-Role System**: Support for consumers, providers, and administrators
- **High Performance**: Rust-based cryptographic operations compiled to WebAssembly

### Technical Features

- **Authentication**: JWT-based sessions with httpOnly cookies and refresh tokens
- **OAuth Integration**: Google OAuth support via NextAuth.js
- **Payment Processing**: Mock and Solana-based x402 payment providers
- **Usage Metering**: Automated tracking and billing for resource consumption
- **API-First Design**: RESTful API with comprehensive endpoint coverage

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16.1 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **Backend** | Next.js API Routes, Node.js 20+ |
| **Database** | PostgreSQL 15+ with Prisma ORM |
| **Caching** | Redis 5+ (optional) |
| **Authentication** | JWT, NextAuth.js, bcrypt |
| **Payments** | Coinbase x402 protocol, Solana blockchain |
| **Cryptography** | Rust (WebAssembly), SHA-256, SHA3-256 |
| **Testing** | Jest, React Testing Library |
| **Containerization** | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Node.js 20.0 or higher
- PostgreSQL 15.0 or higher
- Redis 5.0 or higher (optional)
- Docker and Docker Compose (optional)
- Rust 1.70+ (for building crypto library)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/brianweb3/Flow402.git
cd Flow402
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flow402"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
```

4. **Set up the database**

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. **Build Rust crypto library (optional)**

```bash
npm run rust:build
```

6. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Docker Deployment

```bash
docker-compose up -d
docker-compose exec web npm run db:migrate
docker-compose exec web npm run db:seed
```

## Architecture

### System Components

```
┌─────────────────┐
│   Next.js App   │
│  (Frontend +    │
│   API Routes)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│PostgreSQL│ │ Redis │
└─────────┘ └───────┘
    │
┌───▼──────────┐
│ Rust WASM    │
│ (Crypto Ops) │
└──────────────┘
```

### Payment Flow

1. Consumer creates rental request
2. System generates HTTP 402 payment challenge
3. Payment processed via x402 protocol
4. Payment verification and settlement
5. Resource activation and access credentials

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new user account |
| POST | `/api/auth/login` | Authenticate user |
| POST | `/api/auth/logout` | Terminate session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |

### Resource Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offers` | List available offers |
| POST | `/api/offers` | Create new offer |
| GET | `/api/offers/:id` | Get offer details |
| PATCH | `/api/offers/:id` | Update offer |
| DELETE | `/api/offers/:id` | Delete offer |

### Payment Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/quote` | Get payment quote |
| POST | `/api/payments/authorize` | Authorize payment |
| POST | `/api/payments/complete` | Complete payment |
| POST | `/api/payments/settle` | Settle payment |

See [API Documentation](./docs/API.md) for detailed specifications.

## Development

### Project Structure

```
Flow402/
├── app/                    # Next.js application
│   ├── api/               # API route handlers
│   ├── (pages)/          # Page components
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── calculator/       # Cost calculator UI
│   └── layout/           # Layout components
├── lib/                   # Core libraries
│   ├── auth/             # Authentication logic
│   ├── db/               # Database client
│   ├── payments/         # Payment processing
│   └── utils/            # Utility functions
├── rust-lib/             # Rust crypto library
│   ├── src/              # Rust source code
│   └── Cargo.toml        # Rust dependencies
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Seed script
└── __tests__/           # Test suites
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Lint codebase |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |
| `npm run rust:build` | Build Rust library |
| `npm run rust:test` | Run Rust tests |

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run Rust tests
npm run rust:test
```

## Security

Flow402 implements multiple security layers:

- Input validation using Zod schemas
- JWT tokens in httpOnly cookies
- Password hashing with bcrypt
- CSRF protection for auth endpoints
- Audit logging for security events
- Rate limiting (planned)

See [SECURITY.md](./SECURITY.md) for security policies and reporting.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Documentation

- [API Documentation](./docs/API.md)
- [x402 Payment Setup](./X402_SETUP.md)
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Rust Library](./rust-lib/README.md)

## Support

For issues and questions:

- [GitHub Issues](https://github.com/brianweb3/Flow402/issues)
- [Discussions](https://github.com/brianweb3/Flow402/discussions)

## Roadmap

- [ ] Real x402 provider integration
- [ ] Kubernetes/Firecracker container provisioning
- [ ] WebSocket real-time updates
- [ ] Advanced filtering and search
- [ ] Provider analytics dashboard
- [ ] Consumer usage monitoring
- [ ] Dispute resolution system
- [ ] KYC integration
- [ ] Multi-currency support

---

Built with ❤️ by the Flow402 team

