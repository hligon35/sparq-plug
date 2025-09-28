export interface PasswordPolicyResult {
  ok: boolean;
  score: number;
  errors: string[];
}

export function evaluatePassword(pw: string): PasswordPolicyResult {
  const errors: string[] = [];
  if (pw.length < 12) errors.push('Must be at least 12 characters');
  if (!/[a-z]/.test(pw)) errors.push('Add a lowercase letter');
  if (!/[A-Z]/.test(pw)) errors.push('Add an uppercase letter');
  if (!/[0-9]/.test(pw)) errors.push('Add a number');
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push('Add a symbol');
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (errors.length) score = Math.min(score, 2);
  return { ok: errors.length === 0, score, errors };
}
