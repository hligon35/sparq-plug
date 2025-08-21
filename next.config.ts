import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/app",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
