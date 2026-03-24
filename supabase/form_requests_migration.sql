-- Form Requests: broker-submitted questionnaire forms for new insurers
CREATE TABLE IF NOT EXISTS form_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT now(),
  broker_name TEXT,
  broker_email TEXT,
  insurer_name TEXT NOT NULL,
  insurance_class TEXT NOT NULL,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'done')),
  estimated_days INTEGER DEFAULT 5
);

-- Storage bucket (run via Supabase dashboard or API):
-- CREATE BUCKET "form-requests" with public = false
-- Files stored at: form-requests/{id}/{filename}
