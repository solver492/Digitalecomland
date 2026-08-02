# Digital Ecom Land

Plateforme d'affiliation e-commerce COD (Cash On Delivery / Dropshipping sans stock) pour le marché marocain et africain. Les affiliés vendent des produits sans stock, saisissent des commandes pour leurs clients finaux, et reçoivent leurs marges après livraison confirmée.

## Run & Operate

- `pnpm --filter @workspace/digital-ecom-land run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + Tailwind CSS + Shadcn/UI + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API endpoints)
- `lib/db/src/schema/` — Drizzle table definitions (products, orders, withdrawals, profile)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/digital-ecom-land/src/` — React frontend
- `lib/api-client-react/src/generated/` — Auto-generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Auto-generated Zod schemas for server validation (do not edit)

## Architecture decisions

- COD affiliation model: affilié margin = sale_price_affiliate - wholesale_price - delivery_cost
- Funds are only "withdrawable" once an order reaches LIVREE status
- No authentication system in first build — single affiliate user model
- All amounts in DZD (Algerian Dinar)
- Always-dark theme (dark class applied on mount, no toggle)

## Product

- **Landing page** (`/`): Public marketing page with hero, 5-step process, advantages, FAQ
- **Dashboard** (`/dashboard`): Financial KPI cards (withdrawable, pending, total earned), welcome banner, quick actions
- **Catalogue** (`/dashboard/products`): Product catalog with search/filter, margin badges, creatives download
- **Commandes** (`/dashboard/orders`): Order table with status filters, Add Order modal with Moroccan cities
- **Analytiques** (`/dashboard/analytics`): Delivery/return rates, 30-day profit chart, top cities/products
- **Portefeuille** (`/dashboard/wallet`): Balance summary, withdrawal history, request withdrawal (min 100 DZD)
- **Paramètres** (`/dashboard/settings`): Profile, brand name, bank/RIB details

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` then `pnpm run typecheck:libs` before leaf artifact checks
- Orval generates `zod.int()` for `type: integer` fields, which is zod v4 only — use `type: number` in OpenAPI spec to stay on zod v3
- After schema changes in `lib/db/src/schema/`, run `pnpm run typecheck:libs` before API server typecheck so new exports are visible

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
