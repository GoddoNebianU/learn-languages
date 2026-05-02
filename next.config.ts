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
  reactCompiler: true,
  allowedDevOrigins: ['127.0.0.1'],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
