import type { NextConfig } from "next";

// Security headers for every response. The page Content-Security-Policy with
// per-request script nonces is set in src/proxy.ts.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/auth", destination: "/login", permanent: true },
      { source: "/auth/sign-in", destination: "/login", permanent: true },
      { source: "/auth/sign-up", destination: "/login", permanent: true },
      { source: "/auth/sign-out", destination: "/logout", permanent: true },
      { source: "/sign-in", destination: "/login", permanent: true },
      { source: "/sign-up", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;
