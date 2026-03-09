import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🔍 Testing Login Flow...\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  console.log('📧 Email:', email)
  console.log('🔒 Password:', '***')
  console.log('')
  
  // Step 1: Sign in
  console.log('Step 1: Signing in with Supabase Auth...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (authError) {
    console.error('❌ Auth Error:', authError)
    return
  }
  
  console.log('✅ Auth successful!')
  console.log('   User ID:', authData.user?.id)
  console.log('   Email:', authData.user?.email)
  console.log('')
  
  // Step 2: Fetch from t_user
  console.log('Step 2: Fetching user data from t_user...')
  const { data: userData, error: userError } = await supabase
    .from('t_user')
    .select('id, email, role, employee_id, is_active')
    .eq('id', authData.user!.id)
    .single()
  
  if (userError) {
    console.error('❌ User fetch error:', userError)
    return
  }
  
  console.log('✅ User data fetched!')
  console.log('   User:', JSON.stringify(userData, null, 2))
  console.log('')
  
  // Step 3: Fetch employee data
  if (userData.employee_id) {
    console.log('Step 3: Fetching employee data...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, unit_id, employee_code')
      .eq('id', userData.employee_id)
      .single()
    
    if (employeeError) {
      console.error('❌ Employee fetch error:', employeeError)
    } else {
      console.log('✅ Employee data fetched!')
      console.log('   Employee:', JSON.stringify(employeeData, null, 2))
    }
  }
  
  console.log('')
  console.log('✅ Login flow completed successfully!')
  console.log('   Dashboard route:', userData.role === 'superadmin' ? '/admin/dashboard' : '/employee/dashboard')
}

testLogin().catch(console.error)
