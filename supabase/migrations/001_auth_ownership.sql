-- Ownership required by the authenticated API.
-- Products, suppliers, product_media and telegram_messages are shared/admin
-- catalogue infrastructure and intentionally do not receive user_id.
alter table if exists public.orders
  add column if not exists user_id uuid references auth.users(id) on delete restrict;

alter table if exists public.withdrawals
  add column if not exists user_id uuid references auth.users(id) on delete restrict;

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists withdrawals_user_id_idx on public.withdrawals(user_id);

-- Keep the profile row in sync with auth.users without exposing a callable
-- function to anonymous clients. The API also has an idempotent fallback for
-- projects where this migration has not been applied yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, phone, email, city, brand_name,
    bank_name, rib_number, payment_method, role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    '',
    coalesce(new.email, ''),
    '',
    '',
    null,
    null,
    null,
    'affiliate'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table if exists public.orders enable row level security;
alter table if exists public.withdrawals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'orders_owner_access'
  ) then
    create policy orders_owner_access on public.orders
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'withdrawals' and policyname = 'withdrawals_owner_access'
  ) then
    create policy withdrawals_owner_access on public.withdrawals
      for all to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;