import { SignJWT, jwtVerify } from 'jose';
import { requireSecret } from './env';

const ALG = 'HS256';
const ISS = 'sparq-plug';
const AUD = 'sparq-plug-users';

function getSecret() {
  return new TextEncoder().encode(requireSecret());
}

export interface SessionPayload { sub: string; role: 'admin' | 'manager' | 'client' }

export async function signSession(payload: SessionPayload, expiresIn = '7d') {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISS)
    .setAudience(AUD)
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: ISS, audience: AUD });
    return payload as any;
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800'
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}