import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "storage.googleapis.com" }],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
