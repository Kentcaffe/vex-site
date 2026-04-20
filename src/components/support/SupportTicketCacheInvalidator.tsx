"use client";

import { useEffect } from "react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { invalidateSupportTicketCache } from "@/lib/support-ticket-cache";

export function SupportTicketCacheInvalidator() {
  const { status } = useAuthSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      invalidateSupportTicketCache();
    }
  }, [status]);
  return null;
}
