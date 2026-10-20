import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A small server-rendered site: resolve form readiness from runtime bindings.
  cacheComponents: false,
  partialPrefetching: false,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
};
export default nextConfig;
