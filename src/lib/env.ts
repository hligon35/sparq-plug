import { z } from 'zod';

// Core server-side required variables (production)
const serverSchema = z.object({
  NODE_ENV: z.string().default('development'),
  AUTH_JWT_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  PUBLIC_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  DATA_DIR: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
  DEFAULT_TENANT_ID: z.string().optional(),
  INVITE_TTL_DAYS: z.string().optional(),
  ADOBE_EXPRESS_CLIENT_ID: z.string().optional(),
  ADOBE_EXPRESS_CLIENT_SECRET: z.string().optional(),
  CANVA_CLIENT_ID: z.string().optional(),
  CANVA_CLIENT_SECRET: z.string().optional(),
  ENFORCE_CSRF: z.string().optional(),
}).transform(v => {
  const secret = v.AUTH_JWT_SECRET || v.JWT_SECRET;
  return { ...v, JWT_COMBINED_SECRET: secret };
});

export type ServerEnv = z.infer<typeof serverSchema> & { JWT_COMBINED_SECRET?: string };

let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Environment validation errors:', parsed.error.issues);
    throw new Error('Invalid server environment');
  }
  const env = parsed.data;
  if (env.NODE_ENV === 'production') {
    const missing: string[] = [];
    if (!env.JWT_COMBINED_SECRET) missing.push('AUTH_JWT_SECRET (or JWT_SECRET)');
    if (!env.PUBLIC_URL) missing.push('PUBLIC_URL');
    if (!env.SMTP_HOST) missing.push('SMTP_HOST');
    if (!env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.error('[env] Missing required production variables:', missing.join(', '));
      throw new Error('Missing required production environment variables');
    }
  }
  cached = env;
  return env;
}

export function requireSecret(): string {
  const env = getEnv();
  if (!env.JWT_COMBINED_SECRET) throw new Error('Missing AUTH_JWT_SECRET or JWT_SECRET');
  return env.JWT_COMBINED_SECRET;
}
