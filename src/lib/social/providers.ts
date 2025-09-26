export interface SocialAuthProvider {
  getAuthUrl(state: string): string;
  exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string }>;
}

export interface PublishPayload {
  text?: string;
  mediaUrl?: string;
  scheduledAt?: string; // ISO
}

export interface SocialProvider extends SocialAuthProvider {
  id: string; // e.g., 'facebook', 'twitter', 'linkedin'
  displayName: string;
  publish(accessToken: string, payload: PublishPayload): Promise<{ id: string; status: 'scheduled' | 'posted' }>;
  deletePost?(accessToken: string, postId: string): Promise<void>;
}
