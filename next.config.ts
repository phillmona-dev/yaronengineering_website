import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — generates a plain out/ folder deployable to any web host (cPanel, S3, etc.)
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // The dev overlay bubble sits bottom-left, exactly where the WhatsApp button lives.
  devIndicators: false,
  images: {
    // Static export has no Next.js image-optimization server, so images are served as-is.
    unoptimized: true,
  },
  // NOTE: headers() is not supported in static export mode — security headers are set via
  // Nginx / .htaccess on the host instead.
};

export default nextConfig;
