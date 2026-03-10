import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function verifyUsersPageFixed() {
  console.log('✅ Verifikasi perbaikan halaman users\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // Login as superadmin
    console.log('1️⃣ Login sebagai superadmin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mukhsin9@gmail.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Login gagal:', authError.message)
      return
    }
    
    console.log('✅ Login berhasil')
    
    // Test accessing users page
    console.log('\n2️⃣ Mengakses halaman /users...')
    const response = await fetch('http://localhost:3002/users', {
      headers: {
        'Cookie': `sb-access-token=${authData.session?.access_token}; sb-refresh-token=${authData.session?.refresh_token}`,
        'User-Agent': 'Mozilla/5.0'
      }
    })
    
    console.log(`   Status: ${response.status}`)
    
    if (response.status === 200) {
      console.log('✅ Halaman users berhasil dimuat')
    } else if (response.status === 500) {
      console.log('❌ Masih ada error 500')
      const text = await response.text()
      console.log('Error:', text.substring(0, 300))
    } else {
      console.log(`⚠️  Status: ${response.status}`)
    }
    
    console.log('\n✅ Verifikasi selesai')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
}

verifyUsersPageFixed()
