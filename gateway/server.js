// Session + Redis (version-safe) — requires: const app = express() already defined above
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const session = require('express-session');
const connectRedis = require('connect-redis');
const { createClient } = require('redis');
const helmet = require('helmet');

const basePath = process.env.APP_BASE_PATH || '/app';
const upstream = process.env.APP_URL || 'http://localhost:3000';

const redisClient = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;
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
if (connectRedis && connectRedis.RedisStore) {
  // v7: named export
  RedisStore = connectRedis.RedisStore;
} else if (typeof connectRedis === 'function' && connectRedis.length >= 1) {
  // v6: factory returns Store class
  RedisStore = connectRedis(session);
} else if (connectRedis && connectRedis.default) {
  // v7: default export is Store class
  RedisStore = connectRedis.default;
} else {
  throw new Error('Unsupported connect-redis export shape');
}

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));
const SESSION_SECRETS = (process.env.SESSION_SECRETS || process.env.SESSION_SECRET || 'changeme')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
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
  store: redisClient ? new RedisStore({ client: redisClient }) : undefined,
}));

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
  if (req.path === '/healthz') return next();
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

  const loginLike = req.path === '/login' || req.path === `${bp}/login` || req.path.startsWith(`${bp}${bp}/login`);
  if (loginLike) return next();

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

// Redirect root to role landing (prefer basePath-prefixed URL)
app.get('/', (req, res) => {
  const role = (req.session?.user?.role) || 'client';
  const target = `${basePath}${rolePath(role)}` || rolePath(role);
  return res.redirect(302, target);
});

// Handle any form of login path, normalize duplicates, and redirect appropriately
app.get(['/login', '/app/login', '/app/app/login'], (req, res) => {
  // Deprecated: legacy portal host removed. Use PORTAL_HOST if explicitly set; otherwise bypass external portal.
  const portal = process.env.PORTAL_HOST || 'disabled';
  const host = req.headers.host || 'sparqplug.getsparqd.com';
  const proto = 'https';

  if (req.session && req.session.user) {
    const role = req.session.user.role || 'client';
    const target = `${basePath}${rolePath(role)}` || rolePath(role);
    return res.redirect(302, target);
  }
  // Prefer returning user to app basePath (not /login) to avoid loops
  const returnTo = encodeURIComponent(`${proto}://${host}${basePath || ''}` || `${proto}://${host}/`);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gateway listening on ${PORT}, proxying to ${upstream}`);
});
