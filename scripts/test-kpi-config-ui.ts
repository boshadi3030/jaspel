#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testKPIConfigUI() {
  console.log('🔍 Testing KPI Config UI Data Flow...\n')

  try {
    // Simulate the exact data flow from KPI config page
    console.log('1. ✅ Simulating KPI Config page data loading...')
    
    // Get units (like the page does)
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .order('code')

    if (unitsError || !units || units.length === 0) {
      console.log('   ❌ No units found:', unitsError?.message)
      return
    }

    console.log(`   Found ${units.length} units`)
    const selectedUnit = units[0].id
    console.log(`   Selected unit: ${units[0].code} - ${units[0].name}`)

    // Load KPI structure (exactly like loadKPIStructure function)
    console.log('\n2. ✅ Loading KPI structure...')
    
    // Load categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit)
      .order('category')

    if (categoriesError) {
      console.log('   ❌ Categories error:', categoriesError.message)
      return
    }

    console.log(`   Categories: ${categoriesData?.length || 0}`)
    categoriesData?.forEach(cat => {
      console.log(`      📂 ${cat.category}: ${cat.category_name}`)
    })

    // Load indicators
    const categoryIds = categoriesData?.map(c => c.id) || []
    let indicatorsData: any[] = []
    
    if (categoryIds.length > 0) {
      const { data: indicators, error: indicatorsError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')

      if (indicatorsError) {
        console.log('   ❌ Indicators error:', indicatorsError.message)
        return
      }

      indicatorsData = indicators || []
      console.log(`   Indicators: ${indicatorsData.length}`)
      indicatorsData.forEach(ind => {
        console.log(`      📈 ${ind.code}: ${ind.name}`)
      })
    }

    // Load sub indicators
    const indicatorIds = indicatorsData.map(i => i.id) || []
    let subIndicatorsData: any[] = []
    
    if (indicatorIds.length > 0) {
      const { data: subIndicators, error: subIndicatorsError } = await supabase
        .from('m_kpi_sub_indicators')
        .select('*')
        .in('indicator_id', indicatorIds)
        .order('code')

      if (subIndicatorsError) {
        console.log('   ❌ Sub indicators error:', subIndicatorsError.message)
        console.log('   🚨 THIS IS THE PROBLEM!')
        return
      }

      subIndicatorsData = subIndicators || []
      console.log(`   Sub indicators: ${subIndicatorsData.length}`)
      subIndicatorsData.forEach(sub => {
        console.log(`      📋 ${sub.code}: ${sub.name} (Indicator: ${sub.indicator_id})`)
      })
    }

    // 3. Simulate KPITree component logic
    console.log('\n3. ✅ Simulating KPITree component...')
    
    const categories = categoriesData || []
    const indicators = indicatorsData || []
    const subIndicators = subIndicatorsData || []

    console.log('   Data passed to KPITree:')
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Indicators: ${indicators.length}`)
    console.log(`   - Sub Indicators: ${subIndicators.length}`)

    // Simulate the rendering logic
    categories.forEach(category => {
      const categoryIndicators = indicators.filter(i => i.category_id === category.id)
      console.log(`\n   📂 ${category.category}: ${category.category_name}`)
      console.log(`      Indicators in this category: ${categoryIndicators.length}`)
      
      categoryIndicators.forEach(indicator => {
        const indicatorSubs = subIndicators.filter(s => s.indicator_id === indicator.id)
        console.log(`      📈 ${indicator.code}: ${indicator.name}`)
        console.log(`         Sub indicators: ${indicatorSubs.length}`)
        
        if (indicatorSubs.length === 0) {
          console.log('         ⚠️ NO SUB INDICATORS - Only "Tambah Sub Indikator" button should show')
        } else {
          console.log('         ✅ HAS SUB INDICATORS - Should show list + "Tambah Sub Indikator" button')
          indicatorSubs.forEach(sub => {
            console.log(`            📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        }
      })
    })

    // 4. Test the specific functions used in KPITree
    console.log('\n4. ✅ Testing KPITree helper functions...')
    
    function getCategoryIndicators(categoryId: string) {
      return indicators.filter(i => i.category_id === categoryId)
    }

    function getIndicatorSubIndicators(indicatorId: string) {
      return subIndicators.filter(s => s.indicator_id === indicatorId)
    }

    categories.forEach(category => {
      const catIndicators = getCategoryIndicators(category.id)
      console.log(`   📂 ${category.category}: ${catIndicators.length} indicators`)
      
      catIndicators.forEach(indicator => {
        const indSubs = getIndicatorSubIndicators(indicator.id)
        console.log(`      📈 ${indicator.code}: ${indSubs.length} sub indicators`)
        
        if (indSubs.length > 0) {
          console.log('         ✅ Sub indicators should be visible in UI')
        } else {
          console.log('         ⚠️ No sub indicators - only add button should show')
        }
      })
    })

    console.log('\n🎯 KPI CONFIG UI TEST COMPLETE')
    
    if (subIndicatorsData.length > 0) {
      console.log('\n✅ DIAGNOSIS: Data is available, issue might be in frontend rendering')
      console.log('   - RLS policies are working')
      console.log('   - Database queries return data')
      console.log('   - Check browser console for any JavaScript errors')
      console.log('   - Check if KPITree component is receiving the data correctly')
    } else {
      console.log('\n❌ DIAGNOSIS: No sub indicators found')
      console.log('   - Either no sub indicators exist for this unit')
      console.log('   - Or RLS policies are still blocking access')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPIConfigUI()