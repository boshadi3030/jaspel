/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Vercel
  output: 'standalone',
  
  // Explicitly use App Router (Next.js 15)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
    // Optimize page loading
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  
  // Image optimization
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable React strict mode for better performance
  reactStrictMode: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Compress responses
  compress: true,
  
  // Ensure we're using App Router
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Webpack config untuk stabilitas
  webpack: (config) => {
    return config
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
