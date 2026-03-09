/**
 * Verify Login Functionality
 * Tests the complete login flow
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function verifyLogin() {
  console.log('🔍 Verifying Login Functionality\n')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
  }

  console.log('✅ Environment variables loaded')
  console.log('   URL:', supabaseUrl)
  console.log('   Key:', supabaseKey.substring(0, 20) + '...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test credentials
  const testEmail = 'mukhsin9@gmail.com'
  const testPassword = 'admin123'

  console.log('1️⃣ Testing authentication...')
  console.log('   Email:', testEmail)

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (authError) {
      console.error('❌ Authentication failed:', authError.message)
      console.error('   Code:', authError.status)
      return
    }

    if (!authData.user) {
      console.error('❌ No user data returned')
      return
    }

    console.log('✅ Authentication successful')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('   Role:', authData.user.user_metadata?.role)

    // Test employee data
    console.log('\n2️⃣ Fetching employee data...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, user_id, unit_id, is_active, full_name')
      .eq('user_id', authData.user.id)
      .single()

    if (employeeError) {
      console.error('❌ Employee fetch failed:', employeeError.message)
      await supabase.auth.signOut()
      return
    }

    if (!employeeData) {
      console.error('❌ No employee data found')
      await supabase.auth.signOut()
      return
    }

    console.log('✅ Employee data found')
    console.log('   Name:', employeeData.full_name)
    console.log('   Active:', employeeData.is_active)
    console.log('   Unit ID:', employeeData.unit_id)

    // Check active status
    console.log('\n3️⃣ Checking user status...')
    if (!employeeData.is_active) {
      console.error('❌ User is not active')
      await supabase.auth.signOut()
      return
    }

    console.log('✅ User is active')

    // Clean up
    await supabase.auth.signOut()

    console.log('\n✅ ALL TESTS PASSED!')
    console.log('\n📋 Login flow is working correctly')
    console.log('   ✓ Authentication works')
    console.log('   ✓ Employee data accessible')
    console.log('   ✓ User is active')
    console.log('\n💡 If button still not clickable in browser:')
    console.log('   1. Open browser DevTools (F12)')
    console.log('   2. Check Console tab for errors')
    console.log('   3. Check Network tab for failed requests')
    console.log('   4. Try hard refresh (Ctrl+Shift+R)')
    console.log('   5. Clear browser cache and cookies')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

verifyLogin()
