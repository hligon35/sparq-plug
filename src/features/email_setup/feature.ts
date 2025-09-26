// Email Setup feature flag.
// Use NEXT_PUBLIC_FEATURE_EMAIL_SETUP for client-side availability.
// (Legacy support: FEATURE_EMAIL_SETUP still works on server render.)
export function isEmailSetupEnabled(): boolean {
  const flag = (process.env.NEXT_PUBLIC_FEATURE_EMAIL_SETUP ?? process.env.FEATURE_EMAIL_SETUP) === 'true';
  return flag;
}
