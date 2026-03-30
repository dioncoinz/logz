create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  role text,
  qr_value text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.store_locations (
  id uuid primary key default gen_random_uuid(),
  location_code text not null unique,
  name text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  asset_code text not null unique,
  name text not null,
  category text not null check (category in ('Tool', 'Equipment', 'Vehicle', 'Consumable', 'Other')),
  description text,
  purchase_date date,
  cost numeric(12,2),
  current_status text not null default 'IN' check (current_status in ('IN', 'OUT')),
  current_holder text,
  current_location text,
  location_id uuid references public.store_locations(id) on delete set null,
  qr_value text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.asset_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  action text not null check (action in ('IN', 'OUT')),
  scanned_by uuid references public.profiles(id) on delete set null,
  scanned_by_name text,
  note text,
  location text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
add column if not exists qr_value text;

alter table public.assets
add column if not exists purchase_date date,
add column if not exists cost numeric(12,2),
add column if not exists location_id uuid references public.store_locations(id) on delete set null;

create unique index if not exists idx_profiles_qr_value on public.profiles (qr_value) where qr_value is not null;
create index if not exists idx_assets_status on public.assets (current_status);
create index if not exists idx_assets_qr_value on public.assets (qr_value);
create index if not exists idx_assets_location_id on public.assets (location_id);
create index if not exists idx_asset_logs_asset_id on public.asset_logs (asset_id);
create index if not exists idx_asset_logs_created_at on public.asset_logs (created_at desc);
create index if not exists idx_store_locations_name on public.store_locations (name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_assets_updated_at on public.assets;

create trigger trg_assets_updated_at
before update on public.assets
for each row
execute function public.set_updated_at();