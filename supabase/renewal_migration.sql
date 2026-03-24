-- Add renewal tracking to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS renewed_from_id UUID;
