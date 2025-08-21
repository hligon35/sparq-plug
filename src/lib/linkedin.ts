import axios from 'axios';

const LI_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LI_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LI_POST_URL = 'https://api.linkedin.com/v2/ugcPosts';

// LinkedIn API integration
export async function authenticateLinkedIn(clientId: string, redirectUri: string) {
  // Redirect user to LinkedIn OAuth
  return `${LI_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=w_member_social,r_liteprofile`;
}

export async function getLinkedInAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  const res = await axios.post(LI_TOKEN_URL, params);
  return (res.data as { access_token: string }).access_token;
}

export async function postToLinkedIn(accessToken: string, authorUrn: string, content: string) {
  await axios.post(LI_POST_URL, {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
