import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🔍 Testing Login Flow...\n')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  console.log('📧 Email:', email)
  console.log('🔒 Password: ********\n')
  
  try {
    // Step 1: Sign in
    console.log('Step 1: Signing in with Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    })
    
    if (authError) {
      console.error('❌ Auth Error:', authError.message)
      return
    }
    
    if (!authData.user) {
      console.error('❌ No user returned')
      return
    }
    
    console.log('✅ Auth successful!')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('   Role from metadata:', authData.user.user_metadata?.role)
    console.log('')
    
    // Step 2: Get employee data
    console.log('Step 2: Fetching employee data...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id, is_active')
      .eq('user_id', authData.user.id)
      .single()
    
    if (employeeError) {
      console.error('❌ Employee Error:', employeeError.message)
      console.error('   Details:', employeeError)
      return
    }
    
    if (!employeeData) {
      console.error('❌ No employee data found')
      return
    }
    
    console.log('✅ Employee data found!')
    console.log('   Employee ID:', employeeData.id)
    console.log('   Code:', employeeData.employee_code)
    console.log('   Name:', employeeData.full_name)
    console.log('   Unit ID:', employeeData.unit_id)
    console.log('   Active:', employeeData.is_active)
    console.log('')
    
    // Step 3: Verify session
    console.log('Step 3: Verifying session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session Error:', sessionError.message)
      return
    }
    
    if (!session) {
      console.error('❌ No session found')
      return
    }
    
    console.log('✅ Session verified!')
    console.log('   Access Token:', session.access_token.substring(0, 20) + '...')
    console.log('   Expires At:', new Date(session.expires_at! * 1000).toLocaleString())
    console.log('')
    
    // Step 4: Test RLS policies
    console.log('Step 4: Testing RLS policies...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .limit(5)
    
    if (unitsError) {
      console.error('❌ RLS Error:', unitsError.message)
      return
    }
    
    console.log('✅ RLS policies working!')
    console.log('   Units accessible:', units?.length || 0)
    console.log('')
    
    console.log('🎉 LOGIN TEST SUCCESSFUL!')
    console.log('   All steps completed without errors')
    
    // Sign out
    await supabase.auth.signOut()
    console.log('✅ Signed out successfully')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

testLogin()
