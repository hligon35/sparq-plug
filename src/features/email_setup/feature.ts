export function isEmailSetupEnabled(): boolean {
  return process.env.FEATURE_EMAIL_SETUP === 'true';
}
