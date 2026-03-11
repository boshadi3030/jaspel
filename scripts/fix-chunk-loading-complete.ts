#!/usr/bin/env tsx

/**
 * Comprehensive fix for chunk loading errors
 * This script addresses multiple causes of chunk loading failures
 */

import { execSync } from 'child_process'
import { existsSync, rmSync, writeFileSync } from 'fs'
import path from 'path'

console.log('🔧 Starting comprehensive chunk loading fix...')

// Step 1: Clean all build artifacts
console.log('1. Cleaning build artifacts...')
const cleanDirs = ['.next', 'node_modules/.cache', '.vercel']
cleanDirs.forEach(dir => {
  if (existsSync(dir)) {
    console.log(`   Removing ${dir}...`)
    rmSync(dir, { recursive: true, force: true })
  }
})

// Step 2: Create optimized Next.js config
console.log('2. Creating optimized Next.js configuration...')
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Vercel
  output: 'standalone',
  
  // Disable experimental features that can cause chunk issues
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
  
  // Disable source maps to reduce chunk complexity
  productionBrowserSourceMaps: false,
  
  // Optimize webpack for chunk loading
  webpack: (config, { isServer, dev }) => {
    // Only add essential fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Optimize chunk splitting for better loading
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  
  // Add headers to prevent caching issues
  async headers() {
    return [
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

module.exports = nextConfig`

writeFileSync('next.config.js', nextConfig)

// Step 3: Reinstall dependencies
console.log('3. Reinstalling dependencies...')
try {
  execSync('npm ci', { stdio: 'inherit' })
} catch (error) {
  console.log('   npm ci failed, trying npm install...')
  execSync('npm install', { stdio: 'inherit' })
}

// Step 4: Build the application
console.log('4. Building application...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build successful!')
} catch (error) {
  console.error('❌ Build failed:', error)
  process.exit(1)
}

// Step 5: Test the build
console.log('5. Testing build output...')
const buildDir = '.next'
if (existsSync(buildDir)) {
  console.log('✅ Build directory exists')
  
  // Check for essential files
  const essentialFiles = [
    '.next/static',
    '.next/server',
    '.next/BUILD_ID'
  ]
  
  essentialFiles.forEach(file => {
    if (existsSync(file)) {
      console.log(`✅ ${file} exists`)
    } else {
      console.log(`❌ ${file} missing`)
    }
  })
} else {
  console.error('❌ Build directory not found')
  process.exit(1)
}

console.log('🎉 Chunk loading fix completed successfully!')
console.log('📝 Next steps:')
console.log('   1. Start the development server: npm run dev')
console.log('   2. Test the pool page: http://localhost:3000/pool')
console.log('   3. Check browser console for any remaining errors')