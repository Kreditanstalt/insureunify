-- InsureUnify — Client Profiles migration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),

  -- Основни данни
  company_name TEXT NOT NULL,
  eik TEXT UNIQUE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  mobile TEXT,
  email TEXT,
  website TEXT,

  -- Фирмени данни
  activity TEXT,
  nkid_code TEXT,
  legal_form TEXT,
  year_founded TEXT,
  representative TEXT,
  representative_egn TEXT,

  -- Финансови данни
  annual_revenue NUMERIC,
  employees_count INTEGER,
  annual_wage_fund NUMERIC,

  -- Имуществени данни
  property_address TEXT,
  building_type TEXT,
  construction_type TEXT,
  roof_type TEXT,
  construction_year TEXT,
  floors TEXT,
  area_sqm NUMERIC,

  -- Охрана
  fire_alarm TEXT,
  sprinklers TEXT,
  security_system TEXT,

  -- Мета
  notes TEXT,
  tags TEXT[],
  last_submission_at TIMESTAMPTZ,
  submissions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see tenant clients" ON client_profiles
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_client_profiles_tenant ON client_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_eik    ON client_profiles(eik);
CREATE INDEX IF NOT EXISTS idx_client_profiles_name   ON client_profiles(company_name);
