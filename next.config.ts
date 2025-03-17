import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "storage.googleapis.com" }],
  },
};

export default nextConfig;
