/**
 * Test script untuk memverifikasi API settings berfungsi dengan baik
 * 
 * Usage: npx tsx scripts/test-settings-api.ts
 */

async function testSettingsAPI() {
  const baseUrl = 'http://localhost:3003' // Sesuaikan dengan port yang digunakan
  
  console.log('🧪 Testing Settings API...\n')
  
  try {
    // Test GET /api/settings
    console.log('1️⃣ Testing GET /api/settings...')
    const response = await fetch(`${baseUrl}/api/settings`)
    
    if (!response.ok) {
      console.error(`❌ GET request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error details:', errorText)
      return
    }
    
    const data = await response.json()
    console.log('✅ GET request successful!')
    console.log('Settings data:', JSON.stringify(data, null, 2))
    
    // Check if companyInfo exists
    if (data.companyInfo) {
      console.log('\n✅ Company info found:')
      console.log(`   - App Name: ${data.companyInfo.appName}`)
      console.log(`   - Company: ${data.companyInfo.name}`)
      console.log(`   - Address: ${data.companyInfo.address}`)
    } else {
      console.log('\n⚠️  No company info found in settings')
    }
    
    console.log('\n✅ All tests passed!')
    
  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run tests
testSettingsAPI()
