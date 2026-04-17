/**
 * Păstrează câmpuri ne-sensibile din formularele de cont la navigare (sessionStorage).
 * Parolele nu se stochează niciodată.
 */

const LOGIN_KEY = "vex:auth-login-fields:v1";
const REGISTER_KEY = "vex:auth-register-fields:v1";
const TAB_KEY = "vex:auth-tab:v1";

export type LoginFieldsPersist = { identifier: string };
export type RegisterFieldsPersist = { name: string; email: string; phone: string };
export type AuthTabPersist = "login" | "register";

export function loadLoginFields(): LoginFieldsPersist | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOGIN_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<LoginFieldsPersist>;
    if (typeof j.identifier !== "string") return null;
    return { identifier: j.identifier };
  } catch {
    return null;
  }
}

export function saveLoginFields(d: LoginFieldsPersist): void {
  try {
    sessionStorage.setItem(LOGIN_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function clearLoginFields(): void {
  try {
    sessionStorage.removeItem(LOGIN_KEY);
  } catch {
    /* ignore */
  }
}

export function loadRegisterFields(): RegisterFieldsPersist | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(REGISTER_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<RegisterFieldsPersist>;
    if (typeof j.email !== "string" || typeof j.phone !== "string" || typeof j.name !== "string") return null;
    return { name: j.name, email: j.email, phone: j.phone };
  } catch {
    return null;
  }
}

export function saveRegisterFields(d: RegisterFieldsPersist): void {
  try {
    sessionStorage.setItem(REGISTER_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function clearRegisterFields(): void {
  try {
    sessionStorage.removeItem(REGISTER_KEY);
  } catch {
    /* ignore */
  }
}

export function loadAuthTab(): AuthTabPersist | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const v = sessionStorage.getItem(TAB_KEY);
    if (v === "login" || v === "register") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveAuthTab(tab: AuthTabPersist): void {
  try {
    sessionStorage.setItem(TAB_KEY, tab);
  } catch {
    /* ignore */
  }
}
