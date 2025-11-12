## KazSmartChain Console

Multi-tenant admin console for Besu (via Hyperledger FireFly) and Solana NFT flows.

Structure:
- `apps/api`: NestJS API (PostgreSQL + Redis + Swagger + WS)
- `apps/web`: Next.js 15 (App Router, Tailwind, shadcn/ui, TanStack Query)
- `apps/relay`: Node worker (FireFly streams → IPFS/Solana)
- `packages/sdk`: TypeScript SDK (HTTP client + Zod types)
- `apps/mocks/*`: Local mocks for FireFly and Solana
- `config/env.example`: Sample environment variables

Quick start:
1) Copy `config/env.example` → `.env` files per app if needed.
2) `docker-compose up -d postgres redis ipfs firefly-mock solana-mock`
3) In each app, `npm i` then:
   - API: `npm run start:dev`
   - Relay: `npm run start:dev`
   - Web: `npm run dev`

E2E demo flow (mocked): Issue → Verify → Revoke for a demo tenant using `packages/sdk`.

Security notes:
- Dev defaults only. Enable TLS/mTLS and real OIDC/SAML for production.
- RBAC enforced per tenant and role.
# kazsmartchain
KazSmartChain is a sovereign multichain supernode for Kazakhstan
