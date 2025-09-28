import { AdobeExpressProvider } from './adobeExpress';
import { CanvaProvider } from './canva';
import type { CreativeProvider } from './providers';

export function getCreativeProviders(baseRedirectUri: string): CreativeProvider[] {
  const redirectUri = baseRedirectUri;
  const providers: CreativeProvider[] = [];
  const adobeId = process.env.ADOBE_EXPRESS_CLIENT_ID;
  const canvaId = process.env.CANVA_CLIENT_ID;

  if (adobeId) providers.push(AdobeExpressProvider({ clientId: adobeId, clientSecret: 'secret-in-server', redirectUri }));
  if (canvaId) providers.push(CanvaProvider({ clientId: canvaId, clientSecret: 'secret-in-server', redirectUri }));
  return providers;
}

export function getCreativeProvider(id: string, baseRedirectUri: string): CreativeProvider | undefined {
  return getCreativeProviders(baseRedirectUri).find((p) => p.id === id);
}
