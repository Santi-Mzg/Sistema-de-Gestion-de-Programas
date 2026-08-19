import type { NextConfig } from "next";
import packageJson from "./package.json"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*', 
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
}
export default nextConfig;
