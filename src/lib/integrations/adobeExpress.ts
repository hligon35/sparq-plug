import { CreativeProvider } from './providers';

// NOTE: Placeholder endpoints and scopes; update with actual Adobe Express API details when available.
const AUTH_BASE = 'https://auth.services.adobe.com/ims/authorize';
const TOKEN_URL = 'https://ims-na1.adobelogin.com/ims/token';

export function AdobeExpressProvider(params: { clientId: string; clientSecret: string; redirectUri: string }): CreativeProvider {
  const { clientId, clientSecret, redirectUri } = params;
  return {
    id: 'adobe-express',
    displayName: 'Adobe Express',

    getAuthUrl(state: string): string {
      const scope = encodeURIComponent('openid,creative_sdk');
      const ru = encodeURIComponent(redirectUri);
      const st = encodeURIComponent(state);
      return `${AUTH_BASE}?client_id=${clientId}&redirect_uri=${ru}&response_type=code&scope=${scope}&state=${st}`;
    },

    async exchangeCodeForToken(code: string, redir: string) {
      // TODO: Implement OAuth code exchange via server-side POST to TOKEN_URL
      // Return tokens for storage/use. For now, return a placeholder.
      return { accessToken: `adobe_token_${code}`, refreshToken: undefined };
    },

    getEditorEmbedUrl(options) {
      // TODO: Replace with actual Adobe Express editor embed URL when available
      const base = 'https://express.adobe.com/editor';
      const qs = new URLSearchParams();
      if (options.templateId) qs.set('template', options.templateId);
      qs.set('return', options.returnUrl);
      if (options.state) qs.set('state', options.state);
      return `${base}?${qs.toString()}`;
    },

    async getAssetMetadata(assetId: string, _accessToken: string) {
      // TODO: Call Adobe Express asset metadata endpoint
      return { id: assetId, name: `Adobe Asset ${assetId}`, type: 'image/png', previewUrl: undefined };
    },
  };
}
