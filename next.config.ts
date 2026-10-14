import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a project Pages site, not a user/organization root site.
  basePath: "/Student.db",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
