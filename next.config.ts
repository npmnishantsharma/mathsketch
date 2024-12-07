import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
        },
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
images:{
  domains:["lh3.googleusercontent.com","res.cloudinary.com"]
},
compiler:{
  removeConsole: process.env.NODE_ENV === 'production',
},
reactStrictMode: true,
poweredByHeader: false,


};

export default nextConfig;
