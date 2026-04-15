import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable turbopack for next-pwa compatibility
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
