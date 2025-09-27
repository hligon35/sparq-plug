export type FeatureFlag =
  | 'email_setup'
  | 'bot_factory'
  | 'new_scheduler_metrics'
  | 'audit_logging'
  | 'advanced_validation';

interface FlagDefinition {
  description: string;
  default: boolean;
  env?: string; // environment variable name controlling it
}

const registry: Record<FeatureFlag, FlagDefinition> = {
  email_setup: { description: 'Email setup wizard & account management', default: true, env: 'NEXT_PUBLIC_FEATURE_EMAIL_SETUP' },
  bot_factory: { description: 'AI Bot creation feature', default: false, env: 'NEXT_PUBLIC_FEATURE_BOT_FACTORY' },
  new_scheduler_metrics: { description: 'Expose enhanced scheduling metrics layer', default: false, env: 'NEXT_PUBLIC_FEATURE_SCHEDULER_METRICS' },
  audit_logging: { description: 'Enable audit logging for sensitive actions', default: false, env: 'NEXT_PUBLIC_FEATURE_AUDIT_LOGGING' },
  advanced_validation: { description: 'Use zod schemas for strict validation', default: true, env: 'NEXT_PUBLIC_FEATURE_ADV_VALIDATION' },
};

export function isFlagEnabled(flag: FeatureFlag): boolean {
  const def = registry[flag];
  if (!def) return false;
  if (def.env) {
    const raw = process.env[def.env];
    if (raw === '1' || raw === 'true') return true;
    if (raw === '0' || raw === 'false') return false;
  }
  return def.default;
}

export function listFlags() {
  return Object.entries(registry).map(([key, value]) => ({ key, ...value, enabled: isFlagEnabled(key as FeatureFlag) }));
}
