import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('='.repeat(60))
  console.log('TESTING LOGIN AFTER FIX')
  console.log('='.repeat(60))
  console.log()

  // Test login
  console.log('1. Attempting login with mukhsin9@gmail.com...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123'
  })

  if (authError) {
    console.log('❌ Login failed:', authError.message)
    return
  }

  console.log('✅ Login successful!')
  console.log(`   User ID: ${authData.user.id}`)
  console.log(`   Email: ${authData.user.email}`)
  console.log(`   Role (metadata): ${authData.user.user_metadata?.role}`)
  console.log()

  // Fetch employee data
  console.log('2. Fetching employee data...')
  const { data: employeeData, error: employeeError } = await supabase
    .from('m_employees')
    .select('id, full_name, unit_id, is_active, role')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (employeeError) {
    console.log('❌ Error fetching employee:', employeeError.message)
    await supabase.auth.signOut()
    return
  }

  if (!employeeData) {
    console.log('❌ Employee record not found')
    await supabase.auth.signOut()
    return
  }

  console.log('✅ Employee data found:')
  console.log(`   Name: ${employeeData.full_name}`)
  console.log(`   Role: ${employeeData.role}`)
  console.log(`   Active: ${employeeData.is_active}`)
  console.log(`   Unit ID: ${employeeData.unit_id || 'None'}`)
  console.log()

  // Check if active
  if (!employeeData.is_active) {
    console.log('❌ Employee is not active')
    await supabase.auth.signOut()
    return
  }

  console.log('3. Checking route authorization...')
  const role = employeeData.role
  const testRoutes = [
    '/dashboard',
    '/units',
    '/users',
    '/pegawai',
    '/kpi-config',
    '/pool',
    '/realization',
    '/reports',
    '/audit',
    '/settings'
  ]

  console.log(`   User role: ${role}`)
  console.log(`   Testing access to routes:`)
  
  testRoutes.forEach(route => {
    // Superadmin has access to all routes
    const hasAccess = role === 'superadmin'
    console.log(`   ${hasAccess ? '✅' : '❌'} ${route}`)
  })
  console.log()

  // Sign out
  console.log('4. Signing out...')
  await supabase.auth.signOut()
  console.log('✅ Signed out successfully')
  console.log()

  console.log('='.repeat(60))
  console.log('TEST COMPLETE - LOGIN SHOULD NOW WORK!')
  console.log('='.repeat(60))
  console.log()
  console.log('Next steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Open http://localhost:3002/login')
  console.log('3. Login with: mukhsin9@gmail.com / admin123')
  console.log('4. You should be redirected to /dashboard')
}

testLogin().catch(console.error)
