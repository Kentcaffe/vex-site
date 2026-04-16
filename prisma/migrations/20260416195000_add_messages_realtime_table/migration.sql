-- Supabase Realtime chat messages table
CREATE TABLE IF NOT EXISTS "messages" (
  "id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "receiver_id" TEXT NOT NULL,
  "room_id" TEXT,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "messages_room_id_created_at_idx"
  ON "messages"("room_id", "created_at");
CREATE INDEX IF NOT EXISTS "messages_receiver_id_created_at_idx"
  ON "messages"("receiver_id", "created_at");
CREATE INDEX IF NOT EXISTS "messages_sender_id_created_at_idx"
  ON "messages"("sender_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE "messages"
      ADD CONSTRAINT "messages_sender_id_fkey"
      FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Supabase Realtime: publish INSERT events for `messages`.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE messages';
    EXCEPTION
      WHEN duplicate_object THEN
        NULL;
    END;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'messages_receiver_id_fkey'
  ) THEN
    ALTER TABLE "messages"
      ADD CONSTRAINT "messages_receiver_id_fkey"
      FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
