/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/crm",
        permanent: false,
      },
    ];
  },
  experimental: {
    allowedDevOrigins: ["http://172.16.0.25:3000", "http://localhost:3000"],
  },
};

export default nextConfig;
