import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, notFound } from '@/lib/apiResponse';
import { getAccount, resetAccountPassword } from '@/lib/emailAccounts';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/email/accounts/[id]/reset-password:POST', capability: 'email_setup', rate: { windowMs: 60_000, max: 10 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const acc = await getAccount(params.id);
    if (!acc) return notFound('Account');
    const token = await resetAccountPassword(params.id);
    return ok(token);
  } catch (e:any) {
    return badRequest(e.message || 'Failed to reset');
  }
}
