import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(js|ts|tsx)$/,
      include: /functions/,
      use: require.resolve("null-loader"),
    });
    return config;
  },
};

export default nextConfig;
