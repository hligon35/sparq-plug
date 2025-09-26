import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok } from '@/lib/apiResponse';
import fs from 'node:fs';

export async function GET(request: NextRequest) {
  // Both admin and manager should see capability status
  const g = apiGuard(request, { path: '/api/email-setup/capabilities:GET', capability: 'email_setup', rate: { windowMs: 60_000, max: 60 }, csrf: false });
  if (g instanceof Response) return g;

  const enabled = process.env.LOCAL_MAILBOX_ENABLED === 'true';
  const scriptPath = process.env.LOCAL_MAILBOX_SCRIPT || '';
  const scriptConfigured = Boolean(scriptPath);
  const scriptExists = scriptConfigured ? fs.existsSync(scriptPath) : false;

  return ok({
    local: {
      enabled,
      scriptConfigured,
      scriptExists,
    },
  });
}
