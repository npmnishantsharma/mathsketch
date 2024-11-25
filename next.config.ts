import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
images:{
  domains:["lh3.googleusercontent.com"]
}
};

export default nextConfig;
