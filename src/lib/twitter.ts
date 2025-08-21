import axios from 'axios';

const TW_AUTH_URL = 'https://twitter.com/i/oauth2/authorize';
const TW_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const TW_POST_URL = 'https://api.twitter.com/2/tweets';

// Twitter(X) API integration
export async function authenticateTwitter(clientId: string, redirectUri: string) {
  // Redirect user to Twitter OAuth
  return `${TW_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read tweet.write users.read offline.access`;
}

export async function getTwitterAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const res = await axios.post(TW_TOKEN_URL, {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });
  return (res.data as { access_token: string }).access_token;
}

export async function postToTwitter(accessToken: string, content: string) {
  await axios.post(TW_POST_URL, {
    text: content,
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
