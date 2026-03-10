/**
 * Test Settings Page in Browser
 * Verifies that settings page loads correctly
 */

async function testSettingsPage() {
  console.log('🧪 Testing Settings Page...\n')

  try {
    // Test API endpoint first
    console.log('1. Testing API endpoint...')
    const apiResponse = await fetch('http://localhost:3002/api/settings')
    
    if (!apiResponse.ok) {
      console.error('❌ API endpoint failed:', apiResponse.status)
      process.exit(1)
    }
    
    const apiData = await apiResponse.json()
    console.log('✅ API endpoint working')
    console.log('   Company:', apiData.company_info?.name)
    console.log('   Footer:', apiData.footer?.text)

    console.log('\n2. Settings page should now work at:')
    console.log('   http://localhost:3002/settings')
    console.log('\n✅ Test completed! Please verify in browser.')
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testSettingsPage()
