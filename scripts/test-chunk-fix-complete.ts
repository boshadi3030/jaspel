#!/usr/bin/env tsx

/**
 * Test script to verify chunk loading fix
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'

console.log('🧪 Testing chunk loading fix...')

// Test 1: Check if build artifacts exist
console.log('1. Checking build artifacts...')
const buildFiles = [
  '.next/BUILD_ID',
  '.next/static',
  '.next/server'
]

buildFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file} exists`)
  } else {
    console.log(`   ❌ ${file} missing`)
  }
})

// Test 2: Try to build the application
console.log('2. Testing build process...')
try {
  execSync('npm run build', { stdio: 'pipe' })
  console.log('   ✅ Build successful')
} catch (error) {
  console.log('   ❌ Build failed')
  console.error(error)
}

// Test 3: Check Next.js configuration
console.log('3. Checking Next.js configuration...')
if (existsSync('next.config.js')) {
  console.log('   ✅ next.config.js exists')
  
  try {
    const config = require('../next.config.js')
    if (config.webpack) {
      console.log('   ✅ Webpack optimization configured')
    }
    if (config.headers) {
      console.log('   ✅ Cache headers configured')
    }
  } catch (error) {
    console.log('   ❌ Configuration error:', error)
  }
} else {
  console.log('   ❌ next.config.js missing')
}

console.log('🎯 Test completed. Check results above.')
console.log('📝 If all tests pass, the chunk loading issue should be resolved.')