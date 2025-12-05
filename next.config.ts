import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  reactCompiler: true
  // allowedDevOrigins: ["192.168.3.65", "192.168.3.66"],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
