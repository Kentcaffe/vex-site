/** Loguri doar în development — fără zgomot în producție (server + client). */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
}

export function devWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(...args);
  }
}
