/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Legacy path -> canonical
      {
        source: "/monter/:id/direction",
        destination: "/monastery/:id/directions",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Also allow direct fetches to resolve without extra hop internally
      {
        source: "/monter/:id/direction",
        destination: "/monastery/:id/directions",
      },
    ]
  },
}

export default nextConfig