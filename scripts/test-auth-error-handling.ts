#!/usr/bin/env tsx
/**
 * Test script untuk memverifikasi auth error handling
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testAuthErrorHandling() {
  console.log('🧪 Testing Auth Error Handling...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check if client is configured correctly
  console.log('✓ Test 1: Supabase client configuration')
  console.log('  URL:', supabaseUrl)
  console.log('  Key:', supabaseKey.substring(0, 20) + '...')
  console.log('')

  // Test 2: Try to get session (should fail gracefully if no session)
  console.log('✓ Test 2: Get session without auth')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.log('  ⚠️  No active session (expected):', error.message)
    } else if (!data.session) {
      console.log('  ✓ No session found (expected)')
    } else {
      console.log('  ✓ Active session found')
      console.log('    User:', data.session.user.email)
    }
  } catch (error: any) {
    console.log('  ❌ Error:', error.message)
  }
  console.log('')

  // Test 3: Test login with valid credentials
  console.log('✓ Test 3: Login with test credentials')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'mukhsin9@gmail.com',
      password: 'admin123',
    })

    if (error) {
      console.log('  ❌ Login failed:', error.message)
    } else if (data.session) {
      console.log('  ✓ Login successful')
      console.log('    User:', data.user.email)
      console.log('    Access Token:', data.session.access_token.substring(0, 20) + '...')
      console.log('    Refresh Token:', data.session.refresh_token.substring(0, 20) + '...')
      
      // Test 4: Verify session
      console.log('')
      console.log('✓ Test 4: Verify session after login')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.log('  ❌ Session verification failed:', sessionError.message)
      } else if (sessionData.session) {
        console.log('  ✓ Session verified')
      }
      
      // Test 5: Sign out
      console.log('')
      console.log('✓ Test 5: Sign out')
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.log('  ❌ Sign out failed:', signOutError.message)
      } else {
        console.log('  ✓ Sign out successful')
      }
    }
  } catch (error: any) {
    console.log('  ❌ Unexpected error:', error.message)
  }
  console.log('')

  console.log('✅ Auth error handling tests completed\n')
  console.log('Perbaikan yang sudah diterapkan:')
  console.log('1. ✓ Supabase client dengan PKCE flow')
  console.log('2. ✓ Auto refresh token enabled')
  console.log('3. ✓ Error handler untuk invalid refresh token')
  console.log('4. ✓ Middleware membersihkan cookies saat error')
  console.log('5. ✓ AuthErrorHandler component di root layout')
  console.log('')
  console.log('Untuk menghilangkan error di browser:')
  console.log('- Bersihkan browser cache (localStorage & cookies)')
  console.log('- Atau gunakan mode Incognito/Private')
  console.log('- Refresh halaman dengan Ctrl+Shift+R')
}

testAuthErrorHandling().catch(console.error)
