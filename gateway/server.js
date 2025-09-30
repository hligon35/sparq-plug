// Session + Redis (version-safe) — modules are loaded conditionally so missing deps don't crash startup
// Load gateway-specific environment variables early (does not affect Next.js). Falls back silently if dotenv missing.
try {
  const dotenv = require('dotenv');
  // Allow override of env file via GATEWAY_ENV_FILE, else try .env.gateway then .env
  const envFile = process.env.GATEWAY_ENV_FILE || (require('fs').existsSync('.env.gateway') ? '.env.gateway' : '.env');
  dotenv.config({ path: envFile });
  // eslint-disable-next-line no-console
  console.log(`[gateway] loaded environment file: ${envFile}`);
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[gateway] dotenv not available or load failed -> relying on process environment');
}
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
let session, connectRedis, createClient, helmet;
try { session = require('express-session'); } catch (e) { console.warn('[gateway] express-session not installed -> session support disabled'); }
try { connectRedis = require('connect-redis'); } catch (e) { console.warn('[gateway] connect-redis not installed -> Redis session store disabled'); }
try { ({ createClient } = require('redis')); } catch (e) { console.warn('[gateway] redis client not installed -> Redis session store disabled'); }
try { helmet = require('helmet'); } catch (e) { console.warn('[gateway] helmet not installed -> security headers reduced'); }

// Normalize basePath early so that a trailing slash in APP_BASE_PATH (e.g. "/app/")
// does not break explicit route matches like `${basePath}/login.html` (which would
// otherwise become "/app//login.html" and fail to match a request for "/app/login.html").
// Rules:
//  - Ensure leading slash
//  - Remove trailing slash (except if path is just "/")
//  - Collapse multiple consecutive slashes
const basePath = (() => {
  let bp = process.env.APP_BASE_PATH || '/app';
  if (!bp.startsWith('/')) bp = '/' + bp;        // ensure leading slash
  bp = bp.replace(/\/+$/, '');                  // strip trailing slashes
  if (bp === '') bp = '/';
  bp = bp.replace(/\/+/, '/');                  // collapse duplicate leading slashes
  return bp;
})();
const upstream = process.env.APP_URL || 'http://localhost:3000';

const redisClient = (createClient && process.env.REDIS_URL) ? createClient({ url: process.env.REDIS_URL }) : null;
let storeReady = false;

if (redisClient) {
  redisClient.on('error', (err) => { console.error('Redis error:', err); storeReady = false; });
  (async () => {
    try {
      await redisClient.connect();
      storeReady = true;
      console.log('Redis connected for session store');
    } catch (e) {
      console.error('Redis connect failed:', e.message);
    }
  })();
}

// Handle connect-redis v6 and v7
let RedisStore;
if (connectRedis && session) {
  if (connectRedis.RedisStore) {
    RedisStore = connectRedis.RedisStore; // v7
  } else if (typeof connectRedis === 'function' && connectRedis.length >= 1) {
    RedisStore = connectRedis(session);   // v6 factory
  } else if (connectRedis.default) {
    RedisStore = connectRedis.default;    // alt export
  }
}

app.set('trust proxy', 1);
if (helmet) app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));
// Identify gateway responses distinctly from upstream Next
app.use((req, res, next) => {
  res.setHeader('X-Gateway', 'sparqplug');
  next();
});
if (session) {
  const SESSION_SECRETS = (process.env.SESSION_SECRETS || process.env.SESSION_SECRET || 'changeme')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  let store;
  if (RedisStore && redisClient) {
    try { store = new RedisStore({ client: redisClient }); }
    catch (e) { console.warn('[gateway] RedisStore init failed ->', e.message); }
  }
  app.use(session({
    name: process.env.SESSION_NAME || 'portal.sid',
    secret: SESSION_SECRETS.length > 1 ? SESSION_SECRETS : SESSION_SECRETS[0],
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      domain: process.env.SESSION_DOMAIN || undefined,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    },
    store,
  }));
} else {
  console.warn('[gateway] Session middleware disabled (express-session missing)');
}

