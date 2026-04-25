-- Business account support for marketplace users.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "account_type" text NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS "company_name" text,
ADD COLUMN IF NOT EXISTS "vat_number" text,
ADD COLUMN IF NOT EXISTS "company_address" text,
ADD COLUMN IF NOT EXISTS "is_verified" boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "company_logo" text;

-- Query acceleration for business profiles and listings.
CREATE INDEX IF NOT EXISTS "users_account_type_idx" ON "users"("account_type");
CREATE INDEX IF NOT EXISTS "users_company_name_idx" ON "users"("company_name");
CREATE INDEX IF NOT EXISTS "users_is_verified_idx" ON "users"("is_verified");
