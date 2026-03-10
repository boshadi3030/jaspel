import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function testUsersPage() {
  console.log('🧪 Testing /users page...\n')
  
  const baseUrl = 'http://localhost:3002'
  
  try {
    // Test 1: Check if page exists
    console.log('1️⃣ Mengakses /users...')
    const response = await fetch(`${baseUrl}/users`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'manual'
    })
    
    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (response.status === 500) {
      const text = await response.text()
      console.log('\n❌ Error 500 ditemukan!')
      console.log('Response body:', text.substring(0, 500))
    } else if (response.status === 307 || response.status === 302) {
      console.log(`✅ Redirect ke: ${response.headers.get('location')}`)
    } else if (response.status === 200) {
      console.log('✅ Halaman berhasil dimuat')
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

testUsersPage()
