/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff2)$/,
      type: 'asset/resource',
    });
    return config;
  },
  images: {
    domains: ['storage.googleapis.com'],
  },
};

module.exports = nextConfig; 