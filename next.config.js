/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Skip ESLint during build to avoid chunk conflicts
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Asset optimization
  images: {
    unoptimized: true,
  },
  
  // Enable source maps temporarily for debugging
  productionBrowserSourceMaps: false,
  
  // Simplified output configuration
  output: 'standalone',
  
  // Simplified webpack config to prevent chunk loading errors
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Compress responses
  compress: true,
  
  // Optimize for Vercel deployment
  poweredByHeader: false,
  
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig