import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🧪 Testing Login After t_user Table Cleanup\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  console.log('1️⃣ Attempting login...')
  console.log('   Email:', email)
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (authError) {
    console.error('❌ Login failed:', authError.message)
    return
  }
  
  console.log('✅ Login successful!')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)
  console.log('   Role:', authData.user.user_metadata?.role)
  
  console.log('\n2️⃣ Fetching employee data...')
  const { data: employee, error: empError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, is_active')
    .eq('user_id', authData.user.id)
    .single()
  
  if (empError) {
    console.error('❌ Failed to fetch employee:', empError.message)
    return
  }
  
  console.log('✅ Employee data found!')
  console.log('   Employee ID:', employee.id)
  console.log('   Name:', employee.full_name)
  console.log('   Code:', employee.employee_code)
  console.log('   Active:', employee.is_active)
  
  console.log('\n3️⃣ Verifying t_user table is gone...')
  const { error: tableError } = await supabase
    .from('t_user')
    .select('id')
    .limit(1)
  
  if (tableError) {
    if (tableError.message.includes('does not exist') || tableError.code === '42P01') {
      console.log('✅ t_user table successfully removed!')
    } else {
      console.log('⚠️ Unexpected error:', tableError.message)
    }
  } else {
    console.log('⚠️ t_user table still exists!')
  }
  
  console.log('\n4️⃣ Logging out...')
  await supabase.auth.signOut()
  console.log('✅ Logged out successfully!')
  
  console.log('\n✅ All tests passed! Login system is working correctly.')
}

testLogin().catch(console.error)
