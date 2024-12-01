/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  images: {
    domains: ["firebasestorage.googleapis.com", "localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  
  async headers() {
    return [
      {
        source: "/:path*", // Apply this to all routes
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },

  experimental: {
    buildCache: true,
  },
};

module.exports = nextConfig;
