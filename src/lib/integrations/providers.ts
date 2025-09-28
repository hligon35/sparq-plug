/**
 * Integration Provider Contracts
 *
 * Defines minimal interfaces for creative providers (Adobe Express, Canva) and
 * social networks, enabling adapter-based integrations.
 */

export interface CreativeProviderAuth {
  getAuthUrl(state: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string }>;
}

export interface CreativeProviderAssets {
  // Embed an editor or asset picker via URL (to be used in iFrame or new window)
  getEditorEmbedUrl(options: { templateId?: string; returnUrl: string; state?: string }): string;
  // Resolve asset metadata or direct download URL from provider
  getAssetMetadata(assetId: string, accessToken: string): Promise<{
    id: string;
    name: string;
    type: string;
    previewUrl?: string;
    downloadUrl?: string;
    width?: number;
    height?: number;
  }>;
}

export interface CreativeProvider extends CreativeProviderAuth, CreativeProviderAssets {
  readonly id: string; // 'adobe-express', 'canva'
  readonly displayName: string;
}
