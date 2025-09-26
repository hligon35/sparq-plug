# Creative Integrations (Adobe Express & Canva)

This document outlines how the OAuth-based creative provider integrations are wired and where to supply secrets.

## Environment Variables (Place in `.env.local` for dev, real secrets in deployment env)

Required (set only those you intend to enable):

```bash
ADOBE_EXPRESS_CLIENT_ID=
ADOBE_EXPRESS_CLIENT_SECRET=
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
```

> Never commit real secrets. In production (e.g., Docker/Render/Kubernetes) inject as runtime environment variables.

## Flow Overview

1. Client requests `GET /api/integrations/creative` -> receives provider list with `authUrl`.
2. User clicks provider authUrl (opens provider consent screen).
3. Provider redirects to `/api/integrations/creative/callback?code=...&provider=PROVIDER_ID` (or legacy state format) where we:
   - Exchange code for access token (currently stubbed in provider adapters).
   - Persist token via `saveToken` in `src/lib/tokens.ts` (JSON file store fallback).
4. UI can list tokens via `GET /api/integrations/creative/tokens?tenant=TENANT_ID`.
5. Token revocation via `DELETE /api/integrations/creative/tokens?tenant=TENANT_ID&provider=canva&user=USER_ID`.

## Files Added / Updated

- `src/app/api/integrations/creative/route.ts` – returns provider metadata & auth URLs (now provider-specific redirect + random state).
- `src/app/api/integrations/creative/callback/route.ts` – handles OAuth return, persists tokens.
- `src/app/api/integrations/creative/tokens/route.ts` – list & revoke tokens (no real auth yet).
- `src/lib/integrations/adobeExpress.ts` – adapter stub (replace token exchange TODO).
- `src/lib/integrations/canva.ts` – adapter stub (replace token exchange TODO).
- `src/lib/integrations/providers.ts` – provider interfaces.
- `src/lib/integrations/registry.ts` – dynamic provider registry (used by callback legacy path/state).
- `src/lib/tokens.ts` – generic token persistence layer.

## Implementing Real Token Exchange

Replace the `exchangeCodeForToken` stubs inside each provider with real POST requests:

Example pattern (pseudo-code):
```ts
const res = await fetch(TOKEN_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  }),
});
if (!res.ok) throw new Error('Token exchange failed');
const json = await res.json();
return { accessToken: json.access_token, refreshToken: json.refresh_token };
```

## Persisting Beyond JSON

To harden for production:
- Replace JSON storage in `tokens.ts` with a database or encrypted KV.
- Encrypt at rest (e.g., using libsodium) before writing.
- Track `expires_in` and implement refresh token flow (add endpoint or background refresh job).

## Security TODOs
- State parameter signing & validation.
- Auth session enforcement (derive tenantId + user from session instead of placeholders).
- Proper error surfaces for end-user UI.
- Refresh / revoke flows per provider documentation.

## Quick Test (Dev Stub)
1. Set fake IDs (they don’t need to be valid while stubs are in place):

```bash
ADOBE_EXPRESS_CLIENT_ID=demo_adobe
ADOBE_EXPRESS_CLIENT_SECRET=demo_secret
CANVA_CLIENT_ID=demo_canva
CANVA_CLIENT_SECRET=demo_secret
```

1. Hit `/api/integrations/creative` – you’ll get auth URLs.
1. Manually visit one URL; after redirect you should land on settings with `?connected=provider`.
1. List tokens: `/api/integrations/creative/tokens?tenant=sparq`.

\n## Next Steps (Optional Enhancements)

- UI page to manage creative connections.
- Asset picker route integrating provider APIs.
- Embedding editor via `getEditorEmbedUrl` return in an iframe or new tab.

---
Place secrets now in: `.env.local` (development) and appropriate deployment environment for production.
