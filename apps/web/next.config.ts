import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/validators"],
  async rewrites() {
    const apiProxyTarget = process.env.AUTH_API_PROXY_TARGET;

    if (!apiProxyTarget) {
      return [];
    }

    const apiOrigin = apiProxyTarget.replace(/\/$/, "");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiOrigin}/api/auth/:path*`,
      },
      {
        source: "/api/v2/:path*",
        destination: `${apiOrigin}/api/v2/:path*`,
      },
    ];
  },
};

export default nextConfig;
