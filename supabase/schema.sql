-- InsureUnify Database Schema
-- Run with: npx supabase db push

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tenants ──────────────────────────────────────────────────────────────────
create table if not exists tenants (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  created_at  timestamptz default now()
);

-- ─── Profiles (extends Supabase auth.users) ───────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid references tenants(id) on delete cascade,
  full_name   text,
  role        text not null default 'broker' check (role in ('admin', 'broker')),
  created_at  timestamptz default now()
);

-- ─── Insurers ─────────────────────────────────────────────────────────────────
create table if not exists insurers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  short_name  text not null,
  color       text not null,
  logo_url    text,
  form_code   text,
  created_at  timestamptz default now()
);

insert into insurers (name, short_name, color, form_code) values
  ('Булстрад',  'bulstrad',  '#0B3D91', '2200-26'),
  ('Женерали',  'generali',  '#C8102E', 'ИМСБ 07.01.2026'),
  ('Инстинкт',  'instinct',  '#1B6B3A', 'AR-01082025')
on conflict do nothing;

-- ─── Insurance Classes ────────────────────────────────────────────────────────
create table if not exists insurance_classes (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  created_at  timestamptz default now()
);

insert into insurance_classes (name, slug, description) values
  ('Имуществено застраховане', 'property', 'Застраховане на имущество за фирми')
on conflict do nothing;

-- ─── Master Schemas ───────────────────────────────────────────────────────────
create table if not exists master_schemas (
  id                   uuid primary key default uuid_generate_v4(),
  insurance_class_id   uuid references insurance_classes(id),
  version              text not null default '1.0',
  schema_data          jsonb not null,  -- Array of sections with fields
  created_at           timestamptz default now()
);

-- ─── Insurer Mappings ─────────────────────────────────────────────────────────
create table if not exists insurer_mappings (
  id                  uuid primary key default uuid_generate_v4(),
  insurer_id          uuid references insurers(id),
  insurance_class_id  uuid references insurance_classes(id),
  master_field_id     text not null,
  original_field_name text,
  section_in_original text,
  transform_type      text check (transform_type in ('direct','year_to_range','floors_to_range','distance_to_boolean','months_to_years')),
  created_at          timestamptz default now(),
  unique(insurer_id, insurance_class_id, master_field_id)
);

-- ─── Submissions ──────────────────────────────────────────────────────────────
create table if not exists submissions (
  id                   uuid primary key default uuid_generate_v4(),
  tenant_id            uuid references tenants(id),
  created_by           uuid references auth.users(id),
  insurance_class_id   uuid references insurance_classes(id),
  client_name          text not null,
  selected_insurers    text[] not null default '{}',
  form_data            jsonb not null default '{}',
  status               text not null default 'draft' check (status in ('draft','complete')),
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── Generated Documents ─────────────────────────────────────────────────────
create table if not exists generated_documents (
  id             uuid primary key default uuid_generate_v4(),
  submission_id  uuid references submissions(id) on delete cascade,
  insurer_id     uuid references insurers(id),
  file_path      text,  -- Supabase Storage path
  generated_at   timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table tenants            enable row level security;
alter table profiles           enable row level security;
alter table submissions        enable row level security;
alter table generated_documents enable row level security;

-- Public read access for reference tables
create policy "Public read insurers"         on insurers          for select using (true);
create policy "Public read insurance_classes" on insurance_classes for select using (true);
create policy "Public read master_schemas"   on master_schemas    for select using (true);
create policy "Public read insurer_mappings" on insurer_mappings  for select using (true);

-- Submissions: tenant isolation
create policy "Tenant submissions select" on submissions
  for select using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );

create policy "Tenant submissions insert" on submissions
  for insert with check (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );

create policy "Tenant submissions update" on submissions
  for update using (
    tenant_id = (select tenant_id from profiles where id = auth.uid())
  );

-- Profiles: own row
create policy "Users read own profile" on profiles
  for select using (id = auth.uid());

create policy "Users update own profile" on profiles
  for update using (id = auth.uid());
