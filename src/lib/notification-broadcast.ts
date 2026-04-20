import { getSupabaseServiceClient } from "@/lib/supabase-service-role";

export type BroadcastNotificationPayload = {
  id: string;
  title: string;
  body: string;
  kind: string;
};

/** Trimite broadcast Realtime către clientul utilizatorului (canal privat per user). */
export async function broadcastUserNotification(userId: string, payload: BroadcastNotificationPayload): Promise<void> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return;

  const channelName = `user-notifications-${userId}`;

  await new Promise<void>((resolve) => {
    const ch = supabase.channel(channelName, {
      config: { broadcast: { ack: false } },
    });
    const finish = () => {
      void supabase.removeChannel(ch);
      resolve();
    };
    const timer = setTimeout(finish, 8000);
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void ch
          .send({
            type: "broadcast",
            event: "new",
            payload,
          })
          .finally(() => {
            clearTimeout(timer);
            finish();
          });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        clearTimeout(timer);
        finish();
      }
    });
  });
}
