import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "storage.googleapis.com" },
      { hostname: "replicate.delivery" },
      { hostname: "source.unsplash.com" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
