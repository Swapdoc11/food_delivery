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
    domains: ['localhost', 'food-delivery-lilac-eight.vercel.app', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dijkpvobx/**',
      },
      {
        protocol: 'https',
        hostname: 'food-delivery-khaki-eta.vercel.app',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Other performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
