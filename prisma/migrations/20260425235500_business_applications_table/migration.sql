CREATE TABLE IF NOT EXISTS "business_applications" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text NOT NULL DEFAULT 'pending',
  "company_name" text NOT NULL,
  "company_type" text NOT NULL,
  "idno" text NOT NULL,
  "vat_number" text,
  "administrator_name" text NOT NULL,
  "company_address" text NOT NULL,
  "company_city" text NOT NULL,
  "phone" text NOT NULL,
  "company_email" text NOT NULL,
  "company_logo" text,
  "company_document" text NOT NULL,
  "registration_number" text NOT NULL,
  "registration_date" date NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "reviewed_at" timestamptz,
  "reviewed_by" text
);

CREATE INDEX IF NOT EXISTS "business_applications_status_created_at_idx"
  ON "business_applications"("status", "created_at");
CREATE INDEX IF NOT EXISTS "business_applications_user_id_created_at_idx"
  ON "business_applications"("user_id", "created_at");
