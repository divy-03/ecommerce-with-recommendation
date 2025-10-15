import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */  
   images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
