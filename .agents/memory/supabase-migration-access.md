---
name: Supabase migration access
description: Constraint on applying PostgreSQL DDL through the connected Supabase integration
---

The Replit Supabase connection available to this project provides authenticated PostgREST access but no SQL query or database-management client, so migration files can be committed and validated but cannot be applied to the live database from that connection alone.

**Why:** The service-role key is intentionally limited to server-side API access, and the integration does not expose a PostgreSQL connection or Supabase Management API token.

**How to apply:** Use the Supabase SQL Editor, Supabase CLI with project access, or a direct database connection to run the ordered files in `supabase/migrations/`, then verify the API health check and an authenticated CRUD path.