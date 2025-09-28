/**
 * Optional HaveIBeenPwned k-anonymity password breach check (stub).
 * Enable via ENABLE_PWNED_CHECK=true and supply a fetch implementation if needed.
 * Currently returns a mocked value until integrated.
 */

export async function isBreachedPassword(_password: string): Promise<boolean> {
  if (process.env.ENABLE_PWNED_CHECK !== 'true') return false;
  // TODO: Implement k-anonymity (hash prefix to HIBP API, compare suffix counts)
  return false;
}