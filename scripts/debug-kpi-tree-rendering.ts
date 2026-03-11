#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugKPITreeRendering() {
  console.log('🔍 Debugging KPI Tree Rendering...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Test the exact same query that the frontend uses
    console.log('\n1. Testing frontend queries...')
    
    // Get first unit
    const { data: units } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .order('code')
      .limit(1)

    if (!units || units.length === 0) {
      console.log('❌ No units found')
      return
    }

    const selectedUnit = units[0]
    console.log(`📍 Using unit: ${selectedUnit.code} - ${selectedUnit.name}`)

    // Test categories query (same as frontend)
    const { data: categories, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit.id)
      .order('category')

    if (categoriesError) {
      console.log('❌ Categories error:', categoriesError)
      return
    }
    console.log(`✅ Categories: ${categories?.length || 0}`)

    // Test indicators query (same as frontend)
    const categoryIds = categories?.map(c => c.id) || []
    if (categoryIds.length === 0) {
      console.log('❌ No category IDs')
      return
    }

    const { data: indicators, error: indicatorsError } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    if (indicatorsError) {
      console.log('❌ Indicators error:', indicatorsError)
      return
    }
    console.log(`✅ Indicators: ${indicators?.length || 0}`)

    // Test sub indicators query (same as frontend)
    const indicatorIds = indicators?.map(i => i.id) || []
    if (indicatorIds.length === 0) {
      console.log('❌ No indicator IDs')
      return
    }

    const { data: subIndicators, error: subIndicatorsError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    if (subIndicatorsError) {
      console.log('❌ Sub indicators error:', subIndicatorsError)
      return
    }
    console.log(`✅ Sub indicators: ${subIndicators?.length || 0}`)

    // Test the exact data structure that KPITree component expects
    console.log('\n2. Testing KPITree data structure...')
    
    categories?.forEach(category => {
      console.log(`\n📂 Category: ${category.category} - ${category.category_name}`)
      
      const categoryIndicators = indicators?.filter(i => i.category_id === category.id) || []
      console.log(`   Indicators count: ${categoryIndicators.length}`)
      
      categoryIndicators.forEach(indicator => {
        console.log(`   📊 Indicator: ${indicator.code} - ${indicator.name}`)
        
        const indicatorSubs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
        console.log(`      Sub indicators count: ${indicatorSubs.length}`)
        
        if (indicatorSubs.length > 0) {
          indicatorSubs.forEach(sub => {
            console.log(`      📋 Sub: ${sub.code} - ${sub.name} (${sub.weight_percentage}%)`)
          })
        } else {
          console.log(`      ⚠️  No sub indicators for this indicator`)
        }
      })
    })

    // Test with superadmin auth context
    console.log('\n3. Testing with superadmin context...')
    
    // Create a test user session (simulate superadmin)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@jaspel.com',
      password: 'superadmin123'
    })

    if (authError) {
      console.log('⚠️  Auth error (expected):', authError.message)
      console.log('   This is normal for service role key testing')
    } else {
      console.log('✅ Auth successful')
    }

    // Test RLS with authenticated context
    console.log('\n4. Testing RLS policies...')
    
    const { data: rlsTest, error: rlsError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('id, code, name, indicator_id')
      .limit(5)

    if (rlsError) {
      console.log('❌ RLS test error:', rlsError)
    } else {
      console.log(`✅ RLS test passed: ${rlsTest?.length || 0} records`)
    }

    console.log('\n✅ Debug completed!')
    console.log('\n🔍 Next steps:')
    console.log('1. Check browser console for JavaScript errors')
    console.log('2. Verify KPITree component is receiving the data correctly')
    console.log('3. Check if expandedIndicators state is working')
    console.log('4. Verify sub indicator rendering logic in KPITree.tsx')

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugKPITreeRendering()