/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Don't run ESLint during production builds
    ignoreDuringBuilds: true
  },
  typescript: {
    // Don't run type checking during production builds
    ignoreBuildErrors: true
  },
  images: {
    domains: ['localhost', 'food-delivery-lilac-eight.vercel.app'],
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
  // Other performance optimizations
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
};

export default nextConfig;
