import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      // Product renamed (typo fix): keep old shared links working.
      {
        source: "/products/mercadez-benz-2025-driver-t-shirt",
        destination: "/products/mercedes-benz-2025-driver-t-shirt",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