// Normalize duplicate basePath occurrences like /app/app/login -> /app/login
app.use((req, res, next) => {
  const bp = basePath || '';
  if (!bp) return next();
  if (req.url.startsWith(bp + bp)) {
    let fixed = req.url;
    while (fixed.startsWith(bp + bp)) fixed = fixed.slice(bp.length);
    return res.redirect(301, fixed);
  }
  // Trailing slash normalization: previously redirected /app -> /app/.
  // Disabled to avoid potential redirect loop with upstream Next.js which may redirect /app/ -> /app.
  // if (req.url === bp) {
  //   return res.redirect(301, `${bp}/`);
  // }
  return next();
});

// Health
app.get('/healthz', (req, res) => {
  res.json({ ok: true, service: 'sparqplug-gateway', storeReady });
});

// Readiness: upstream (and redis if configured) must be OK
app.get('/ready', async (req, res) => {
  const details = { upstream: {}, redis: null };
  let upstreamOk = false;
  try {
    const r = await fetch(`${upstream}${basePath}/api/healthz`);
    details.upstream.status = r.status;
    upstreamOk = r.ok;
  } catch (e) {
    details.upstream.error = e.message;
  }
  if (redisClient) {
    details.redis = { configured: true, connected: storeReady };
  }
  const ok = upstreamOk && (!redisClient || storeReady);
  res.status(ok ? 200 : 503).json({ ok, ...details });
});

// Upstream app health: probe Next.js directly (bypasses auth/SSO)
app.get('/_app_health', async (req, res) => {
  const results = { ok: false, target: upstream, checks: {} };
  const bp = basePath || '';
  try {
    const t0 = Date.now();
    const rRoot = await fetch(upstream + (bp || '') + '/', { method: 'HEAD' }).catch(() => null);
    results.checks.root = rRoot ? { status: rRoot.status, ms: Date.now() - t0 } : { error: 'no response' };
  } catch (e) {
    results.checks.root = { error: e.message };
  }
  try {
    const t1 = Date.now();
    const rChunk = await fetch(upstream + (bp || '') + '/_next/static/chunks', { method: 'HEAD' }).catch(() => null);
    results.checks.chunks = rChunk ? { status: rChunk.status, ms: Date.now() - t1 } : { error: 'no response' };
  } catch (e) {
    results.checks.chunks = { error: e.message };
  }
  results.ok = [results.checks.root?.status, results.checks.chunks?.status].some(s => s && s >= 200 && s < 500);
  res.status(results.ok ? 200 : 502).json(results);
});

// Small helper to map role to path
function rolePath(role) {
  return role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/client';
}

// Session / SSO gate: optionally disable SSO redirects with DISABLE_SSO=true or PORTAL_HOST=disabled
app.use((req, res, next) => {
  if (req.path === '/healthz' || req.path === '/ready') return next();
  const bp = basePath || '';
  // Public / framework assets
  if (
    (bp && req.path.startsWith(`${bp}/_next`)) ||
    (bp && req.path.startsWith(`${bp}/assets`)) ||
    (bp && req.path.startsWith(`${bp}/favicon`)) ||
    (bp && (req.path === `${bp}` || req.path === `${bp}/`)) ||
    req.path === '/_diag' ||
    req.path.startsWith('/_next') || req.path.startsWith('/assets') || req.path.startsWith('/favicon')
  ) return next();

  // Treat /login.html and root as local-auth entry points; allow them through without external SSO redirect
  const loginLike = (
    req.path === '/login' ||
    req.path === '/login.html' ||
    req.path === `${bp}/login` ||
    req.path === `${bp}/login.html` ||
    req.path.startsWith(`${bp}${bp}/login`)
  );
  const rootPath = req.path === '/' || (bp && (req.path === bp || req.path === `${bp}/`));
  if (loginLike || rootPath) return next();

  if (req.session && req.session.user) return next();

  // Deprecated: legacy portal host removed. Use PORTAL_HOST if explicitly set; otherwise disable SSO flow.
  const portal = process.env.PORTAL_HOST || 'disabled';
  const disableSSO = process.env.DISABLE_SSO === 'true' || portal === 'disabled' || portal === req.headers.host;
  if (disableSSO) {
    // Allow request to proceed to upstream so app can render its own login / access control
    return next();
  }
  const host = req.headers.host || 'sparqplug.getsparqd.com';
  const proto = 'https';
  const returnTo = encodeURIComponent(`${proto}://${host}${req.originalUrl || '/'}`);
  return res.redirect(`https://${portal}/login?sso=1&returnTo=${returnTo}`);
});

