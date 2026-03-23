-- Run this in Supabase Dashboard → SQL Editor

-- 1. submissions
CREATE TABLE IF NOT EXISTS submissions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name      text NOT NULL,
  insurance_class  text,
  selected_insurers jsonb NOT NULL DEFAULT '[]',
  form_data        jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 2. clients
CREATE TABLE IF NOT EXISTS clients (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name        text NOT NULL,
  eik                 text UNIQUE,
  address             text,
  city                text,
  postal_code         text,
  phone               text,
  mobile              text,
  email               text,
  website             text,
  activity            text,
  nkid_code           text,
  legal_form          text,
  year_founded        text,
  representative      text,
  representative_egn  text,
  annual_revenue      numeric,
  employees_count     integer,
  annual_wage_fund    numeric,
  property_address    text,
  building_type       text,
  construction_type   text,
  roof_type           text,
  construction_year   text,
  floors              text,
  area_sqm            numeric,
  fire_alarm          text,
  sprinklers          text,
  security_system     text,
  notes               text,
  tags                jsonb DEFAULT '[]',
  submissions_count   integer DEFAULT 0,
  last_submission_at  timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_class ON submissions(insurance_class);
CREATE INDEX IF NOT EXISTS idx_clients_eik ON clients(eik);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(lower(company_name));

-- 4. Disable RLS (single-tenant app, service role only)
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
