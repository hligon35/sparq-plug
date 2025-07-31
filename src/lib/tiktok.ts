import axios from 'axios';

const TT_AUTH_URL = 'https://www.tiktok.com/auth/authorize/';
const TT_TOKEN_URL = 'https://open-api.tiktok.com/oauth/access_token/';
const TT_POST_URL = 'https://open-api.tiktok.com/share/video/upload/';

// TikTok API integration
export async function authenticateTikTok(clientKey: string, redirectUri: string) {
  // Redirect user to TikTok OAuth
  return `${TT_AUTH_URL}?client_key=${clientKey}&redirect_uri=${redirectUri}&scope=user.info.basic,video.list,video.publish`;
}

export async function getTikTokAccessToken(clientKey: string, clientSecret: string, code: string, redirectUri: string) {
  const res = await axios.post(TT_TOKEN_URL, {
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  return (res.data as { access_token: string }).access_token;
}

export async function postToTikTok(accessToken: string, videoPath: string, description: string) {
  // TikTok API requires multipart/form-data for video upload
  const formData = new FormData();
  formData.append('video', videoPath);
  formData.append('description', description);
  formData.append('access_token', accessToken);
  await axios.post(TT_POST_URL, formData);
}
