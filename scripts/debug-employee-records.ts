#!/usr/bin/env tsx

/**
 * Debug employee records and auth users
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugEmployeeRecords() {
  console.log('🔍 Debugging employee records and auth users...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // List all auth users
    console.log('\n1. Auth users:')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Failed to list users:', usersError.message)
      return
    }
    
    console.log(`Found ${users.users.length} auth users:`)
    users.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.id})`)
      console.log(`      Role: ${user.user_metadata?.role || 'none'}`)
      console.log(`      Created: ${user.created_at}`)
    })
    
    // List all employees
    console.log('\n2. Employee records:')
    const { data: employees, error: employeesError } = await supabase
      .from('m_employees')
      .select('*')
    
    if (employeesError) {
      console.error('❌ Failed to list employees:', employeesError.message)
      return
    }
    
    console.log(`Found ${employees?.length || 0} employee records:`)
    employees?.forEach((emp, index) => {
      console.log(`   ${index + 1}. ${emp.full_name} (${emp.employee_code})`)
      console.log(`      Role: ${emp.role}`)
      console.log(`      Email: ${emp.email}`)
      console.log(`      User ID: ${emp.user_id || 'NULL'}`)
      console.log(`      Active: ${emp.is_active}`)
      console.log(`      Unit ID: ${emp.unit_id}`)
    })
    
    // Check for orphaned records
    console.log('\n3. Checking for orphaned records...')
    
    const superadminUsers = users.users.filter(u => u.user_metadata?.role === 'superadmin')
    console.log(`Superadmin auth users: ${superadminUsers.length}`)
    
    const superadminEmployees = employees?.filter(e => e.role === 'superadmin') || []
    console.log(`Superadmin employee records: ${superadminEmployees.length}`)
    
    // Check if auth users have corresponding employee records
    for (const user of superadminUsers) {
      const matchingEmployee = employees?.find(e => e.user_id === user.id)
      if (matchingEmployee) {
        console.log(`✅ Auth user ${user.email} has matching employee record`)
      } else {
        console.log(`❌ Auth user ${user.email} has NO matching employee record`)
      }
    }
    
    // Check if employee records have corresponding auth users
    for (const emp of superadminEmployees) {
      if (emp.user_id) {
        const matchingUser = users.users.find(u => u.id === emp.user_id)
        if (matchingUser) {
          console.log(`✅ Employee ${emp.full_name} has matching auth user`)
        } else {
          console.log(`❌ Employee ${emp.full_name} has INVALID user_id reference`)
        }
      } else {
        console.log(`⚠️  Employee ${emp.full_name} has NULL user_id`)
      }
    }
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error.message)
  }
}

// Run the debug
debugEmployeeRecords()