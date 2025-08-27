import type { NextConfig } from "next";

const basePath = process.env.APP_BASE_PATH || "/app";
const assetPrefix = basePath || "";

const nextConfig: NextConfig = {
  basePath,
  assetPrefix,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
