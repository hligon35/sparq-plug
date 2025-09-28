import { NextRequest, NextResponse } from 'next/server';
import { getCreativeProvider } from '@/lib/integrations/registry';
import { saveToken } from '@/lib/tokens';

/**
 * OAuth callback handler for creative providers.
 * Accepts either:
 *  - provider as explicit query param (?provider=canva&code=...)
 *  - or embedded in state param (legacy: state="provider=canva&tenantId=...&actor=...")
 * For production harden with:
 *  - CSRF/state validation (signed value in cookie/session)
 *  - Error param handling from provider (error, error_description)
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const origin = req.nextUrl.origin;
  const providerQuery = url.searchParams.get('provider') || undefined;
  const stateRaw = url.searchParams.get('state') || '';
  const stateParams = new URLSearchParams(stateRaw);

  const providerId = providerQuery || stateParams.get('provider') || '';
  const tenantId = stateParams.get('tenantId') || 'sparq'; // TODO: derive from authenticated session
  const actor = stateParams.get('actor') || 'system'; // TODO: derive user id/email

  const redirectUri = `${origin}/api/integrations/creative/callback${providerQuery ? `?provider=${providerId}` : ''}`;
  const provider = getCreativeProvider(providerId, redirectUri);
  if (!provider) return NextResponse.json({ error: 'Unknown provider' }, { status: 404 });

  try {
    const tokens = await provider.exchangeCodeForToken(code, redirectUri);
    await saveToken({
      tenantId,
      user: actor,
      provider: provider.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
    const back = `${origin}/admin/settings?connected=${encodeURIComponent(provider.id)}`;
    return NextResponse.redirect(back);
  } catch (e: any) {
    return NextResponse.json({ error: 'Token exchange failed', detail: e?.message }, { status: 500 });
  }
}
