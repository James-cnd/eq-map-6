/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removing all custom configuration
  // This is a minimal configuration that should work for most deployments
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
