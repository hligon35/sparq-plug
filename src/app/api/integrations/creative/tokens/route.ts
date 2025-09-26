import { NextRequest, NextResponse } from 'next/server';
import { listTokens, revokeToken } from '@/lib/tokens';

/**
 * GET /api/integrations/creative/tokens?tenant=XXX
 *  -> lists stored tokens for a tenant (placeholder auth)
 * DELETE /api/integrations/creative/tokens?tenant=XXX&provider=canva&user=user-id
 *  -> revokes a token
 */
export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get('tenant') || 'sparq';
  const items = await listTokens(tenant);
  // Hide actual access tokens by default
  return NextResponse.json({ tokens: items.map(t => ({ ...t, accessToken: '***' })) });
}

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const tenant = params.get('tenant') || 'sparq';
  const provider = params.get('provider');
  const user = params.get('user') || undefined;
  if (!provider) return NextResponse.json({ error: 'provider required' }, { status: 400 });
  const ok = await revokeToken(provider, tenant, user);
  return NextResponse.json({ revoked: ok });
}
