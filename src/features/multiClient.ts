// Multi-client management logic
export interface Client {
  id: string;
  name: string;
  email: string;
  socialAccounts: SocialAccount[];
}

export interface SocialAccount {
  platform: 'facebook' | 'twitter' | 'instagram' | 'tiktok' | 'linkedin';
  accountId: string;
  accessToken: string;
}

export const clients: Client[] = [];
// ...add CRUD logic here...
