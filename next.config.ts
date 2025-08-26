import type { NextConfig } from "next";

const basePath = process.env.APP_BASE_PATH || "/app";

const nextConfig: NextConfig = {
  basePath,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
