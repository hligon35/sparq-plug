// Unified Next.js configuration (JS version) with dynamic basePath logic previously in next.config.ts
// Dev: serve at root unless APP_BASE_PATH explicitly set (allows quick local testing without /app prefix)
// Prod: default to /app unless overridden by APP_BASE_PATH.
// We serve the Next.js app at root internally and let the gateway (/app prefix) rewrite paths.
// This avoids Next.js needing a compiled basePath and eliminates mismatches causing 404/500 on assets.
const basePath = '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath, // always '' (gateway adds external /app prefix)
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      // Global security headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; frame-ancestors 'self'; frame-src 'self' https:; connect-src 'self' https:" },
        ],
      },
      // Force HTML to be non-cacheable to avoid stale chunk references when served directly (no gateway)
      {
        source: '/:path*',
        has: [
          { type: 'header', key: 'Accept', value: '.*text/html.*' },
        ],
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Immutable caching for static Next assets if not already set (served without gateway)
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  // React strict mode intentionally disabled in prod build simplification. Enable locally if desired.
};

module.exports = nextConfig;
