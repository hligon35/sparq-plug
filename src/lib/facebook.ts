import axios from 'axios';

const FB_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const FB_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const FB_POST_URL = 'https://graph.facebook.com/v19.0/me/feed';

// Facebook API integration
export async function authenticateFacebook(clientId: string, redirectUri: string) {
  // Redirect user to Facebook OAuth
  return `${FB_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement,pages_show_list,publish_to_groups`;
}

export async function getFacebookAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const res = await axios.get(FB_TOKEN_URL, {
    params: {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
  });
  return (res.data as { access_token: string }).access_token;
}

export async function postToFacebook(accessToken: string, content: string) {
  await axios.post(FB_POST_URL, {
    message: content,
    access_token: accessToken,
  });
}
