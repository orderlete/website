import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bbassets.com',
      },
       {
        protocol: 'https',
        hostname: 'images.bigbasket.com',
      },
      {
        protocol: 'https',
        hostname: 'onemg.gumlet.io',
      },
       {
        protocol: 'https',
        hostname: 'www.netmeds.com',
      },
    ],
  },
};

export default nextConfig;
