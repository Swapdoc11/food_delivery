/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning instead of error for some rules
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Strict mode can help catch hooks errors during development
  reactStrictMode: true,
  // Improve production performance
  swcMinify: true,
};

export default nextConfig;
