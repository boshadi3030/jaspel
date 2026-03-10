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

async function diagnoseAuthIssue() {
  console.log('='.repeat(60))
  console.log('DIAGNOSING AUTHENTICATION ISSUE')
  console.log('='.repeat(60))
  console.log()

  // 1. Check if m_employees table exists and its structure
  console.log('1. Checking m_employees table structure...')
  const { data: employees, error: empError } = await supabase
    .from('m_employees')
    .select('*')
    .limit(1)
  
  if (empError) {
    console.log('❌ Error accessing m_employees:', empError.message)
    console.log('   Code:', empError.code)
  } else {
    console.log('✅ m_employees table exists')
    if (employees && employees.length > 0) {
      console.log('   Columns:', Object.keys(employees[0]).join(', '))
    }
  }
  console.log()

  // 2. Check auth.users
  console.log('2. Checking auth.users...')
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.log('❌ Error fetching auth users:', authError.message)
  } else {
    console.log(`✅ Found ${authUsers.users.length} auth user(s)`)
    authUsers.users.forEach((user, index) => {
      console.log(`   User ${index + 1}:`)
      console.log(`     - ID: ${user.id}`)
      console.log(`     - Email: ${user.email}`)
      console.log(`     - Role (metadata): ${user.user_metadata?.role || 'NOT SET'}`)
      console.log(`     - Created: ${user.created_at}`)
    })
  }
  console.log()

  // 3. Check m_employees records
  console.log('3. Checking m_employees records...')
  const { data: allEmployees, error: allEmpError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, email, role, is_active, user_id')
  
  if (allEmpError) {
    console.log('❌ Error fetching employees:', allEmpError.message)
    console.log('   Code:', allEmpError.code)
    console.log('   Details:', allEmpError.details)
  } else {
    console.log(`✅ Found ${allEmployees?.length || 0} employee record(s)`)
    allEmployees?.forEach((emp, index) => {
      console.log(`   Employee ${index + 1}:`)
      console.log(`     - ID: ${emp.id}`)
      console.log(`     - Code: ${emp.employee_code}`)
      console.log(`     - Name: ${emp.full_name}`)
      console.log(`     - Email: ${emp.email}`)
      console.log(`     - Role: ${emp.role}`)
      console.log(`     - Active: ${emp.is_active}`)
      console.log(`     - User ID: ${emp.user_id || 'NOT LINKED'}`)
    })
  }
  console.log()

  // 4. Check for orphaned auth users (auth user without employee record)
  if (authUsers && !authError && allEmployees && !allEmpError) {
    console.log('4. Checking for orphaned auth users...')
    const employeeUserIds = new Set(allEmployees.map(e => e.user_id).filter(Boolean))
    const orphanedUsers = authUsers.users.filter(u => !employeeUserIds.has(u.id))
    
    if (orphanedUsers.length > 0) {
      console.log(`⚠️  Found ${orphanedUsers.length} orphaned auth user(s) (no employee record):`)
      orphanedUsers.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    } else {
      console.log('✅ No orphaned auth users found')
    }
    console.log()
  }

  // 5. Test login with the credentials from login page
  console.log('5. Testing login with mukhsin9@gmail.com...')
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'mukhsin9@gmail.com',
    password: 'admin123'
  })

  if (loginError) {
    console.log('❌ Login failed:', loginError.message)
    console.log('   Code:', loginError.code)
  } else if (loginData.user) {
    console.log('✅ Login successful!')
    console.log(`   User ID: ${loginData.user.id}`)
    console.log(`   Email: ${loginData.user.email}`)
    console.log(`   Role (metadata): ${loginData.user.user_metadata?.role || 'NOT SET'}`)
    
    // Check if employee record exists for this user
    const { data: empRecord, error: empRecordError } = await supabase
      .from('m_employees')
      .select('*')
      .eq('user_id', loginData.user.id)
      .maybeSingle()
    
    if (empRecordError) {
      console.log('   ❌ Error fetching employee record:', empRecordError.message)
    } else if (!empRecord) {
      console.log('   ⚠️  NO EMPLOYEE RECORD FOUND - This is the problem!')
    } else {
      console.log('   ✅ Employee record found:')
      console.log(`      - Name: ${empRecord.full_name}`)
      console.log(`      - Role: ${empRecord.role}`)
      console.log(`      - Active: ${empRecord.is_active}`)
    }
  }
  console.log()

  console.log('='.repeat(60))
  console.log('DIAGNOSIS COMPLETE')
  console.log('='.repeat(60))
}

diagnoseAuthIssue().catch(console.error)
