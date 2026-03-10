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

async function fixEmployeeRole() {
  console.log('='.repeat(60))
  console.log('FIXING EMPLOYEE ROLE ISSUE')
  console.log('='.repeat(60))
  console.log()

  // 1. Get all employees and check their role column
  console.log('1. Checking all employee records...')
  const { data: employees, error: empError } = await supabase
    .from('m_employees')
    .select('id, employee_code, full_name, user_id, is_active')
  
  if (empError) {
    console.log('❌ Error fetching employees:', empError.message)
    return
  }

  console.log(`Found ${employees.length} employee(s)`)
  console.log()

  // 2. Check if role column exists
  console.log('2. Checking if role column exists in m_employees...')
  const { data: sample, error: sampleError } = await supabase
    .from('m_employees')
    .select('*')
    .limit(1)
    .single()

  if (sampleError) {
    console.log('❌ Error:', sampleError.message)
    return
  }

  const hasRoleColumn = 'role' in sample
  console.log(`Role column exists: ${hasRoleColumn}`)
  
  if (hasRoleColumn) {
    console.log('Sample employee role:', sample.role)
  }
  console.log()

  // 3. Get auth users and their roles from metadata
  console.log('3. Getting auth users and their roles...')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.log('❌ Error fetching auth users:', authError.message)
    return
  }

  const userRoles = new Map()
  authData.users.forEach(user => {
    const role = user.user_metadata?.role
    if (role) {
      userRoles.set(user.id, role)
    }
    console.log(`   ${user.email}: ${role || 'NO ROLE'}`)
  })
  console.log()

  // 4. If role column doesn't exist, we need to add it
  if (!hasRoleColumn) {
    console.log('4. Role column is missing! Need to add it via migration.')
    console.log('   Run this SQL in Supabase SQL Editor:')
    console.log()
    console.log('   ALTER TABLE m_employees ADD COLUMN IF NOT EXISTS role VARCHAR(50);')
    console.log('   ALTER TABLE m_employees ADD CONSTRAINT m_employees_role_check')
    console.log("     CHECK (role IN ('superadmin', 'unit_manager', 'employee'));")
    console.log()
  } else {
    // 5. Update employee roles from auth metadata
    console.log('4. Updating employee roles from auth metadata...')
    
    for (const emp of employees) {
      if (!emp.user_id) {
        console.log(`   ⚠️  ${emp.full_name}: No user_id linked`)
        continue
      }

      const role = userRoles.get(emp.user_id)
      if (!role) {
        console.log(`   ⚠️  ${emp.full_name}: No role in auth metadata`)
        continue
      }

      const { error: updateError } = await supabase
        .from('m_employees')
        .update({ role: role })
        .eq('id', emp.id)

      if (updateError) {
        console.log(`   ❌ ${emp.full_name}: Failed to update - ${updateError.message}`)
      } else {
        console.log(`   ✅ ${emp.full_name}: Updated to ${role}`)
      }
    }
  }

  console.log()
  console.log('='.repeat(60))
  console.log('FIX COMPLETE')
  console.log('='.repeat(60))
}

fixEmployeeRole().catch(console.error)
