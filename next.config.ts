import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{source: '/dashboard', destination: '/dashboard-preview.html'}, {source: '/dashboard/admin', destination: '/dashboard-preview.html'}];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{type: 'host', value: 'www.shayeisenberg.com'}],
        destination: 'https://shayeisenberg.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
