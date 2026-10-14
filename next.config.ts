import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only; the CRUD/API backend must be hosted separately.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
