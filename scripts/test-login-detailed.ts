import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🔍 Testing login with detailed logging...\n')

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'

  console.log('1️⃣ Attempting to sign in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    console.error('❌ Auth error:', authError)
    return
  }

  if (!authData.user) {
    console.error('❌ No user data returned')
    return
  }

  console.log('✅ Auth successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)
  console.log('   Role:', authData.user.user_metadata?.role)

  console.log('\n2️⃣ Fetching employee data...')
  const { data: employeeData, error: employeeError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, is_active, user_id')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (employeeError) {
    console.error('❌ Employee fetch error:', employeeError)
    console.log('   Error details:', JSON.stringify(employeeError, null, 2))
    
    // Try to check if RLS is blocking
    console.log('\n3️⃣ Checking RLS policies...')
    const { data: policies } = await supabase.rpc('get_policies', { table_name: 'm_employees' }).catch(() => ({ data: null }))
    console.log('   Policies:', policies)
    
    return
  }

  if (!employeeData) {
    console.error('❌ No employee data found')
    console.log('   User ID:', authData.user.id)
    
    // Check if employee exists at all
    console.log('\n3️⃣ Checking if employee exists (bypassing RLS)...')
    const { count } = await supabase
      .from('m_employees')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
    
    console.log('   Employee count:', count)
    return
  }

  console.log('✅ Employee data found')
  console.log('   Employee ID:', employeeData.id)
  console.log('   Employee Code:', employeeData.employee_code)
  console.log('   Full Name:', employeeData.full_name)
  console.log('   Unit ID:', employeeData.unit_id)
  console.log('   Is Active:', employeeData.is_active)
  console.log('   User ID:', employeeData.user_id)

  console.log('\n✅ Login test successful!')
  
  // Sign out
  await supabase.auth.signOut()
  console.log('✅ Signed out')
}

testLogin().catch(console.error)