// Diagnostic endpoint to confirm which gateway instance is serving traffic
app.get('/_diag', (req, res) => {
  res.json({
    ok: true,
    dirname: __dirname,
    basePath,
    env: {
      APP_BASE_PATH: process.env.APP_BASE_PATH || null,
      APP_URL: process.env.APP_URL || null,
      PORTAL_HOST: process.env.PORTAL_HOST || null,
    },
    time: new Date().toISOString(),
    signature: 'sparqplug-gateway-diag-v1'
  });
});

// Chunk/asset existence diagnostic (regex route to avoid path-to-regexp wildcard issues)
// Usage: /_diag/chunk/app/login/page-<hash>.js
app.get(/^\/_diag\/chunk\/(.+)$/i, async (req, res) => {
  try {
    const rel = (req.params[0] || '').replace(/^\/+/, '');
    if (!rel) return res.status(400).json({ ok: false, error: 'missing_path' });
    const upstreamUrl = `${upstream}${basePath}/_next/static/chunks/${rel}`;
    const t0 = Date.now();
    let r;
    try { r = await fetch(upstreamUrl, { method: 'HEAD' }); } catch (err) { r = { status: 0, _err: err }; }
    return res.json({
      ok: r && r.status >= 200 && r.status < 400,
      request: rel,
      upstreamUrl,
      status: r && r.status,
      ms: Date.now() - t0,
      error: r && r._err ? r._err.message : undefined,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// Real static login landing page (served by gateway) when SSO is disabled/forced.
// This avoids any dependency on upstream Next for the first render.
const STATIC_LOGIN_HTML = (title = 'Login') => `<!DOCTYPE html><html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; margin:0; background:#0e1117; color:#eee; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .card { background:#1c222b; padding:2.25rem 2.5rem; border-radius:16px; width:100%; max-width:420px; box-shadow:0 4px 18px rgba(0,0,0,.45); }
    h1 { margin:.2rem 0 1.2rem; font-size:1.8rem; letter-spacing:.5px; }
    label { display:block; font-size:.8rem; text-transform:uppercase; letter-spacing:1px; margin:.75rem 0 .25rem; color:#9fb3c8; }
    input { width:100%; padding:.75rem .9rem; border:1px solid #2c3744; background:#12171d; color:#eee; border-radius:8px; font-size:.95rem; }
    input:focus { outline:2px solid #2563eb; border-color:#2563eb; }
    button { margin-top:1.25rem; width:100%; padding:.85rem 1rem; background:#2563eb; border:none; color:#fff; font-weight:600; font-size:1rem; border-radius:8px; cursor:pointer; letter-spacing:.5px; }
    button:hover { background:#1d4ed8; }
    .muted { margin-top:1.5rem; font-size:.75rem; line-height:1.2; color:#8aa0b8; text-align:center; }
    .env { font-size:.65rem; margin-top:1rem; opacity:.55; text-align:center; }
    a { color:#3b82f6; text-decoration:none; }
    a:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>SparQ Plug</h1>
    <form id="loginForm" method="post" action="${basePath}/api/dev-login">
      <label for="username">Username</label>
      <input id="username" name="username" required autocomplete="username" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" required autocomplete="current-password" />
      <button type="submit">Sign In</button>
    </form>
    <div class="muted">SSO disabled locally. This form performs a development session bootstrap only.</div>
    <div class="env">BasePath: ${basePath}</div>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = Object.fromEntries(fd.entries());
      const r = await fetch(e.target.action, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if (r.ok) { window.location = '${basePath}/'; } else { alert('Login failed'); }
    });
  </script>
</body></html>`;

// Explicit static login page route (both root and basePath) - but we also add a stricter basePath-only version below
app.get(['/login.html', `${basePath}/login.html`], (req, res, next) => {
  const portal = process.env.PORTAL_HOST || 'disabled';
  const host = req.headers.host || 'sparqplug.getsparqd.com';
  const forceLocal = process.env.FORCE_LOCAL_LOGIN === 'true';
  const disableSSO = forceLocal || process.env.DISABLE_SSO === 'true' || portal === 'disabled' || portal === host;
  if (!disableSSO) return res.redirect(302, `${basePath}/login`); // fall through to SSO/Next route if enabled
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Login-Mode', 'static-local');
  return res.end(STATIC_LOGIN_HTML(process.env.LOGIN_PAGE_TITLE || 'Login'));
});

// Strongly prefer basePath-scoped /app/login.html: if user hits root /login.html and basePath exists, redirect to namespaced variant
if (basePath && basePath !== '/' ) {
  app.get('/login.html', (req, res, next) => {
    const portal = process.env.PORTAL_HOST || 'disabled';
    const host = req.headers.host || 'sparqplug.getsparqd.com';
    const forceLocal = process.env.FORCE_LOCAL_LOGIN === 'true';
    const disableSSO = forceLocal || process.env.DISABLE_SSO === 'true' || portal === 'disabled' || portal === host;
    if (!disableSSO) return res.redirect(302, `${basePath}/login`);
    return res.redirect(302, `${basePath}/login.html`);
  });
}

// Dev login API (only active when SSO disabled). Creates a faux session user.
app.post(`${basePath}/api/dev-login`, express.json(), (req, res) => {
  const portal = process.env.PORTAL_HOST || 'disabled';
  const host = req.headers.host || 'sparqplug.getsparqd.com';
  const forceLocal = process.env.FORCE_LOCAL_LOGIN === 'true';
  const disableSSO = forceLocal || process.env.DISABLE_SSO === 'true' || portal === 'disabled' || portal === host;
  if (!disableSSO) return res.status(403).json({ error: 'forbidden_in_prod' });
  if (!session) return res.status(500).json({ error: 'session_disabled' });
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'missing_credentials' });
  // Primitive dev auth: accept anything, assign role based on simple heuristic
  const role = username.startsWith('admin') ? 'admin' : username.startsWith('mgr') ? 'manager' : 'client';
  req.session.user = { username, role };
  return res.json({ ok: true, role });
});

// Root behavior: unauthenticated -> login, authenticated -> role landing
app.get('/', (req, res) => {
  if (req.session?.user?.role) {
    const role = req.session.user.role;
    const target = `${basePath}${rolePath(role)}` || rolePath(role);
    return res.redirect(302, target);
  }
  return res.redirect(302, `${basePath}/login`); // direct to actual React route
});

// Handle any form of login path, normalize duplicates, and redirect appropriately
app.get(['/login', '/app/login', '/app/app/login'], (req, res, next) => {
  const portal = process.env.PORTAL_HOST || 'disabled';
  const host = req.headers.host || 'sparqplug.getsparqd.com';
  const proto = 'https';
  const forceLocal = process.env.FORCE_LOCAL_LOGIN === 'true';
  const disableSSO = forceLocal || process.env.DISABLE_SSO === 'true' || portal === 'disabled' || portal === host;
  const localLoginRoute = process.env.LOCAL_LOGIN_ROUTE || 'devLogin';
  const bp = basePath || '';

  if (req.session && req.session.user) {
    const role = req.session.user.role || 'client';
    const target = `${basePath}${rolePath(role)}` || rolePath(role);
    return res.redirect(302, target);
  }
  if (disableSSO) {
    // Serve static login page directly (eliminate dependency on upstream) and normalize to basePath + /login.html
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Login-Mode', 'static-local');
    const staticPath = `${bp}/login.html`;
    // If current request isn't already the fully-qualified basePath variant, redirect there (avoid root-only /login.html ambiguity)
    if (req.path !== staticPath) {
      return res.redirect(302, staticPath);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(STATIC_LOGIN_HTML(process.env.LOGIN_PAGE_TITLE || 'Login'));
  }
  const returnTo = encodeURIComponent(`${proto}://${host}${basePath || ''}` || `${proto}://${host}/`);
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.redirect(302, `https://${portal}/login?sso=1&returnTo=${returnTo}`);
});

// Minimal debug endpoint to verify session across subdomains
app.get('/whoami', (req, res) => {
  const user = req.session?.user;
  res.json({ authenticated: !!user, role: user?.role || null, username: user?.username || null });
});

// Proxy everything else to the SparqPlug app
app.use(
  '/',
  createProxyMiddleware({
  target: upstream,
    changeOrigin: true,
    xfwd: true,
    ws: true,
    logLevel: 'warn',
    // Surface lower-level connection errors (ECONNREFUSED, ETIMEDOUT, etc.) instead of a silent hang
    onError(err, req, res) {
      const code = err && (err.code || err.name) || 'UNKNOWN';
      console.error('[gateway] proxy error', { code, message: err.message, target: upstream, path: req.url });
      if (!res.headersSent) {
        res.status(502).json({ error: 'upstream_unreachable', code, message: err.message, target: upstream });
      } else {
        try { res.end(); } catch (_) { /* noop */ }
      }
    },
    // Avoid double-prefixing when incoming path already has basePath
    pathRewrite: (path) => {
  const bp = basePath || '';
      // Normalize duplicate base paths just in case
      if (bp && path.startsWith(bp + bp)) {
        let fixed = path; while (fixed.startsWith(bp + bp)) fixed = fixed.slice(bp.length); path = fixed;
      }
      // Static assets: always serve from upstream /_next, regardless of incoming prefix
      if (path.startsWith('/_next')) return path; // already correct
      if (bp && path.startsWith(`${bp}/_next`)) return path; // do not strip basePath for Next static // strip basePath
      // Common static roots
      if (path.startsWith('/favicon') || path.startsWith('/assets')) return path;
      if (bp && path.startsWith(`${bp}/favicon`)) return path; // do not strip basePath for favicon
      if (bp && path.startsWith(`${bp}/assets`)) return path; // do not strip basePath for assets
      // For app routes, ensure basePath is present exactly once
      if (!bp) return path;
      return path.startsWith(bp) ? path : `${bp}${path}`;
    },
    onProxyReq: (proxyReq, req) => {
      try {
        if (req.session && req.session.user) {
          const data = Buffer.from(JSON.stringify({
            username: req.session.user.username,
            role: req.session.user.role,
          })).toString('base64');
          proxyReq.setHeader('x-portal-user', data);
          proxyReq.setHeader('x-auth-from', 'gateway');
        }
      } catch (_) { /* ignore */ }
    },
    onProxyRes: (proxyRes, req, res) => {
      try {
        const sc = proxyRes.statusCode;
        if (sc && [301,302,307,308].includes(sc)) {
          const loc = proxyRes.headers['location'];
          if (loc && /^https:\/\/disabled\//i.test(loc)) {
            const localLoginRoute = process.env.LOCAL_LOGIN_ROUTE || 'login';
            const rewrite = `${basePath}/${localLoginRoute}`.replace(/\\+/g,'/');
            proxyRes.headers['location'] = rewrite;
            res.setHeader('X-Login-Mode','rewrite-upstream-disabled');
            res.setHeader('Cache-Control','no-store');
            console.warn('[gateway] Rewrote upstream disabled redirect ->', rewrite);
          }
        }
      } catch (e) {
        console.warn('[gateway] onProxyRes modify failed:', e.message);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      try {
        if (proxyRes.headers) {
          proxyRes.headers['x-gateway'] = 'sparqplug';
        }
        // Ensure app can be embedded inside the portal iframe
        if (proxyRes.headers) {
          // Remove legacy frame header
          delete proxyRes.headers['x-frame-options'];
          // Remove frame-ancestors from CSP if present
          const csp = proxyRes.headers['content-security-policy'];
          if (typeof csp === 'string' && csp.includes('frame-ancestors')) {
            const cleaned = csp
              .split(';')
              .map(s => s.trim())
              .filter(d => !/^frame-ancestors\b/i.test(d))
              .join('; ');
            if (cleaned) proxyRes.headers['content-security-policy'] = cleaned;
            else delete proxyRes.headers['content-security-policy'];
          }

          // Cache header hardening:
          // 1. Never allow long-term caching of HTML documents (avoid stale chunk hash issues)
          // 2. Ensure immutable caching for hashed static assets under /_next/static
          const ct = proxyRes.headers['content-type'] || '';
            // HTML: force revalidation (avoid s-maxage=31536000 on login page, etc.)
          if (/text\/html/i.test(ct)) {
            proxyRes.headers['cache-control'] = 'no-cache, no-store, must-revalidate';
            proxyRes.headers['pragma'] = 'no-cache';
            proxyRes.headers['expires'] = '0';
          }
          // Static assets: if path indicates chunk/static and no explicit immutable cache yet, set it
          const pathLower = (req.path || '').toLowerCase();
          if (pathLower.includes('/_next/static/')) {
            const existing = proxyRes.headers['cache-control'] || '';
            if (!/immutable/.test(existing)) {
              // One year immutable for hashed assets
              proxyRes.headers['cache-control'] = 'public, max-age=31536000, immutable';
            }
          }
        }
        const bp = basePath || '';
        if (!bp) return;
        const loc = proxyRes.headers && proxyRes.headers['location'];
        if (loc && typeof loc === 'string') {
          // Normalize any duplicated basePath in Location headers
          let fixed = loc;
          const dup = bp + bp;
          // Handle absolute and relative URLs
          if (fixed.includes(dup)) {
            while (fixed.includes(dup)) fixed = fixed.replace(dup, bp);
            proxyRes.headers['location'] = fixed;
          }
          // If upstream tries to send authenticated users to /app/login, rewrite to role landing
          const isLoginPath = (p) => {
            try {
              // consider both absolute and relative URLs
              const u = new URL(p, `https://${req.headers.host || 'sparqplug.getsparqd.com'}`);
              return u.pathname === `${bp}/login` || u.pathname === `/login`;
            } catch { return p === `${bp}/login` || p === '/login'; }
          };
          if (isLoginPath(fixed) && req.session && req.session.user) {
            const role = req.session.user.role || 'client';
            const target = `${bp}${rolePath(role)}`;
            proxyRes.headers['location'] = target;
          }
        }
      } catch (_) { /* ignore */ }
    },
  })
);

// Gateway should NOT share the same port as the upstream Next.js app.
// Use PORT (gateway) + APP_URL (pointing to Next) to decouple.
const PORT = process.env.PORT || 4000;
if (upstream.replace(/\/$/, '') === `http://localhost:${PORT}`) {
  console.warn('[gateway] WARNING: Gateway PORT matches upstream APP_URL port. This will cause a loop or EADDRINUSE. Adjust PORT or APP_URL.');
}
// Startup capability summary (helps when optional deps are missing)
setImmediate(() => {
  console.log('[gateway] startup capabilities', {
    sessionEnabled: !!session,
    redisConfigured: !!redisClient,
    redisConnected: !!redisClient && storeReady,
    helmetEnabled: !!helmet,
    basePath,
    upstream,
    port: PORT,
  });
});

app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}, proxying to ${upstream}`);
});

app.get('/_diag/upstream', async (req, res) => {
  try {
    const r = await fetch(`http://localhost:3000/app/api/healthz`);
    res.json({ ok: r.ok, status: r.status });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

