import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
