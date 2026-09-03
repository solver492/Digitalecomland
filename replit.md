# Ecom Land — COD Affiliate Platform

A Cash-on-Delivery (COD) affiliate e-commerce platform for the Moroccan and African market. Affiliates sell products without holding stock, place orders for their customers, and receive their margins after delivery.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui (`artifacts/digital-ecom-land`)
- **API server**: Express 5 + TypeScript + Pino logger (`artifacts/api-server`)
- **Database**: Supabase Auth and PostgreSQL (legacy Drizzle definitions remain in `lib/db`)
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

Supabase Auth and Supabase PostgreSQL are the runtime data platform. Express
uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server-side only. The
existing `lib/db` Drizzle package is retained for schema compatibility and is
not used by the authenticated API routes until its definitions are reconciled
with the existing Supabase schema.

- Migration: `supabase/migrations/001_auth_ownership.sql`
- Existing tables: `profiles`, `suppliers`, `products`, `product_media`,
  `orders`, `withdrawals`, `telegram_messages`, `social_publications`

## Key routes (frontend)

- `/` — Landing page
- `/auth` — Supabase login and signup
- `/dashboard` — Affiliate dashboard
- `/dashboard/products` — Product catalogue
- `/dashboard/orders` — Order management
- `/dashboard/analytics` — Analytics
- `/dashboard/wallet` — Wallet & withdrawals
- `/dashboard/settings` — Settings / profile

## User preferences

- Keep the existing project structure — do not restructure or migrate to a different stack.
- The frontend uses Supabase Auth; Express verifies bearer tokens with
  `supabase.auth.getUser(token)` and enforces `affiliate`/`admin` roles.