import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Suprimir warnings de extensiones del navegador
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
