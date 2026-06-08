import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1', '192.168.1.57', 'subscribe.innotel.us', 'localhost'],
  images: {
    remotePatterns: [
      {
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
