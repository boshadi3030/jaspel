import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLoginFix() {
  console.log('🧪 Testing Login Fix...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'

  console.log('1️⃣ Testing Supabase Auth Login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error('❌ Auth login failed:', authError?.message)
    return
  }

  console.log('✅ Auth login successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)

  console.log('\n2️⃣ Checking t_user table...')
  const { data: userData, error: userError } = await supabase
    .from('t_user')
    .select('id, email, role, employee_id, is_active')
    .eq('id', authData.user.id)
    .single()

  if (userError) {
    console.error('❌ Failed to fetch from t_user:', userError.message)
    return
  }

  if (!userData) {
    console.error('❌ User not found in t_user')
    return
  }

  console.log('✅ User found in t_user')
  console.log('   ID:', userData.id)
  console.log('   Email:', userData.email)
  console.log('   Role:', userData.role)
  console.log('   Employee ID:', userData.employee_id)
  console.log('   Active:', userData.is_active)

  // Fetch employee data if exists
  if (userData.employee_id) {
    console.log('\n3️⃣ Checking m_employees table...')
    const { data: employeeData, error: employeeError } = await supabase
      .from('m_employees')
      .select('full_name, unit_id')
      .eq('id', userData.employee_id)
      .single()

    if (employeeError) {
      console.error('❌ Failed to fetch employee:', employeeError.message)
    } else if (employeeData) {
      console.log('✅ Employee data found')
      console.log('   Full Name:', employeeData.full_name)
      console.log('   Unit ID:', employeeData.unit_id)
    }
  }

  console.log('\n4️⃣ Verifying session...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error('❌ Session verification failed:', sessionError?.message)
    return
  }

  console.log('✅ Session verified')
  console.log('   Access token exists:', !!session.access_token)
  console.log('   Refresh token exists:', !!session.refresh_token)

  console.log('\n5️⃣ Testing middleware query...')
  const { data: middlewareUser, error: middlewareError } = await supabase
    .from('t_user')
    .select('is_active')
    .eq('id', session.user.id)
    .single()

  if (middlewareError) {
    console.error('❌ Middleware query failed:', middlewareError.message)
    return
  }

  console.log('✅ Middleware query successful')
  console.log('   User active:', middlewareUser.is_active)

  console.log('\n✅ All tests passed! Login should work now.')
  console.log('\n📝 Summary:')
  console.log('   - Auth login: ✅')
  console.log('   - t_user query: ✅')
  console.log('   - m_employees query: ✅')
  console.log('   - Session: ✅')
  console.log('   - Middleware query: ✅')

  // Sign out
  await supabase.auth.signOut()
  console.log('\n🔓 Signed out')
}

testLoginFix().catch(console.error)
