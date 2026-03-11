#!/usr/bin/env tsx

/**
 * Test authentication and KPI Config page access
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testAuthAndKPIConfig() {
  console.log('🔐 Testing authentication and KPI Config access...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Check if superadmin user exists
    console.log('\n1. Checking superadmin user...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Failed to list users:', usersError.message)
      return false
    }
    
    const superadminUser = users.users.find(user => 
      user.user_metadata?.role === 'superadmin'
    )
    
    if (!superadminUser) {
      console.log('❌ No superadmin user found')
      console.log('💡 Create superadmin user with: npx tsx scripts/setup-auth.ts')
      return false
    }
    
    console.log(`✅ Superadmin user found: ${superadminUser.email}`)
    
    // Check employee record
    console.log('\n2. Checking employee record...')
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, role, is_active, user_id')
      .eq('user_id', superadminUser.id)
      .single()
    
    if (employeeError) {
      console.error('❌ Employee record not found:', employeeError.message)
      return false
    }
    
    console.log(`✅ Employee record found: ${employee.full_name} (${employee.role})`)
    console.log(`   Active: ${employee.is_active}`)
    
    if (!employee.is_active) {
      console.log('❌ Employee is not active')
      return false
    }
    
    if (employee.role !== 'superadmin') {
      console.log(`❌ Employee role is ${employee.role}, not superadmin`)
      return false
    }
    
    // Test KPI Config page data requirements
    console.log('\n3. Testing KPI Config data...')
    
    // Check units
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)
    
    if (unitsError) {
      console.error('❌ Units query failed:', unitsError.message)
      return false
    }
    
    if (!units || units.length === 0) {
      console.log('⚠️  No active units found - KPI Config will be empty')
    } else {
      console.log(`✅ Found ${units.length} active unit(s)`)
    }
    
    console.log('\n🎯 Authentication test complete!')
    console.log('\n💡 To test the page manually:')
    console.log('   1. Open: http://localhost:3002/login')
    console.log(`   2. Login with: ${superadminUser.email}`)
    console.log('   3. Navigate to: http://localhost:3002/kpi-config')
    console.log('   4. Page should load with unit selector')
    
    return true
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testAuthAndKPIConfig()
  .then(success => {
    if (success) {
      console.log('\n✅ Authentication and KPI Config test passed!')
      process.exit(0)
    } else {
      console.log('\n❌ Authentication and KPI Config test failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })