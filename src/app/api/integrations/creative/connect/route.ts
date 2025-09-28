import { NextRequest, NextResponse } from 'next/server';
import { getCreativeProvider } from '@/lib/integrations/registry';
import { getTenantId, getActor } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get('provider');
  if (!providerId) return NextResponse.json({ error: 'provider required' }, { status: 400 });

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/creative/callback`;
  const provider = getCreativeProvider(providerId, redirectUri);
  if (!provider) return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });

  const state = new URLSearchParams({
    tenantId: getTenantId(req),
    actor: getActor(req),
    provider: providerId,
  }).toString();

  const authUrl = provider.getAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
