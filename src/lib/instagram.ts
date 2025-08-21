import axios from 'axios';

const IG_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
const IG_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const IG_POST_URL = 'https://graph.facebook.com/v19.0/{user-id}/media';

// Instagram API integration
export async function authenticateInstagram(clientId: string, redirectUri: string) {
  // Redirect user to Instagram OAuth
  return `${IG_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
}

export async function getInstagramAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const res = await axios.post(IG_TOKEN_URL, {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code,
  });
  return (res.data as { access_token: string }).access_token;
}

export async function postToInstagram(accessToken: string, userId: string, imageUrl: string, caption: string) {
  await axios.post(IG_POST_URL.replace('{user-id}', userId), {
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });
}
