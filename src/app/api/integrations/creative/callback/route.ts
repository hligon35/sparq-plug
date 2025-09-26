import { NextRequest, NextResponse } from 'next/server';
import { getCreativeProvider } from '@/lib/integrations/registry';
import { saveToken } from '@/lib/tokens';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') || '';
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const stateParams = new URLSearchParams(state);
  const providerId = stateParams.get('provider') || '';
  const tenantId = stateParams.get('tenantId') || 'sparq';
  const actor = stateParams.get('actor') || 'system';

  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/creative/callback`;
  const provider = getCreativeProvider(providerId, redirectUri);
  if (!provider) return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });

  const tokens = await provider.exchangeCodeForToken(code, redirectUri);
  await saveToken({
    tenantId,
    user: actor,
    provider: provider.id,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });

  // Redirect back to settings page (or integrations page)
  const back = `${origin}/admin/settings?connected=${encodeURIComponent(provider.id)}`;
  return NextResponse.redirect(back);
}
