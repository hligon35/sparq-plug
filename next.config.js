// Unified Next.js configuration (JS version) with dynamic basePath logic previously in next.config.ts
// Dev: serve at root unless APP_BASE_PATH explicitly set (allows quick local testing without /app prefix)
// Prod: default to /app unless overridden by APP_BASE_PATH.
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev
  ? (process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : '')
  : (process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : '/app');

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
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
  ...(isDev && { reactStrictMode: true, swcMinify: true }),
};

module.exports = nextConfig;
