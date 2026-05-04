-- Tester program: forced password change + activity aggregates
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "must_change_password" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "tester_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_login" TIMESTAMP(3),
    "sessions_count" INTEGER NOT NULL DEFAULT 0,
    "total_time_spent" INTEGER NOT NULL DEFAULT 0,
    "last_active" TIMESTAMP(3),
    "last_path" TEXT,
    "recent_paths" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tester_activity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tester_activity_user_id_key" ON "tester_activity"("user_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tester_activity_user_id_fkey'
  ) THEN
    ALTER TABLE "tester_activity"
      ADD CONSTRAINT "tester_activity_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
