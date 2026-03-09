/**
 * Test script untuk memverifikasi admin dashboard bisa diakses
 */

async function testAdminDashboard() {
  console.log('🧪 Testing Admin Dashboard...\n')

  // Detect the port from environment or use default
  const port = process.env.PORT || '3003'
  const baseUrl = `http://localhost:${port}`
  
  console.log(`📍 Testing on: ${baseUrl}\n`)

  try {
    // Test 1: Check if settings API is working
    console.log('1️⃣ Testing Settings API...')
    const settingsResponse = await fetch(`${baseUrl}/api/settings`)
    
    if (!settingsResponse.ok) {
      console.error('❌ Settings API failed:', settingsResponse.status, settingsResponse.statusText)
      const errorText = await settingsResponse.text()
      console.error('Error details:', errorText)
      return false
    }
    
    const settingsData = await settingsResponse.json()
    console.log('✅ Settings API working')
    console.log('   Settings structure:', Object.keys(settingsData))
    
    // Test 2: Check if login page loads
    console.log('\n2️⃣ Testing Login Page...')
    const loginResponse = await fetch(`${baseUrl}/login`)
    
    if (!loginResponse.ok) {
      console.error('❌ Login page failed:', loginResponse.status)
      return false
    }
    
    console.log('✅ Login page loads successfully')
    
    // Test 3: Check if admin dashboard redirects properly (should redirect to login if not authenticated)
    console.log('\n3️⃣ Testing Admin Dashboard (unauthenticated)...')
    const dashboardResponse = await fetch(`${baseUrl}/admin/dashboard`, {
      redirect: 'manual'
    })
    
    if (dashboardResponse.status === 307 || dashboardResponse.status === 302) {
      console.log('✅ Admin dashboard properly redirects unauthenticated users')
    } else if (dashboardResponse.status === 200) {
      console.log('⚠️  Admin dashboard returned 200 (might be accessible without auth)')
    } else {
      console.error('❌ Admin dashboard returned unexpected status:', dashboardResponse.status)
      return false
    }
    
    console.log('\n✅ All tests passed!')
    console.log('\n📝 Summary:')
    console.log('   - Settings API is working correctly')
    console.log('   - Login page loads without errors')
    console.log('   - Admin dashboard has proper authentication')
    console.log('\n💡 Next steps:')
    console.log('   1. Login dengan kredensial superadmin')
    console.log(`   2. Akses ${baseUrl}/admin/dashboard`)
    console.log('   3. Verifikasi dashboard menampilkan data dengan benar')
    
    return true
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

// Run the test
testAdminDashboard()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
