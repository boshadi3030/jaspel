import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🔐 Testing Login Flow...\n')
  
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  try {
    // 1. Login
    console.log('1️⃣ Attempting login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }
    
    console.log('✅ Login successful!')
    console.log(`   - User ID: ${authData.user.id}`)
    console.log(`   - Email: ${authData.user.email}`)
    console.log(`   - Role from metadata: ${authData.user.user_metadata?.role}`)
    
    // 2. Get employee data
    console.log('\n2️⃣ Fetching employee data...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, unit_id, is_active')
      .eq('user_id', authData.user.id)
      .single()
    
    if (employeeError) {
      console.error('❌ Employee fetch failed:', employeeError.message)
      return
    }
    
    console.log('✅ Employee data retrieved!')
    console.log(`   - Employee ID: ${employee.id}`)
    console.log(`   - Full Name: ${employee.full_name}`)
    console.log(`   - Unit ID: ${employee.unit_id}`)
    console.log(`   - Is Active: ${employee.is_active}`)
    
    // 3. Verify session
    console.log('\n3️⃣ Verifying session...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('❌ No session found')
      return
    }
    
    console.log('✅ Session verified!')
    console.log(`   - Access token: ${session.access_token.substring(0, 20)}...`)
    console.log(`   - Expires at: ${new Date(session.expires_at! * 1000).toLocaleString()}`)
    
    console.log('\n✅ LOGIN TEST SUCCESSFUL!')
    console.log('\n📝 Summary:')
    console.log(`   - User: ${employee.full_name}`)
    console.log(`   - Role: ${authData.user.user_metadata?.role}`)
    console.log(`   - Status: ${employee.is_active ? 'Active' : 'Inactive'}`)
    console.log('\n🎉 You should now be able to login via the web interface!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testLogin()
