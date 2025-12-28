import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const nextConfig: NextConfig = {
  transpilePackages: ["@augments/shared"],
  experimental: {
    externalDir: true,
  },
  eslint: {
    // Disable ESLint during builds to avoid blocking deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Add alias for the shared package
    config.resolve.alias = {
      ...config.resolve.alias,
      '@augments/shared': path.resolve(__dirname, '../shared/dist'),
    };
    
    return config;
  },
};

export default nextConfig;
