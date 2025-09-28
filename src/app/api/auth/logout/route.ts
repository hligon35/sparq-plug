import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const limiterOpts = { windowMs: 5 * 60_000, max: 30 }; // generous logout limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = rateLimitCheck(rateLimitKeyFromRequest({ ip, path: '/auth/logout' }), limiterOpts);
  const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
  if (!limit.allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), { status: 429, headers: hdrs });
  }
  const sessionCookie = req.cookies.get('session')?.value;
  const session = await verifySession(sessionCookie);
  if (session) {
    await audit({ actor: `user:${session.sub}`, tenantId: 'system', action: 'auth.logout', target: `user:${session.sub}` });
  } else {
    await audit({ actor: 'anonymous', tenantId: 'system', action: 'auth.logout.no-session', target: 'user:unknown' });
  }
  const res = NextResponse.json({ ok: true }, { headers: hdrs });
  const parts = ['session=','Path=/','HttpOnly','Max-Age=0','SameSite=Lax'];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.headers.set('Set-Cookie', parts.join('; '));
  return res;
}
