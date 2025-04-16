/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["api.vedur.is"],
    formats: ["image/avif", "image/webp"],
  },
  // Optimize build performance
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  // Optimize loading of large data files
  webpack(config) {
    // Handle large JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: "javascript/auto",
      use: ["json-loader"],
    })

    return config
  },
}

module.exports = nextConfig
