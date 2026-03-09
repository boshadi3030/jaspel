async function testRootPage() {
  console.log('Testing root page...')
  
  try {
    const response = await fetch('http://localhost:3002/', {
      redirect: 'manual'
    })
    
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.status === 307 || response.status === 308) {
      console.log('✓ Redirect working correctly')
      console.log('Redirecting to:', response.headers.get('location'))
    } else if (response.status === 500) {
      console.log('✗ Error 500 - Internal Server Error')
      const text = await response.text()
      console.log('Response:', text.substring(0, 500))
    } else {
      console.log('Response status:', response.status)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

testRootPage()
