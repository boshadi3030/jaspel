async function testUsersEndpoint() {
  console.log('🧪 Testing users endpoint...\n')
  
  const baseUrl = 'http://localhost:3002'
  
  try {
    console.log('1️⃣ Testing GET /users (should redirect to login or return page)...')
    const response = await fetch(`${baseUrl}/users`, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.status === 500) {
      console.log('   ❌ Error 500 masih ada!')
      const text = await response.text()
      console.log('   Error:', text.substring(0, 200))
    } else if (response.status === 307 || response.status === 302) {
      console.log(`   ✅ Redirect ke: ${response.headers.get('location')}`)
    } else if (response.status === 200) {
      console.log('   ✅ Halaman berhasil dimuat')
    }
    
    console.log('\n2️⃣ Testing GET /api/users/list...')
    const apiResponse = await fetch(`${baseUrl}/api/users/list`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })
    
    console.log(`   Status: ${apiResponse.status}`)
    
    if (apiResponse.status === 401) {
      console.log('   ✅ Unauthorized (expected - no auth)')
    } else if (apiResponse.status === 200) {
      console.log('   ✅ API endpoint berfungsi')
    } else {
      console.log(`   ⚠️  Unexpected status: ${apiResponse.status}`)
    }
    
    console.log('\n✅ Test selesai')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

testUsersEndpoint()
