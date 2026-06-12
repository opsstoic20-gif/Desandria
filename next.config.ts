import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never expose server-only env to the client. Secrets are read via process.env
  // in server code only (see desandria.md §12).
  poweredByHeader: false,
};

export default nextConfig;
