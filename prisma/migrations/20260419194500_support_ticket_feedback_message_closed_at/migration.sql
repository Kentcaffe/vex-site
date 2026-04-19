ALTER TABLE "support_tickets"
ADD COLUMN IF NOT EXISTS "feedback_message" TEXT,
ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP(3);
