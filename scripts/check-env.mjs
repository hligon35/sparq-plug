#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  AUTH_JWT_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  PUBLIC_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('✗ Environment parse errors');
  parsed.error.issues.forEach(i => console.error('-', i.message, `(path: ${i.path.join('.')})`));
  process.exit(1);
}
const env = parsed.data;
const prod = env.NODE_ENV === 'production';
const missing = [];
if (prod && !env.AUTH_JWT_SECRET && !env.JWT_SECRET) missing.push('AUTH_JWT_SECRET');
if (prod && !env.PUBLIC_URL) missing.push('PUBLIC_URL');
if (prod && !env.SMTP_HOST) missing.push('SMTP_HOST');
if (prod && !env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
if (missing.length) {
  console.error('✗ Missing required production vars:', missing.join(', '));
  process.exit(2);
}
console.log('✓ Environment looks valid');
