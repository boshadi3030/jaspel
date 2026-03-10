import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCompleteLoginFlow() {
  console.log('🔐 Testing Complete Login Flow...\n')
  
  const email = 'mukhsin9@gmail.com'
  const password = 'admin123'
  
  try {
    // Test 1: Login
    console.log('1️⃣ Testing Login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError || !authData.user) {
      console.error('❌ Login failed:', authError?.message)
      return
    }
    
    console.log('✅ Login successful')
    console.log(`   - User ID: ${authData.user.id}`)
    console.log(`   - Email: ${authData.user.email}`)
    
    // Test 2: Check user_metadata
    console.log('\n2️⃣ Checking user_metadata...')
    const metadata = authData.user.user_metadata
    
    if (!metadata?.role) {
      console.error('❌ Role not found in user_metadata')
      return
    }
    
    console.log('✅ User metadata found')
    console.log(`   - Role: ${metadata.role}`)
    console.log(`   - Employee ID: ${metadata.employee_id}`)
    console.log(`   - Full Name: ${metadata.full_name}`)
    
    // Test 3: Get employee data (without role/email)
    console.log('\n3️⃣ Fetching employee data...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id, is_active')
      .eq('user_id', authData.user.id)
      .single()
    
    if (employeeError || !employee) {
      console.error('❌ Employee fetch failed:', employeeError?.message)
      return
    }
    
    console.log('✅ Employee data retrieved')
    console.log(`   - Employee ID: ${employee.id}`)
    console.log(`   - Employee Code: ${employee.employee_code}`)
    console.log(`   - Full Name: ${employee.full_name}`)
    console.log(`   - Unit ID: ${employee.unit_id}`)
    console.log(`   - Is Active: ${employee.is_active}`)
    
    // Test 4: Verify session
    console.log('\n4️⃣ Verifying session...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('❌ Session verification failed:', sessionError?.message)
      return
    }
    
    console.log('✅ Session verified')
    console.log(`   - Expires at: ${new Date(session.expires_at! * 1000).toLocaleString()}`)
    
    // Test 5: Check role from session
    console.log('\n5️⃣ Checking role from session...')
    const roleFromSession = session.user.user_metadata?.role
    
    if (!roleFromSession) {
      console.error('❌ Role not found in session metadata')
      return
    }
    
    console.log('✅ Role accessible from session')
    console.log(`   - Role: ${roleFromSession}`)
    
    // Test 6: Simulate middleware check
    console.log('\n6️⃣ Simulating middleware check...')
    
    // Check if employee is active
    if (!employee.is_active) {
      console.error('❌ Employee is not active')
      return
    }
    
    console.log('✅ Middleware check passed')
    console.log(`   - User is active`)
    console.log(`   - Role: ${roleFromSession}`)
    
    // Test 7: Determine dashboard route
    console.log('\n7️⃣ Determining dashboard route...')
    const dashboardRoute = '/dashboard'  // Unified dashboard
    
    console.log('✅ Dashboard route determined')
    console.log(`   - Route: ${dashboardRoute}`)
    
    // Test 8: Logout
    console.log('\n8️⃣ Testing logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message)
      return
    }
    
    console.log('✅ Logout successful')
    
    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ ALL TESTS PASSED!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log(`   - User: ${employee.full_name} (${email})`)
    console.log(`   - Role: ${roleFromSession}`)
    console.log(`   - Employee Code: ${employee.employee_code}`)
    console.log(`   - Status: Active`)
    console.log(`   - Dashboard: ${dashboardRoute}`)
    console.log('\n🎉 Login system is working correctly!')
    console.log('   You can now login via web interface at http://localhost:3002/login')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testCompleteLoginFlow()
