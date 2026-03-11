#!/usr/bin/env tsx

/**
 * Test KPI Config page with the correct superadmin user
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIConfigWithCorrectUser() {
  console.log('🧪 Testing KPI Config with correct superadmin user...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Get the working superadmin user
    const { data: employee, error: employeeError } = await supabase
      .from('m_employees')
      .select('id, full_name, role, is_active, user_id')
      .eq('role', 'superadmin')
      .eq('is_active', true)
      .single()
    
    if (employeeError) {
      console.error('❌ No active superadmin employee found:', employeeError.message)
      return false
    }
    
    console.log(`✅ Found active superadmin: ${employee.full_name}`)
    console.log(`   User ID: ${employee.user_id}`)
    
    // Get the corresponding auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(employee.user_id)
    
    if (authError) {
      console.error('❌ Auth user not found:', authError.message)
      return false
    }
    
    console.log(`✅ Auth user: ${authUser.user.email}`)
    console.log(`   Role in metadata: ${authUser.user.user_metadata?.role}`)
    
    // Test KPI Config data access
    console.log('\n📊 Testing KPI Config data access...')
    
    // Test units query (same as the page does)
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .order('code')
    
    if (unitsError) {
      console.error('❌ Units query failed:', unitsError.message)
      return false
    }
    
    console.log(`✅ Units query successful: ${units?.length || 0} units`)
    
    if (units && units.length > 0) {
      const firstUnit = units[0]
      console.log(`   Testing with unit: ${firstUnit.code} - ${firstUnit.name}`)
      
      // Test KPI categories for first unit
      const { data: categories, error: categoriesError } = await supabase
        .from('m_kpi_categories')
        .select('*')
        .eq('unit_id', firstUnit.id)
        .order('category')
      
      if (categoriesError) {
        console.error('❌ Categories query failed:', categoriesError.message)
        return false
      }
      
      console.log(`✅ Categories query successful: ${categories?.length || 0} categories`)
      
      if (categories && categories.length > 0) {
        // Test indicators
        const categoryIds = categories.map(c => c.id)
        const { data: indicators, error: indicatorsError } = await supabase
          .from('m_kpi_indicators')
          .select('*')
          .in('category_id', categoryIds)
          .order('code')
        
        if (indicatorsError) {
          console.error('❌ Indicators query failed:', indicatorsError.message)
          return false
        }
        
        console.log(`✅ Indicators query successful: ${indicators?.length || 0} indicators`)
        
        if (indicators && indicators.length > 0) {
          // Test sub indicators
          const indicatorIds = indicators.map(i => i.id)
          const { data: subIndicators, error: subIndicatorsError } = await supabase
            .from('m_kpi_sub_indicators')
            .select('*')
            .in('indicator_id', indicatorIds)
            .order('code')
          
          if (subIndicatorsError) {
            console.error('❌ Sub indicators query failed:', subIndicatorsError.message)
            return false
          }
          
          console.log(`✅ Sub indicators query successful: ${subIndicators?.length || 0} sub indicators`)
        }
      }
    }
    
    console.log('\n🎯 All KPI Config queries successful!')
    console.log('\n💡 To test the page manually:')
    console.log('   1. Open: http://localhost:3002/login')
    console.log(`   2. Login with: ${authUser.user.email}`)
    console.log('   3. Navigate to: http://localhost:3002/kpi-config')
    console.log('   4. Page should load with unit selector and KPI tree')
    
    return true
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run the test
testKPIConfigWithCorrectUser()
  .then(success => {
    if (success) {
      console.log('\n✅ KPI Config test with correct user passed!')
      process.exit(0)
    } else {
      console.log('\n❌ KPI Config test with correct user failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  })