import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🧪 Testing Login Flow')
console.log('='.repeat(50))

async function testLogin() {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  const testEmail = 'mukhsin9@gmail.com'
  const testPassword = 'admin123'

  console.log('📧 Email:', testEmail)
  console.log('')

  // Step 1: Sign in
  console.log('Step 1: Sign in...')
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (authError) {
    console.error('❌ Sign in failed:', authError.message)
    return
  }

  console.log('✅ Sign in successful')
  console.log('   User ID:', authData.user.id)
  console.log('   Role:', authData.user.user_metadata?.role)
  console.log('')

  // Step 2: Get employee data
  console.log('Step 2: Get employee data...')
  const { data: employee, error: empError } = await supabase
    .from('m_employees')
    .select('*')
    .eq('user_id', authData.user.id)
    .single()

  if (empError) {
    console.error('❌ Employee fetch failed:', empError.message)
    return
  }

  console.log('✅ Employee data retrieved')
  console.log('   Name:', employee.full_name)
  console.log('   Active:', employee.is_active)
  console.log('')

  // Step 3: Verify session
  console.log('Step 3: Verify session...')
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.error('❌ No session found')
    return
  }

  console.log('✅ Session verified')
  console.log('   Expires:', new Date(session.expires_at! * 1000).toLocaleString())
  console.log('')

  console.log('🎉 All tests passed!')
}

testLogin()
