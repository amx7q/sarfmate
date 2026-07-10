import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static export: every page (including /root/[root] via
  // generateStaticParams) is prerendered to plain HTML so Cloudflare can
  // serve the site as static assets with no Worker CPU per request.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
};

export default nextConfig;
