/**
 * Mentenanță controlată din env (Render / Docker).
 * Setează MAINTENANCE_MODE=true pentru redirect global la /maintenance.
 */
export function isMaintenanceMode(): boolean {
  const v = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Chunk-uri Next, imagini optimizate, public/ — fără redirect la mentenanță. */
export function isMiddlewareStaticBypass(pathname: string): boolean {
  if (pathname.startsWith("/_next")) {
    return true;
  }
  if (pathname === "/favicon.ico") {
    return true;
  }
  const base = pathname.split("/").pop() ?? "";
  return base.includes(".") && !pathname.startsWith("/api/");
}
