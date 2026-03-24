-- Offer Comparison feature migration
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS offer_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'sent')),
  client_name TEXT,
  insurance_class TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID REFERENCES offer_comparisons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  insurer_name TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  extracted_data JSONB DEFAULT '{}',
  manually_edited BOOLEAN DEFAULT false,
  is_recommended BOOLEAN DEFAULT false
);

-- Storage bucket for offer files
INSERT INTO storage.buckets (id, name, public)
VALUES ('offers', 'offers', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Service role offers access"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'offers');
