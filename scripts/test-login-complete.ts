import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  console.log('📧 Testing with:', email)
  console.log('🔒 Password length:', password.length)
  console.log('')
  
  // Step 1: Sign in
  console.log('Step 1: Signing in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (authError) {
    console.error('❌ Auth error:', authError.message)
    return
  }
  
  if (!authData.user) {
    console.error('❌ No user returned')
    return
  }
  
  console.log('✅ Auth successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)
  console.log('   Session:', authData.session ? 'Present' : 'Missing')
  console.log('')
  
  // Step 2: Verify session
  console.log('Step 2: Verifying session...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError.message)
    return
  }
  
  if (!session) {
    console.error('❌ No session found')
    return
  }
  
  console.log('✅ Session verified')
  console.log('   Access token:', session.access_token.substring(0, 20) + '...')
  console.log('   Expires at:', new Date(session.expires_at! * 1000).toLocaleString())
  console.log('')
  
  // Step 3: Fetch user data
  console.log('Step 3: Fetching user data...')
  const { data: userData, error: userError } = await supabase
    .from('t_user')
    .select('id, email, role, employee_id, is_active')
    .eq('id', authData.user.id)
    .single()
  
  if (userError) {
    console.error('❌ User fetch error:', userError.message)
    return
  }
  
  if (!userData) {
    console.error('❌ No user data found')
    return
  }
  
  console.log('✅ User data fetched')
  console.log('   Role:', userData.role)
  console.log('   Active:', userData.is_active)
  console.log('   Employee ID:', userData.employee_id || 'None')
  console.log('')
  
  // Step 4: Fetch employee data if exists
  if (userData.employee_id) {
    console.log('Step 4: Fetching employee data...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, unit_id')
      .eq('id', userData.employee_id)
      .single()
    
    if (employeeError) {
      console.error('⚠️ Employee fetch error:', employeeError.message)
    } else if (employeeData) {
      console.log('✅ Employee data fetched')
      console.log('   Name:', employeeData.full_name)
      console.log('   Unit ID:', employeeData.unit_id || 'None')
    }
    console.log('')
  }
  
  // Step 5: Test dashboard route
  console.log('Step 5: Determining dashboard route...')
  const dashboardRoutes: Record<string, string> = {
    'superadmin': '/admin/dashboard',
    'admin': '/admin/dashboard',
    'unit_manager': '/manager/dashboard',
    'employee': '/employee/dashboard',
  }
  
  const dashboardRoute = dashboardRoutes[userData.role] || '/forbidden'
  console.log('✅ Dashboard route:', dashboardRoute)
  console.log('')
  
  // Step 6: Sign out
  console.log('Step 6: Signing out...')
  const { error: signOutError } = await supabase.auth.signOut()
  
  if (signOutError) {
    console.error('❌ Sign out error:', signOutError.message)
    return
  }
  
  console.log('✅ Signed out successfully')
  console.log('')
  
  // Step 7: Verify session cleared
  console.log('Step 7: Verifying session cleared...')
  const { data: { session: afterSession } } = await supabase.auth.getSession()
  
  if (afterSession) {
    console.error('❌ Session still exists after sign out')
    return
  }
  
  console.log('✅ Session cleared')
  console.log('')
  
  console.log('🎉 All tests passed!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Start dev server: npm run dev')
  console.log('2. Open browser: http://localhost:3000/login')
  console.log('3. Login with: mukhsin9@gmail.com / admin123')
  console.log('4. Should redirect to:', dashboardRoute)
}

testLoginFlow().catch(console.error)
