import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@bytebot/shared"],
  async rewrites() {
    return [
      {
        source: "/socket.io/:path*",
        destination: `${process.env.BYTEBOT_AGENT_BASE_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
