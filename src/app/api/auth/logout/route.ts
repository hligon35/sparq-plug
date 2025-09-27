import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  const session = await verifySession(sessionCookie);
  if (session) {
    await audit({ actor: `user:${session.sub}`, tenantId: 'system', action: 'auth.logout', target: `user:${session.sub}` });
  } else {
    await audit({ actor: 'anonymous', tenantId: 'system', action: 'auth.logout.no-session', target: 'user:unknown' });
  }
  const res = NextResponse.json({ ok: true });
  const parts = ['session=','Path=/','HttpOnly','Max-Age=0','SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.headers.set('Set-Cookie', parts.join('; '));
  return res;
}
