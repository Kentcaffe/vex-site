"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";

/** Reîmprospătează UI-ul (badge notificări, listă) când sosește un broadcast pentru userul curent. */
export function NotificationRealtimeBridge() {
  const router = useRouter();
  const { data, status } = useAuthSession();
  const userId = data?.user?.id;
  const refreshRef = useRef(router.refresh);
  refreshRef.current = router.refresh;

  useEffect(() => {
    if (status !== "authenticated" || !userId) return;

    const supabase = createSupabaseBrowserClient();
    const channelName = `user-notifications-${userId}`;
    const ch = supabase
      .channel(channelName)
      .on("broadcast", { event: "new" }, () => {
        refreshRef.current();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [status, userId]);

  return null;
}
