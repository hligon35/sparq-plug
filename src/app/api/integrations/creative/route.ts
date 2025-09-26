import { NextRequest, NextResponse } from 'next/server';
import { AdobeExpressProvider } from '@/lib/integrations/adobeExpress';
import { CanvaProvider } from '@/lib/integrations/canva';

/**
 * NOTE: This route only returns metadata + auth URLs. It purposely does NOT expose client secrets.
 * Secrets must be placed in environment variables (see docs/integrations.md):
 *  - ADOBE_EXPRESS_CLIENT_ID
 *  - ADOBE_EXPRESS_CLIENT_SECRET
 *  - CANVA_CLIENT_ID
 *  - CANVA_CLIENT_SECRET
 */

/**
 * GET /api/integrations/creative
 * Returns metadata for available creative providers and their authorization URLs (no secrets)
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  // We include provider as explicit query param on redirect to simplify callback parsing.
  const adobeRedirect = `${origin}/api/integrations/creative/callback?provider=adobe-express`;
  const canvaRedirect = `${origin}/api/integrations/creative/callback?provider=canva`;
  // TODO: Generate a cryptographically secure state & persist (e.g. cookie or KV). For now random.
  const stateAdobe = `adobe-${Math.random().toString(36).slice(2)}`;
  const stateCanva = `canva-${Math.random().toString(36).slice(2)}`;

  const adobe = AdobeExpressProvider({
    clientId: process.env.ADOBE_EXPRESS_CLIENT_ID || 'set_me',
    clientSecret: process.env.ADOBE_EXPRESS_CLIENT_SECRET || 'placeholder',
    redirectUri: adobeRedirect,
  });
  const canva = CanvaProvider({
    clientId: process.env.CANVA_CLIENT_ID || 'set_me',
    clientSecret: process.env.CANVA_CLIENT_SECRET || 'placeholder',
    redirectUri: canvaRedirect,
  });

  return NextResponse.json({
    providers: [
      { id: adobe.id, name: adobe.displayName, authUrl: adobe.getAuthUrl(stateAdobe) },
      { id: canva.id, name: canva.displayName, authUrl: canva.getAuthUrl(stateCanva) },
    ],
  });
}
