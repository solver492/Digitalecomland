import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

export type SupabaseRow = Record<string, unknown>;

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * The API only uses Supabase Auth and PostgREST. Realtime is a browser
 * concern, but supabase-js eagerly constructs its client in Node 20. Supply
 * a closed transport so server startup does not require a native WebSocket.
 */
class DisabledWebSocket {
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;
  readonly readyState = this.CLOSED;
  readonly protocol = "";
  onopen: ((this: any, event: Event) => any) | null = null;
  onmessage: ((this: any, event: MessageEvent) => any) | null = null;
  onclose: ((this: any, event: CloseEvent) => any) | null = null;
  onerror: ((this: any, event: Event) => any) | null = null;

  constructor(readonly url: string, _protocols?: string | string[]) {}
  close(): void {}
  send(_data: string | ArrayBufferLike | Blob | ArrayBufferView): void {}
  addEventListener(_type: string, _listener: EventListener): void {}
  removeEventListener(_type: string, _listener: EventListener): void {}
}

export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        realtime: { transport: DisabledWebSocket as unknown as typeof WebSocket },
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