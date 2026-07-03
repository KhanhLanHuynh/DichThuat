import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@cursor/sdk"],
  // Allow accessing the dev server from LAN devices (e.g. http://192.168.1.179:3000).
  // Next.js 16 blocks cross-origin requests to internal dev resources by default,
  // which breaks interactivity when the page is opened via IP instead of localhost.
  allowedDevOrigins: ["192.168.1.179", "192.168.1.*"],
};

export default nextConfig;
