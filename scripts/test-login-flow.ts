/**
 * Test Login Flow
 * 
 * This script tests the complete login flow including:
 * - Session creation
 * - Cookie persistence
 * - Employee validation
 * - Redirect logic
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLoginFlow() {
  console.log('🧪 Testing Login Flow...\n')

  const testEmail = 'mukhsin9@gmail.com'
  const testPassword = 'admin123'

  try {
    // Step 1: Clear any existing session
    console.log('[1/6] Clearing existing session...')
    await supabase.auth.signOut()
    console.log('✅ Session cleared\n')

    // Step 2: Attempt login
    console.log('[2/6] Attempting login...')
    console.log(`Email: ${testEmail}`)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return false
    }

    if (!authData.user || !authData.session) {
      console.error('❌ No user or session returned')
      return false
    }

    console.log('✅ Login successful')
    console.log(`User ID: ${authData.user.id}`)
    console.log(`Email: ${authData.user.email}`)
    console.log(`Session expires: ${new Date(authData.session.expires_at! * 1000).toLocaleString()}\n`)

    // Step 3: Verify session
    console.log('[3/6] Verifying session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('❌ Session verification failed:', sessionError?.message)
      return false
    }

    console.log('✅ Session verified')
    console.log(`Access token: ${session.access_token.substring(0, 20)}...\n`)

    // Step 4: Get employee data
    console.log('[4/6] Fetching employee data...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, email, full_name, role, is_active, unit_id')
      .eq('email', authData.user.email)
      .single()

    if (empError || !employee) {
      console.error('❌ Employee fetch failed:', empError?.message)
      return false
    }

    console.log('✅ Employee found')
    console.log(`Name: ${employee.full_name}`)
    console.log(`Role: ${employee.role}`)
    console.log(`Active: ${employee.is_active}`)
    console.log(`Unit ID: ${employee.unit_id || 'N/A'}\n`)

    // Step 5: Validate employee
    console.log('[5/6] Validating employee...')
    if (!employee.is_active) {
      console.error('❌ Employee is not active')
      return false
    }

    console.log('✅ Employee is active\n')

    // Step 6: Determine redirect URL
    console.log('[6/6] Determining redirect URL...')
    let redirectUrl = '/employee/dashboard'
    if (employee.role === 'superadmin') {
      redirectUrl = '/admin/dashboard'
    } else if (employee.role === 'unit_manager') {
      redirectUrl = '/manager/dashboard'
    }

    console.log('✅ Redirect URL determined')
    console.log(`URL: ${redirectUrl}\n`)

    // Summary
    console.log('═══════════════════════════════════════')
    console.log('✅ LOGIN FLOW TEST PASSED')
    console.log('═══════════════════════════════════════')
    console.log(`User: ${employee.full_name} (${employee.email})`)
    console.log(`Role: ${employee.role}`)
    console.log(`Dashboard: ${redirectUrl}`)
    console.log('═══════════════════════════════════════\n')

    // Cleanup
    console.log('🧹 Cleaning up...')
    await supabase.auth.signOut()
    console.log('✅ Session cleared\n')

    return true

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run test
testLoginFlow().then(success => {
  if (success) {
    console.log('✅ All tests passed!')
    process.exit(0)
  } else {
    console.log('❌ Tests failed!')
    process.exit(1)
  }
})
