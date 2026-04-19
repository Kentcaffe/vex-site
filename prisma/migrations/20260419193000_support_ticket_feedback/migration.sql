ALTER TABLE "support_tickets"
ADD COLUMN "feedback_rating" INTEGER,
ADD COLUMN "feedback_satisfied" BOOLEAN,
ADD COLUMN "feedback_at" TIMESTAMP(3);
