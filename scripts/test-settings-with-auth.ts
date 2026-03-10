import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSettingsWithAuth() {
  console.log('🧪 Testing Settings Page with Authentication...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // 1. Login
    console.log('1️⃣ Logging in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Logged in successfully')

    // 2. Access settings page with auth cookies
    console.log('\n2️⃣ Accessing settings page...')
    
    const cookies = [
      `sb-omlbijupllrglmebbqnn-auth-token=${JSON.stringify({
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      })}`
    ]

    const response = await fetch('http://localhost:3002/settings', {
      headers: {
        'Cookie': cookies.join('; '),
        'User-Agent': 'Mozilla/5.0'
      }
    })

    console.log('Status:', response.status, response.statusText)

    if (!response.ok) {
      const text = await response.text()
      console.log('\n❌ Error Response (first 1000 chars):')
      console.log(text.substring(0, 1000))
    } else {
      const html = await response.text()
      
      if (html.includes('Pengaturan Sistem')) {
        console.log('✅ Settings page loaded successfully')
      } else if (html.includes('Login')) {
        console.log('⚠️  Still redirected to login (auth not working)')
      } else {
        console.log('⚠️  Unexpected content')
        console.log('First 500 chars:', html.substring(0, 500))
      }
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testSettingsWithAuth()
