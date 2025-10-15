import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */  
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

export default nextConfig;
