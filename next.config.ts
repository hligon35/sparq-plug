import type { NextConfig } from "next";

// Use empty string by default; allow override via APP_BASE_PATH
const basePath = process.env.APP_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 },
  async headers() {
    return [
      { source: "/_next/static/:path*", headers: [ { key: "Cache-Control", value: "public,max-age=31536000,immutable" } ] },
      { source: "/(.*)", headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" }
        ]
      }
    ];
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
