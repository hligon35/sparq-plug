import type { NextConfig } from "next";

// Respect empty string as a valid basePath; default to "/app" only if undefined
const basePath =
  process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : "/app";

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
