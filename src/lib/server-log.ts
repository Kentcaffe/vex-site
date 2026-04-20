/**
 * Erori în rute API — un singur format; în dev include stack pentru depanare.
 */
export function logRouteError(routeLabel: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[api] ${routeLabel}`, message);
  if (process.env.NODE_ENV === "development" && err instanceof Error && err.stack) {
    console.error(err.stack);
  }
}
