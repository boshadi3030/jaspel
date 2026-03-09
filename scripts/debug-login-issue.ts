import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 Debug Login Issue')
console.log('='.repeat(50))
console.log('📍 Supabase URL:', supabaseUrl)
console.log('🔑 Anon Key:', supabaseKey.substring(0, 20) + '...')
console.log('')

async function debugLogin() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const testEmail = 'mukhsin9@gmail.com'
  const testPassword = 'admin123'

  console.log('🧪 Testing login with:')
  console.log('   Email:', testEmail)
  console.log('   Password: ********')
  console.log('')

  try {
    // Step 1: Try to sign in
    console.log('📡 Step 1: Attempting signInWithPassword...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    if (authError) {
      console.error('❌ Auth Error:', authError)
      console.error('   Code:', authError.status)
      console.error('   Message:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth')
      return
    }

    console.log('✅ Auth successful!')
    console.log('   User ID:', authData.user.id)
    console.log('   Email:', authData.user.email)
    console.log('   Metadata:', JSON.stringify(authData.user.user_metadata, null, 2))
    console.log('')

    // Step 2: Check employee data
    console.log('📡 Step 2: Fetching employee data...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (employeeError) {
      console.error('❌ Employee Error:', employeeError)
      console.error('   Code:', employeeError.code)
      console.error('   Message:', employeeError.message)
      console.error('   Details:', employeeError.details)
      return
    }

    if (!employeeData) {
      console.error('❌ No employee data found')
      return
    }

    console.log('✅ Employee data found!')
    console.log('   ID:', employeeData.id)
    console.log('   Full Name:', employeeData.full_name)
    console.log('   Unit ID:', employeeData.unit_id)
    console.log('   Is Active:', employeeData.is_active)
    console.log('')

    // Step 3: Check session
    console.log('📡 Step 3: Checking session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session Error:', sessionError)
      return
    }

    if (!session) {
      console.error('❌ No session found')
      return
    }

    console.log('✅ Session valid!')
    console.log('   Access Token:', session.access_token.substring(0, 20) + '...')
    console.log('   Expires At:', new Date(session.expires_at! * 1000).toISOString())
    console.log('')

    console.log('🎉 All checks passed! Login should work.')
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

debugLogin()
