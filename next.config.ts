import type { NextConfig } from "next";

// Make the app visible at "/" by default in dev; allow overriding via APP_BASE_PATH
const basePath = process.env.APP_BASE_PATH !== undefined ? process.env.APP_BASE_PATH : "";

const nextConfig: NextConfig = {
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
