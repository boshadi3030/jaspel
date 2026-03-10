import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function diagnoseLoginIssue() {
  console.log('🔍 Diagnosing Login Issue...\n')
  
  const testEmail = 'mukhsin9@gmail.com'
  
  try {
    // 1. Check if user exists in auth.users
    console.log('1️⃣ Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }
    
    const authUser = authUsers.users.find(u => u.email === testEmail)
    
    if (!authUser) {
      console.log(`❌ User ${testEmail} NOT FOUND in auth.users`)
      console.log('\n📋 Available users in auth.users:')
      authUsers.users.forEach(u => {
        console.log(`   - ${u.email} (ID: ${u.id})`)
      })
      return
    }
    
    console.log(`✅ User found in auth.users`)
    console.log(`   - ID: ${authUser.id}`)
    console.log(`   - Email: ${authUser.email}`)
    console.log(`   - Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`)
    console.log(`   - Metadata:`, JSON.stringify(authUser.user_metadata, null, 2))
    
    // 2. Check if employee record exists
    console.log('\n2️⃣ Checking m_employees table...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('user_id', authUser.id)
      .maybeSingle()
    
    if (employeeError) {
      console.error('❌ Error fetching employee:', employeeError)
      return
    }
    
    if (!employee) {
      console.log(`❌ Employee record NOT FOUND for user_id: ${authUser.id}`)
      
      // Check if there are any employees
      const { data: allEmployees, error: allError } = await supabase
        .from('m_employees')
        .select('id, user_id, full_name, email')
        .limit(10)
      
      if (!allError && allEmployees) {
        console.log('\n📋 Sample employees in m_employees:')
        allEmployees.forEach(e => {
          console.log(`   - ${e.full_name} (${e.email}) - user_id: ${e.user_id || 'NULL'}`)
        })
      }
      return
    }
    
    console.log(`✅ Employee record found`)
    console.log(`   - ID: ${employee.id}`)
    console.log(`   - Full Name: ${employee.full_name}`)
    console.log(`   - Email: ${employee.email}`)
    console.log(`   - Role: ${employee.role}`)
    console.log(`   - Unit ID: ${employee.unit_id}`)
    console.log(`   - Is Active: ${employee.is_active}`)
    console.log(`   - User ID: ${employee.user_id}`)
    
    // 3. Test login
    console.log('\n3️⃣ Testing login with password...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'admin123'
    })
    
    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }
    
    console.log('✅ Login successful!')
    console.log(`   - Session: ${loginData.session ? 'Created' : 'Not created'}`)
    console.log(`   - User ID: ${loginData.user?.id}`)
    
    // 4. Check RLS policies
    console.log('\n4️⃣ Checking RLS policies on m_employees...')
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'm_employees' })
      .maybeSingle()
    
    if (policyError) {
      console.log('⚠️  Could not fetch RLS policies (this is OK)')
    } else {
      console.log('✅ RLS policies exist')
    }
    
    console.log('\n✅ DIAGNOSIS COMPLETE')
    console.log('\n📊 Summary:')
    console.log(`   - Auth User: ${authUser ? '✅' : '❌'}`)
    console.log(`   - Employee Record: ${employee ? '✅' : '❌'}`)
    console.log(`   - Login Test: ${loginData ? '✅' : '❌'}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

diagnoseLoginIssue()
