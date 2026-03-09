/**
 * Quick Auth Flow Test
 * Tests the complete authentication flow
 */

import { createClient } from '@supabase/supabase-js'

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n')
  console.log('=' .repeat(80) + '\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Login with valid credentials
  console.log('Test 1: Login with valid credentials')
  console.log('-'.repeat(80))
  
  const testEmail = 'mukhsin9@gmail.com'
  const testPassword = 'admin123'
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authError) {
    console.log('❌ Login failed:', authError.message)
    return false
  }

  console.log('✅ Login successful')
  console.log(`   User ID: ${authData.user?.id}`)
  console.log(`   Email: ${authData.user?.email}`)
  console.log()

  // Test 2: Fetch user data from database
  console.log('Test 2: Fetch user data from database')
  console.log('-'.repeat(80))

  const { data: userData, error: userError } = await supabase
    .from('m_employees')
    .select('id, email, role, unit_id, is_active, full_name')
    .eq('email', authData.user?.email)
    .single()

  if (userError) {
    console.log('❌ User fetch failed:', userError.message)
    await supabase.auth.signOut()
    return false
  }

  console.log('✅ User data fetched')
  console.log(`   Name: ${userData.full_name}`)
  console.log(`   Role: ${userData.role}`)
  console.log(`   Active: ${userData.is_active}`)
  console.log()

  // Test 3: Check active status
  console.log('Test 3: Check active status')
  console.log('-'.repeat(80))

  if (!userData.is_active) {
    console.log('❌ User is not active')
    await supabase.auth.signOut()
    return false
  }

  console.log('✅ User is active')
  console.log()

  // Test 4: Get session
  console.log('Test 4: Get session')
  console.log('-'.repeat(80))

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.log('❌ Session not found')
    return false
  }

  console.log('✅ Session exists')
  console.log(`   Expires at: ${new Date(session.expires_at! * 1000).toLocaleString()}`)
  console.log()

  // Test 5: Logout
  console.log('Test 5: Logout')
  console.log('-'.repeat(80))

  const { error: logoutError } = await supabase.auth.signOut()

  if (logoutError) {
    console.log('❌ Logout failed:', logoutError.message)
    return false
  }

  console.log('✅ Logout successful')
  console.log()

  // Test 6: Verify session cleared
  console.log('Test 6: Verify session cleared')
  console.log('-'.repeat(80))

  const { data: { session: afterLogout } } = await supabase.auth.getSession()

  if (afterLogout) {
    console.log('❌ Session still exists after logout')
    return false
  }

  console.log('✅ Session cleared')
  console.log()

  // Test 7: Login with invalid credentials
  console.log('Test 7: Login with invalid credentials')
  console.log('-'.repeat(80))

  const { error: invalidError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'wrongpassword',
  })

  if (!invalidError) {
    console.log('❌ Login should have failed with invalid credentials')
    await supabase.auth.signOut()
    return false
  }

  console.log('✅ Invalid credentials rejected')
  console.log(`   Error: ${invalidError.message}`)
  console.log()

  return true
}

async function main() {
  console.log('🚀 Starting Auth Flow Test\n')

  const success = await testAuthFlow()

  console.log('=' .repeat(80))
  if (success) {
    console.log('🎉 All auth flow tests passed!')
    console.log('✅ Authentication system is working correctly\n')
    process.exit(0)
  } else {
    console.log('❌ Some auth flow tests failed')
    console.log('Please review the errors above\n')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('❌ Test failed with error:', error)
  process.exit(1)
})
