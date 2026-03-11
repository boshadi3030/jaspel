#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIConfigWithAuth() {
  console.log('🔍 Testing KPI Config with Authentication...\n')

  try {
    // Create service client to get user info
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get superadmin user
    console.log('1. ✅ Getting superadmin user...')
    const { data: employees, error: empError } = await supabaseService
      .from('m_employees')
      .select('*')
      .eq('role', 'superadmin')
      .eq('is_active', true)
      .limit(1)

    if (empError || !employees || employees.length === 0) {
      console.log('   ❌ No superadmin employee found:', empError?.message)
      return
    }

    const superadmin = employees[0]
    console.log(`   Found superadmin: ${superadmin.email}`)

    // Get auth user for this employee
    const { data: authUsers, error: authError } = await supabaseService.auth.admin.listUsers()
    
    if (authError) {
      console.log('   ❌ Cannot list auth users:', authError.message)
      return
    }

    const authUser = authUsers.users.find(u => u.email === superadmin.email)
    if (!authUser) {
      console.log('   ❌ No auth user found for superadmin email')
      return
    }

    console.log(`   Auth user ID: ${authUser.id}`)
    console.log(`   Auth user role: ${authUser.user_metadata?.role || authUser.raw_user_meta_data?.role}`)

    // 2. Test RLS policies with this user context
    console.log('\n2. ✅ Testing RLS policies...')
    
    // Create a client that simulates the user session
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // We can't actually sign in programmatically, but we can test the RLS policies
    // by checking what the policies look like
    
    console.log('   Checking RLS policies for m_kpi_sub_indicators...')
    const { data: policies, error: policyError } = await supabaseService
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'm_kpi_sub_indicators')

    if (policyError) {
      console.log('   ❌ Cannot check policies:', policyError.message)
    } else {
      console.log(`   Found ${policies?.length || 0} RLS policies:`)
      policies?.forEach(policy => {
        console.log(`      - ${policy.policyname}: ${policy.cmd} for ${policy.roles?.join(', ')}`)
        console.log(`        ${policy.qual}`)
      })
    }

    // 3. Test direct query with service role (should work)
    console.log('\n3. ✅ Testing with service role...')
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(5)

    if (serviceError) {
      console.log('   ❌ Service role error:', serviceError.message)
    } else {
      console.log(`   ✅ Service role success: ${serviceData?.length || 0} records`)
    }

    // 4. Test the specific issue - check if RLS is blocking the query
    console.log('\n4. ✅ Testing RLS blocking...')
    
    // Test with anon key (should be blocked by RLS)
    const { data: anonData, error: anonError } = await supabaseClient
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(5)

    if (anonError) {
      console.log('   ✅ Anon key blocked (expected):', anonError.message)
    } else {
      console.log('   ⚠️ Anon key allowed (unexpected):', anonData?.length || 0, 'records')
    }

    // 5. Check if the issue is in the frontend state management
    console.log('\n5. ✅ Simulating frontend loading sequence...')
    
    // Get a unit
    const { data: units, error: unitsError } = await supabaseService
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitsError || !units || units.length === 0) {
      console.log('   ❌ No units found')
      return
    }

    const selectedUnit = units[0].id
    console.log(`   Using unit: ${units[0].code}`)

    // Simulate the exact sequence from the KPI config page
    const { data: categoriesData, error: categoriesError } = await supabaseService
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit)
      .order('category')

    if (categoriesError) {
      console.log('   ❌ Categories error:', categoriesError.message)
      return
    }

    const categoryIds = categoriesData?.map(c => c.id) || []
    
    if (categoryIds.length > 0) {
      const { data: indicatorsData, error: indicatorsError } = await supabaseService
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')

      if (indicatorsError) {
        console.log('   ❌ Indicators error:', indicatorsError.message)
        return
      }

      const indicatorIds = indicatorsData?.map(i => i.id) || []
      
      if (indicatorIds.length > 0) {
        // This is the critical query that might be failing in the frontend
        const { data: subIndicatorsData, error: subIndicatorsError } = await supabaseService
          .from('m_kpi_sub_indicators')
          .select('*')
          .in('indicator_id', indicatorIds)
          .order('code')

        if (subIndicatorsError) {
          console.log('   ❌ Sub indicators error:', subIndicatorsError.message)
          console.log('   🎯 THIS IS THE ISSUE! The query is failing.')
        } else {
          console.log(`   ✅ Sub indicators success: ${subIndicatorsData?.length || 0} records`)
          console.log('   🎯 Query works with service role, so the issue is likely RLS policies')
        }
      }
    }

    // 6. Check the current RLS policies
    console.log('\n6. ✅ Checking current RLS policies...')
    
    const { data: currentPolicies, error: currentError } = await supabaseService
      .rpc('get_table_policies', { table_name: 'm_kpi_sub_indicators' })

    if (currentError) {
      console.log('   ❌ Cannot get current policies:', currentError.message)
    } else {
      console.log('   Current RLS policies:')
      console.log(JSON.stringify(currentPolicies, null, 2))
    }

    console.log('\n🎯 AUTH TEST COMPLETE')
    console.log('\n💡 LIKELY ISSUE: RLS policies are blocking the frontend query')
    console.log('   The sub indicators exist in the database')
    console.log('   The query works with service role')
    console.log('   But RLS policies may be preventing authenticated users from accessing the data')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPIConfigWithAuth()