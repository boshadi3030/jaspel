/**
 * Test Settings API
 * Verifies that /api/settings endpoint works correctly
 */

async function testSettingsAPI() {
  console.log('🧪 Testing Settings API...\n')

  try {
    const response = await fetch('http://localhost:3002/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log(`Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error Response:', errorText)
      process.exit(1)
    }

    const data = await response.json()
    console.log('\n✅ Settings API Response:')
    console.log(JSON.stringify(data, null, 2))

    // Verify expected keys
    const expectedKeys = ['company_info', 'footer', 'calculation_params', 'session_timeout', 'ter_rates', 'tax_rates']
    const missingKeys = expectedKeys.filter(key => !(key in data))
    
    if (missingKeys.length > 0) {
      console.warn('\n⚠️  Missing keys:', missingKeys)
    } else {
      console.log('\n✅ All expected keys present')
    }

    console.log('\n✅ Settings API test passed!')
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testSettingsAPI()
