import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, serverError } from '@/lib/apiResponse';
import { listAccounts, createAccount } from '@/lib/emailAccounts';

export async function GET(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/email/accounts:GET', capability: 'email_setup', rate: { windowMs: 10_000, max: 50 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const accounts = await listAccounts();
    return ok({ accounts });
  } catch (e:any) {
    return serverError(e.message || 'Failed to load accounts');
  }
}

export async function POST(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/email/accounts:POST', capability: 'email_setup', rate: { windowMs: 10_000, max: 30 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const body = await req.json();
    if (!body?.address) return badRequest('address required');
    const account = await createAccount({
      address: String(body.address),
      displayName: body.displayName ? String(body.displayName) : undefined,
      username: body.username ? String(body.username) : undefined,
      forwarding: Array.isArray(body.forwarding) ? body.forwarding.map(String) : undefined,
      signature: body.signature ? String(body.signature) : undefined,
      notes: body.notes ? String(body.notes) : undefined,
      provider: body.provider && ['local','google','microsoft'].includes(body.provider) ? body.provider : 'local'
    });
    return ok({ account });
  } catch (e:any) {
    return badRequest(e.message || 'Failed to create');
  }
}
