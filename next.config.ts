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
  // Development optimizations
  ...(isDev && {
    reactStrictMode: true,
    swcMinify: true,
  }),
};

export default nextConfig;
