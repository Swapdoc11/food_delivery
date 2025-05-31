/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't prevent deployment if there are ESLint warnings
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
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
};

export default nextConfig;
