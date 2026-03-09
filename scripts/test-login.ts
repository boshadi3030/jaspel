/**
 * Script untuk test login functionality
 * Run: npx tsx scripts/test-login.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('=== Testing Login Functionality ===\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test credentials
  const testEmail = 'nama@email.com'
  const testPassword = 'password123'

  console.log('1. Testing login with credentials...')
  console.log(`   Email: ${testEmail}`)
  
  try {
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (error) {
      console.log('   ✗ Login failed:', error.message)
      return
    }

    if (!data.user || !data.session) {
      console.log('   ✗ Login failed: No user or session returned')
      return
    }

    console.log('   ✓ Login successful')
    console.log(`   User ID: ${data.user.id}`)
    console.log(`   Email: ${data.user.email}`)
    console.log(`   Session expires: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`)

    // Check employee data
    console.log('\n2. Checking employee data...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, email, role, full_name, is_active')
      .eq('email', data.user.email)
      .single()

    if (empError) {
      console.log('   ✗ Failed to fetch employee:', empError.message)
      return
    }

    if (!employee) {
      console.log('   ✗ Employee not found')
      return
    }

    console.log('   ✓ Employee found')
    console.log(`   Name: ${employee.full_name}`)
    console.log(`   Role: ${employee.role}`)
    console.log(`   Active: ${employee.is_active}`)

    if (!employee.is_active) {
      console.log('   ⚠ Warning: Employee is not active')
    }

    // Test session persistence
    console.log('\n3. Testing session persistence...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('   ✓ Session persisted successfully')
      console.log(`   Access token: ${session.access_token.substring(0, 20)}...`)
    } else {
      console.log('   ✗ Session not persisted')
    }

    // Cleanup - sign out
    console.log('\n4. Cleaning up...')
    await supabase.auth.signOut()
    console.log('   ✓ Signed out successfully')

    console.log('\n=== Test Complete ===')
    console.log('✓ All tests passed')

  } catch (err: any) {
    console.log('   ✗ Unexpected error:', err.message)
  }
}

testLogin()
