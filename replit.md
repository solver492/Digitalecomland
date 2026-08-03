# Ecom Land — COD Affiliate Platform

A Cash-on-Delivery (COD) affiliate e-commerce platform for the Moroccan and African market. Affiliates sell products without holding stock, place orders for their customers, and receive their margins after delivery.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui (`artifacts/digital-ecom-land`)
- **API server**: Express 5 + TypeScript + Pino logger (`artifacts/api-server`)
- **Database**: Replit PostgreSQL via Drizzle ORM (`lib/db`)
- **Shared libs**: `lib/api-spec` (OpenAPI), `lib/api-zod` (Zod schemas), `lib/api-client-react` (React Query hooks)
- **Package manager**: pnpm (monorepo with `pnpm-workspace.yaml`)

## Running the project

Both services start automatically via their registered workflows:

| Service | Workflow name | URL |
|---|---|---|
| Frontend | `artifacts/digital-ecom-land: web` | `/` |
| API server | `artifacts/api-server: API Server` | `/api` |

The API server builds with esbuild before starting (`pnpm run build && pnpm run start`).

## Database

Replit's built-in PostgreSQL is used. Schema is managed with Drizzle Kit.

- Push schema changes: `cd lib/db && npx drizzle-kit push`
- Schema files: `lib/db/src/schema/` (products, orders, profile, withdrawals)
- `DATABASE_URL` is provided automatically by the Replit environment.

## Key routes (frontend)

- `/` — Landing page
- `/dashboard` — Affiliate dashboard
- `/dashboard/products` — Product catalogue
- `/dashboard/orders` — Order management
- `/dashboard/analytics` — Analytics
- `/dashboard/wallet` — Wallet & withdrawals
- `/dashboard/settings` — Settings / profile

## User preferences

- Keep the existing project structure — do not restructure or migrate to a different stack.
