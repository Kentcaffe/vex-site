-- Full business application profile for Moldova (manual review flow).
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "business_status" text NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS "company_type" text,
ADD COLUMN IF NOT EXISTS "idno" text,
ADD COLUMN IF NOT EXISTS "administrator_name" text,
ADD COLUMN IF NOT EXISTS "company_city" text,
ADD COLUMN IF NOT EXISTS "company_email" text,
ADD COLUMN IF NOT EXISTS "company_document" text,
ADD COLUMN IF NOT EXISTS "registration_number" text,
ADD COLUMN IF NOT EXISTS "registration_date" date;

CREATE INDEX IF NOT EXISTS "users_business_status_idx" ON "users"("business_status");
CREATE INDEX IF NOT EXISTS "users_idno_idx" ON "users"("idno");
