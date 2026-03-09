import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLogin(email: string, password: string) {
  console.log('='.repeat(60))
  console.log('TESTING LOGIN')
  console.log('='.repeat(60))
  console.log('')
  console.log('Email:', email)
  console.log('Password:', '*'.repeat(password.length))
  console.log('')

  try {
    // Step 1: Try to sign in
    console.log('Step 1: Attempting sign in...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('❌ Sign in failed:', authError.message)
      console.log('')
      console.log('Possible reasons:')
      console.log('  1. Wrong password')
      console.log('  2. User not confirmed')
      console.log('  3. User disabled')
      console.log('')
      return
    }

    if (!authData.user || !authData.session) {
      console.error('❌ No user or session returned')
      return
    }

    console.log('✅ Sign in successful!')
    console.log('  User ID:', authData.user.id)
    console.log('  Email:', authData.user.email)
    console.log('  Session expires:', new Date(authData.session.expires_at! * 1000).toLocaleString())
    console.log('')

    // Step 2: Check employee record
    console.log('Step 2: Checking employee record...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, email, full_name, role, is_active')
      .eq('email', authData.user.email)
      .single()

    if (empError) {
      console.error('❌ Employee fetch failed:', empError.message)
      return
    }

    if (!employee) {
      console.error('❌ Employee not found in m_employees table')
      return
    }

    console.log('✅ Employee found!')
    console.log('  ID:', employee.id)
    console.log('  Name:', employee.full_name)
    console.log('  Role:', employee.role)
    console.log('  Active:', employee.is_active ? '✅' : '❌')
    console.log('')

    // Step 3: Determine redirect
    console.log('Step 3: Determining redirect URL...')
    let redirectUrl = '/employee/dashboard'
    if (employee.role === 'superadmin') {
      redirectUrl = '/admin/dashboard'
    } else if (employee.role === 'unit_manager') {
      redirectUrl = '/manager/dashboard'
    }

    console.log('✅ Redirect URL:', redirectUrl)
    console.log('')

    // Step 4: Sign out
    console.log('Step 4: Signing out...')
    await supabase.auth.signOut()
    console.log('✅ Signed out')
    console.log('')

    console.log('='.repeat(60))
    console.log('LOGIN TEST SUCCESSFUL!')
    console.log('='.repeat(60))
    console.log('')
    console.log('The login flow works correctly.')
    console.log('You can now login with:')
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${password}`)
    console.log(`  Expected redirect: ${redirectUrl}`)
    console.log('')

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get credentials from command line or use default
const email = process.argv[2] || 'mukhsin9@gmail.com'
const password = process.argv[3] || 'password123'

testLogin(email, password)
