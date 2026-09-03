import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export type SupabaseRow = Record<string, unknown>;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export function requireSupabase(): SupabaseClient {
  if (!supabaseAdmin) {
    throw new Error("Supabase server configuration is missing");
  }
  return supabaseAdmin;
}

export function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

export function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value == null ? fallback : Boolean(value);
}

export function toId(value: unknown): number | string {
  const numeric = Number(value);
  return typeof value === "number" || (typeof value === "string" && value.trim() !== "" && Number.isFinite(numeric))
    ? numeric
    : toStringValue(value);
}

export function rowValue(row: SupabaseRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

export function ownsRow(row: SupabaseRow, userId: string): boolean {
  const owner = rowValue(row, "user_id", "affiliate_id", "owner_id", "created_by");
  return owner === userId || String(owner ?? "") === userId;
}

export function publicError(error: unknown): string {
  if (error instanceof Error && error.message === "Supabase server configuration is missing") {
    return "Supabase server configuration is missing";
  }
  return "A database operation failed";
}

export type AuthenticatedUser = User;