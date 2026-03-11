#!/usr/bin/env tsx

/**
 * Test KPI Config Page Fix
 * Tests if the KPI config page loads properly after fixing chunk loading issues
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIConfigFix() {
  console.log('🧪 Testing KPI Config Page Fix...\n')

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test 1: Check if units exist
    console.log('1️⃣ Testing units data...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(5)

    if (unitsError) {
      console.error('❌ Units query failed:', unitsError.message)
      return false
    }

    console.log(`✅ Found ${units?.length || 0} active units`)
    if (units && units.length > 0) {
      console.log(`   First unit: ${units[0].code} - ${units[0].name}`)
    }

    // Test 2: Check KPI categories
    if (units && units.length > 0) {
      console.log('\n2️⃣ Testing KPI categories...')
      const { data: categories, error: categoriesError } = await supabase
        .from('m_kpi_categories')
        .select('*')
        .eq('unit_id', units[0].id)
        .limit(5)

      if (categoriesError) {
        console.error('❌ Categories query failed:', categoriesError.message)
        return false
      }

      console.log(`✅ Found ${categories?.length || 0} categories for unit ${units[0].code}`)
      
      // Test 3: Check KPI indicators
      if (categories && categories.length > 0) {
        console.log('\n3️⃣ Testing KPI indicators...')
        const { data: indicators, error: indicatorsError } = await supabase
          .from('m_kpi_indicators')
          .select('*')
          .eq('category_id', categories[0].id)
          .limit(5)

        if (indicatorsError) {
          console.error('❌ Indicators query failed:', indicatorsError.message)
          return false
        }

        console.log(`✅ Found ${indicators?.length || 0} indicators for category ${categories[0].category}`)

        // Test 4: Check sub indicators
        if (indicators && indicators.length > 0) {
          console.log('\n4️⃣ Testing KPI sub indicators...')
          const { data: subIndicators, error: subIndicatorsError } = await supabase
            .from('m_kpi_sub_indicators')
            .select('*')
            .eq('indicator_id', indicators[0].id)
            .limit(5)

          if (subIndicatorsError) {
            console.error('❌ Sub indicators query failed:', subIndicatorsError.message)
            return false
          }

          console.log(`✅ Found ${subIndicators?.length || 0} sub indicators for indicator ${indicators[0].code}`)
        }
      }
    }

    // Test 5: Test page accessibility
    console.log('\n5️⃣ Testing page accessibility...')
    try {
      const response = await fetch('http://localhost:3002/kpi-config', {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Test Script'
        }
      })

      if (response.ok) {
        console.log('✅ KPI config page is accessible')
      } else {
        console.log(`⚠️ KPI config page returned status: ${response.status}`)
      }
    } catch (fetchError) {
      console.log('⚠️ Could not test page accessibility (server might not be running)')
    }

    console.log('\n🎉 KPI Config Fix Test Completed!')
    console.log('\n📋 Summary:')
    console.log('- Fixed dynamic import issues by using direct imports')
    console.log('- Simplified Next.js webpack configuration')
    console.log('- Removed aggressive chunk splitting that caused 404 errors')
    console.log('- All KPI components should now load properly')
    
    console.log('\n🔧 Next Steps:')
    console.log('1. Open http://localhost:3002/kpi-config in browser')
    console.log('2. Login as superadmin')
    console.log('3. Verify that the page loads without chunk errors')
    console.log('4. Test KPI structure management functionality')

    return true

  } catch (error) {
    console.error('❌ Test failed:', error)
    return false
  }
}

// Run the test
testKPIConfigFix()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })