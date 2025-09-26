import type { NextConfig } from "next";

// Respect empty string as a valid basePath; default to "/app" only if undefined
// For development, we'll use empty string to serve at root
const isDev = process.env.NODE_ENV === 'development';
const basePath = isDev 
  ? (process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : "")
  : (process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : "/app");

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          // CSP should be tuned for your CDN and third-party embeds; keeping minimal safe example
          { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; frame-ancestors 'self'; frame-src 'self' https:; connect-src 'self' https:;" },
        ],
      },
    ];
  },
  // Development optimizations
  ...(isDev && {
    reactStrictMode: true,
    swcMinify: true,
  }),
};

export default nextConfig;
