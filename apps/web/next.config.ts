import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/validators"],
  async rewrites() {
    const authProxyTarget = process.env.AUTH_API_PROXY_TARGET;

    if (!authProxyTarget) {
      return [];
    }

    return [
      {
        source: "/api/auth/:path*",
        destination: `${authProxyTarget.replace(/\/$/, "")}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
