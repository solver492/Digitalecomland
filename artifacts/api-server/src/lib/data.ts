import { requireSupabase, type SupabaseRow } from "./supabase";

export async function selectRows(table: string): Promise<SupabaseRow[]> {
  const { data, error } = await requireSupabase().from(table).select("*");
  if (error) throw error;
  return (data ?? []) as SupabaseRow[];
}

export async function selectOne(table: string, column: string, value: string): Promise<SupabaseRow | null> {
  const { data, error } = await requireSupabase().from(table).select("*").eq(column, value).maybeSingle();
  if (error) throw error;
  return (data ?? null) as SupabaseRow | null;
}

export async function insertOne(table: string, row: SupabaseRow): Promise<SupabaseRow> {
  const { data, error } = await requireSupabase()
    .from(table)
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as SupabaseRow;
}

export async function updateOne(table: string, column: string, value: string, row: SupabaseRow): Promise<SupabaseRow> {
  const { data, error } = await requireSupabase()
    .from(table)
    .update(row)
    .eq(column, value)
    .select("*")
    .single();
  if (error) throw error;
  return data as SupabaseRow;
}

export async function deleteOne(table: string, column: string, value: string): Promise<void> {
  const { error } = await requireSupabase().from(table).delete().eq(column, value);
  if (error) throw error;
}