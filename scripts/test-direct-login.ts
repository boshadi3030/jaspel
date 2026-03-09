import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('Testing direct login...\n')

  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  }

  console.log(`Attempting login with: ${testUser.email}`)
  console.log('Password: admin123\n')

  try {
    // Step 1: Sign in
    console.log('[1/4] Signing in...')
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })

    if (signInError) {
      console.error('✗ Sign in failed:', signInError.message)
      return
    }

    if (!authData.user || !authData.session) {
      console.error('✗ No user or session returned')
      return
    }

    console.log('✓ Sign in successful')
    console.log(`  User ID: ${authData.user.id}`)
    console.log(`  Email: ${authData.user.email}`)
    console.log(`  Session expires: ${new Date(authData.session.expires_at! * 1000).toLocaleString()}`)
    console.log('')

    // Step 2: Get session
    console.log('[2/4] Verifying session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('✗ Session verification failed:', sessionError?.message)
      return
    }

    console.log('✓ Session verified')
    console.log(`  Access token: ${session.access_token.substring(0, 20)}...`)
    console.log('')

    // Step 3: Get employee data
    console.log('[3/4] Fetching employee data...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, role, is_active, unit_id')
      .eq('email', authData.user.email)
      .single()

    if (employeeError) {
      console.error('✗ Employee fetch failed:', employeeError.message)
      return
    }

    if (!employee) {
      console.error('✗ Employee not found in database')
      return
    }

    console.log('✓ Employee data fetched')
    console.log(`  ID: ${employee.id}`)
    console.log(`  Code: ${employee.employee_code}`)
    console.log(`  Name: ${employee.full_name}`)
    console.log(`  Role: ${employee.role}`)
    console.log(`  Active: ${employee.is_active}`)
    console.log('')

    // Step 4: Determine redirect
    console.log('[4/4] Determining redirect URL...')
    let redirectUrl = '/employee/dashboard'
    if (employee.role === 'superadmin') {
      redirectUrl = '/admin/dashboard'
    } else if (employee.role === 'unit_manager') {
      redirectUrl = '/manager/dashboard'
    }

    console.log('✓ Redirect URL determined')
    console.log(`  URL: ${redirectUrl}`)
    console.log('')

    console.log('=== LOGIN TEST SUCCESSFUL ===')
    console.log('All steps completed without errors.')
    console.log('You should be able to login via browser now.')
    console.log('')
    console.log('Test credentials:')
    console.log(`  Email: ${testUser.email}`)
    console.log(`  Password: ${testUser.password}`)
    console.log(`  Expected redirect: ${redirectUrl}`)

    // Sign out
    await supabase.auth.signOut()

  } catch (err: any) {
    console.error('✗ Unexpected error:', err.message)
    console.error(err)
  }
}

testLogin()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
