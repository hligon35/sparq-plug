import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, serverError, notFound } from '@/lib/apiResponse';
import { getAccount, updateAccount } from '@/lib/emailAccounts';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/email/accounts/[id]:PATCH', capability: 'email_setup', rate: { windowMs: 10_000, max: 40 }, csrf: false });
  if (g instanceof Response) return g;
  const { id } = params;
  try {
    const existing = await getAccount(id);
    if (!existing) return notFound('Account');
    const body = await req.json().catch(()=>({}));
    const updated = await updateAccount(id, {
      displayName: body.displayName,
      username: body.username,
      forwarding: Array.isArray(body.forwarding) ? body.forwarding.map(String) : undefined,
      signature: body.signature,
      active: typeof body.active === 'boolean' ? body.active : undefined,
      notes: body.notes,
      provider: body.provider && ['local','google','microsoft'].includes(body.provider) ? body.provider : undefined
    });
    return ok({ account: updated });
  } catch (e:any) {
    return badRequest(e.message || 'Failed to update');
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/email/accounts/[id]:GET', capability: 'email_setup', rate: { windowMs: 10_000, max: 60 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const acc = await getAccount(params.id);
    if (!acc) return notFound('Account');
    return ok({ account: acc });
  } catch (e:any) {
    return serverError(e.message || 'Failed');
  }
}
