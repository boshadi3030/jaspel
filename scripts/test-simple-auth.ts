import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testAuth() {
  console.log('🧪 Testing Simple Supabase Auth\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test 1: Login with valid credentials
  console.log('Test 1: Login with valid credentials')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123',
  })
  
  if (authError) {
    console.log('❌ Login failed:', authError.message)
    return
  }
  
  console.log('✅ Login successful')
  console.log('   User:', authData.user?.email)
  console.log('   Session:', authData.session ? 'Created' : 'Not created')
  
  // Test 2: Fetch user data from database
  console.log('\nTest 2: Fetch user data from database')
  const { data: userData, error: userError } = await supabase
    .from('m_employees')
    .select('id, email, role, is_active, full_name')
    .eq('email', authData.user?.email)
    .single()
  
  if (userError) {
    console.log('❌ User fetch failed:', userError.message)
  } else {
    console.log('✅ User data fetched')
    console.log('   Name:', userData.full_name)
    console.log('   Role:', userData.role)
    console.log('   Active:', userData.is_active)
  }
  
  // Test 3: Check session
  console.log('\nTest 3: Check session')
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    console.log('✅ Session exists')
    console.log('   Expires at:', new Date(session.expires_at! * 1000).toLocaleString())
  } else {
    console.log('❌ No session found')
  }
  
  // Test 4: Logout
  console.log('\nTest 4: Logout')
  const { error: logoutError } = await supabase.auth.signOut()
  
  if (logoutError) {
    console.log('❌ Logout failed:', logoutError.message)
  } else {
    console.log('✅ Logout successful')
  }
  
  // Test 5: Verify session cleared
  console.log('\nTest 5: Verify session cleared')
  const { data: { session: afterLogout } } = await supabase.auth.getSession()
  
  if (afterLogout) {
    console.log('❌ Session still exists after logout')
  } else {
    console.log('✅ Session cleared')
  }
  
  console.log('\n✅ All tests completed!')
}

testAuth().catch(console.error)
