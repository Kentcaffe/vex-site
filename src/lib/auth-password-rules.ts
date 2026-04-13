/** Client + server aligned password rules for registration. */
export type PasswordRulesState = {
  min8: boolean;
  digit: boolean;
  special: boolean;
};

export function evaluatePasswordRules(password: string): PasswordRulesState {
  return {
    min8: password.length >= 8,
    digit: /\d/.test(password),
    special: /[^a-zA-Z0-9\s]/.test(password),
  };
}

export function passwordMeetsAllRules(password: string): boolean {
  const r = evaluatePasswordRules(password);
  return r.min8 && r.digit && r.special;
}
