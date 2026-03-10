async function testSettingsPage() {
  console.log('🧪 Testing Settings Page Direct Access...\n')

  try {
    console.log('Accessing http://localhost:3002/settings...')
    
    const response = await fetch('http://localhost:3002/settings', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    console.log('Status:', response.status, response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const text = await response.text()
      console.log('\n❌ Error Response:')
      console.log(text.substring(0, 1000))
    } else {
      console.log('\n✅ Page loaded successfully')
      const html = await response.text()
      console.log('HTML length:', html.length)
      
      // Check if it contains expected content
      if (html.includes('Pengaturan Sistem')) {
        console.log('✅ Contains expected content')
      } else if (html.includes('Login') || html.includes('login')) {
        console.log('⚠️  Redirected to login page')
      } else {
        console.log('⚠️  Missing expected content')
        console.log('\nFirst 500 chars:')
        console.log(html.substring(0, 500))
      }
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

testSettingsPage()
