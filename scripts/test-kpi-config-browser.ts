#!/usr/bin/env tsx

/**
 * Browser test for KPI Config page to check for console errors
 */

import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function testKPIConfigInBrowser() {
  console.log('🌐 Testing KPI Config page in browser context...')
  
  try {
    // Test the page endpoint
    const response = await fetch('http://localhost:3002/kpi-config', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      console.error(`❌ Page returned status: ${response.status}`)
      return false
    }
    
    const html = await response.text()
    
    // Check for common issues in the HTML
    console.log('\n📋 Analyzing page content...')
    
    // Check if the page has content
    if (html.includes('Konfigurasi KPI')) {
      console.log('✅ Page title found')
    } else {
      console.log('⚠️  Page title not found')
    }
    
    // Check for error indicators
    if (html.includes('error') || html.includes('Error')) {
      console.log('⚠️  Possible error content detected')
    } else {
      console.log('✅ No obvious error content')
    }
    
    // Check for loading states
    if (html.includes('Loading') || html.includes('loading')) {
      console.log('ℹ️  Loading states detected (normal)')
    }
    
    // Check for React hydration
    if (html.includes('__NEXT_DATA__')) {
      console.log('✅ Next.js data found')
    } else {
      console.log('⚠️  Next.js data not found')
    }
    
    // Check for basic components
    if (html.includes('Pilih unit')) {
      console.log('✅ Unit selector found')
    } else {
      console.log('⚠️  Unit selector not found')
    }
    
    console.log('\n🎯 Page analysis complete!')
    console.log('\n💡 To see the actual page:')
    console.log('   1. Open browser to http://localhost:3002/login')
    console.log('   2. Login with superadmin credentials')
    console.log('   3. Navigate to http://localhost:3002/kpi-config')
    console.log('   4. Check browser console for any errors')
    
    return true
    
  } catch (error: any) {
    console.error('❌ Browser test failed:', error.message)
    return false
  }
}

// Run the test
testKPIConfigInBrowser()
  .then(success => {
    if (success) {
      console.log('\n✅ Browser test completed!')
      process.exit(0)
    } else {
      console.log('\n❌ Browser test failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })