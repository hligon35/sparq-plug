import { CreativeProvider } from './providers';

// NOTE: Placeholder endpoints; use Canva OAuth details when integrating.
const AUTH_BASE = 'https://www.canva.com/oauth/authorize';
const TOKEN_URL = 'https://www.canva.com/oauth/token';

export function CanvaProvider(params: { clientId: string; clientSecret: string; redirectUri: string }): CreativeProvider {
  const { clientId, clientSecret, redirectUri } = params;
  return {
    id: 'canva',
    displayName: 'Canva',

    getAuthUrl(state: string): string {
      const scope = encodeURIComponent('design:read design:write');
      const ru = encodeURIComponent(redirectUri);
      const st = encodeURIComponent(state);
      return `${AUTH_BASE}?client_id=${clientId}&redirect_uri=${ru}&response_type=code&scope=${scope}&state=${st}`;
    },

    async exchangeCodeForToken(code: string, redir: string) {
      // TODO: Implement OAuth code exchange via server-side POST to TOKEN_URL
      return { accessToken: `canva_token_${code}`, refreshToken: undefined };
    },

    getEditorEmbedUrl(options) {
      // TODO: Replace with Canva publish extension editor URL when available
      const base = 'https://www.canva.com/design';
      const qs = new URLSearchParams();
      if (options.templateId) qs.set('template', options.templateId);
      qs.set('return', options.returnUrl);
      if (options.state) qs.set('state', options.state);
      return `${base}?${qs.toString()}`;
    },

    async getAssetMetadata(assetId: string, _accessToken: string) {
      // TODO: Call Canva asset metadata endpoint
      return { id: assetId, name: `Canva Asset ${assetId}`, type: 'image/png', previewUrl: undefined };
    },
  };
}
