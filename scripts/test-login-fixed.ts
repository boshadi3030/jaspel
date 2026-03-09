import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testLogin() {
  console.log('🧪 Testing Login Fix...\n')

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test credentials
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'

  console.log('1️⃣ Attempting login...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error('❌ Login failed:', authError?.message)
    return
  }

  console.log('✅ Login successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Email:', authData.user.email)
  console.log('   Role:', authData.user.user_metadata?.role)

  console.log('\n2️⃣ Verifying session...')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    console.error('❌ Session verification failed:', sessionError?.message)
    return
  }

  console.log('✅ Session verified')
  console.log('   Access token exists:', !!session.access_token)
  console.log('   Refresh token exists:', !!session.refresh_token)

  console.log('\n3️⃣ Fetching employee data...')
  const { data: employee, error: employeeError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, unit_id, is_active')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (employeeError) {
    console.error('❌ Employee fetch failed:', employeeError.message)
    return
  }

  if (!employee) {
    console.error('❌ Employee not found')
    return
  }

  console.log('✅ Employee data fetched')
  console.log('   Employee ID:', employee.id)
  console.log('   Name:', employee.full_name)
  console.log('   Code:', employee.employee_code)
  console.log('   Active:', employee.is_active)

  console.log('\n4️⃣ Testing session persistence...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  const { data: { session: session2 }, error: session2Error } = await supabase.auth.getSession()

  if (session2Error || !session2) {
    console.error('❌ Session lost after 2 seconds')
    return
  }

  console.log('✅ Session persisted after 2 seconds')

  console.log('\n5️⃣ Signing out...')
  const { error: signOutError } = await supabase.auth.signOut()

  if (signOutError) {
    console.error('❌ Sign out failed:', signOutError.message)
    return
  }

  console.log('✅ Sign out successful')

  console.log('\n✅ All tests passed! Login is working correctly.')
  console.log('\n📝 Next steps:')
  console.log('   1. Restart the dev server if it\'s running')
  console.log('   2. Clear browser cache and cookies')
  console.log('   3. Try logging in at http://localhost:3002/login')
}

testLogin().catch(console.error)
