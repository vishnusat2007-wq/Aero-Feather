import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local preview hosts so client JS / HMR hydrate in Cursor & desktop browsers
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wudvornitqucrahtlzgo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
