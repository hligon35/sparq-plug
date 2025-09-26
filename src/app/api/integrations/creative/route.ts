import { NextRequest, NextResponse } from 'next/server';
import { AdobeExpressProvider } from '@/lib/integrations/adobeExpress';
import { CanvaProvider } from '@/lib/integrations/canva';

/**
 * GET /api/integrations/creative
 * Returns metadata for available creative providers and their authorization URLs (no secrets)
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUri = `${origin}/api/integrations/creative/callback`;
  const state = 'init';

  const adobe = AdobeExpressProvider({
    clientId: process.env.ADOBE_EXPRESS_CLIENT_ID || 'set_me',
    clientSecret: 'never_sent_client_side',
    redirectUri,
  });
  const canva = CanvaProvider({
    clientId: process.env.CANVA_CLIENT_ID || 'set_me',
    clientSecret: 'never_sent_client_side',
    redirectUri,
  });

  return NextResponse.json({
    providers: [
      { id: adobe.id, name: adobe.displayName, authUrl: adobe.getAuthUrl(state) },
      { id: canva.id, name: canva.displayName, authUrl: canva.getAuthUrl(state) },
    ],
  });
}
