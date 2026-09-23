import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/sigma360",
  assetPrefix: "/sigma360/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
