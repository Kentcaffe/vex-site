"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

const HEARTBEAT_MS = 30_000;

/**
 * Trimite heartbeat + timp petrecut pe segmentul de rută curent (doar utilizatori TESTER autentificați).
 */
export function TesterSessionTracker() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const segmentStart = useRef(Date.now());

  useEffect(() => {
    pathRef.current = pathname;
    segmentStart.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    function send(type: "heartbeat" | "session_end", secondsDelta: number) {
      const path = pathRef.current;
      const payload = JSON.stringify({
        type,
        path,
        secondsDelta: Math.max(0, Math.min(secondsDelta, 8 * 3600)),
      });
      if (type === "session_end" && typeof navigator.sendBeacon === "function") {
        navigator.sendBeacon("/api/tester/activity", new Blob([payload], { type: "application/json" }));
        return;
      }
      void fetch("/api/tester/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: payload,
        keepalive: type === "session_end",
      }).catch(() => {});
    }

    const tick = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.round((now - segmentStart.current) / 1000);
      segmentStart.current = now;
      if (delta > 0) {
        send("heartbeat", delta);
      }
    }, HEARTBEAT_MS);

    function onHide() {
      const delta = Math.round((Date.now() - segmentStart.current) / 1000);
      send("session_end", Math.min(delta, 600));
    }
    window.addEventListener("pagehide", onHide);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener("pagehide", onHide);
      const delta = Math.round((Date.now() - segmentStart.current) / 1000);
      if (delta > 2) {
        send("session_end", Math.min(delta, 120));
      }
    };
  }, []);

  return null;
}
