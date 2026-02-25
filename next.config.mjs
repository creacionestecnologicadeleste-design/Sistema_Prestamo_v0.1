/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/dashboard",
        destination: "/dashboard/crm",
        permanent: true,
      },
      {
        source: "/dashboard/default",
        destination: "/dashboard/crm",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
