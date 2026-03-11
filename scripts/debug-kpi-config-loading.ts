#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugKPIConfigLoading() {
  console.log('🔍 Debugging KPI Config Loading Issue...\n')

  try {
    // 1. Get first unit
    console.log('1. ✅ Getting test unit...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitsError || !units || units.length === 0) {
      console.log('   ❌ No units found:', unitsError?.message)
      return
    }

    const selectedUnit = units[0]
    console.log(`   Selected unit: ${selectedUnit.code} - ${selectedUnit.name}`)

    // 2. Simulate the exact loading sequence from KPI config page
    console.log('\n2. ✅ Loading categories...')
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit.id)
      .order('category')

    if (categoriesError) {
      console.log('   ❌ Categories error:', categoriesError.message)
      return
    }

    console.log(`   Found ${categoriesData?.length || 0} categories`)
    categoriesData?.forEach(cat => {
      console.log(`      📂 ${cat.category}: ${cat.category_name} (${cat.weight_percentage}%)`)
    })

    // 3. Load indicators
    console.log('\n3. ✅ Loading indicators...')
    const categoryIds = categoriesData?.map(c => c.id) || []
    
    if (categoryIds.length === 0) {
      console.log('   ⚠️ No category IDs to query indicators')
      return
    }

    const { data: indicatorsData, error: indicatorsError } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    if (indicatorsError) {
      console.log('   ❌ Indicators error:', indicatorsError.message)
      return
    }

    console.log(`   Found ${indicatorsData?.length || 0} indicators`)
    indicatorsData?.forEach(ind => {
      console.log(`      📈 ${ind.code}: ${ind.name} (${ind.weight_percentage}%)`)
    })

    // 4. Load sub indicators - THIS IS THE CRITICAL STEP
    console.log('\n4. ✅ Loading sub indicators...')
    const indicatorIds = indicatorsData?.map(i => i.id) || []
    
    if (indicatorIds.length === 0) {
      console.log('   ⚠️ No indicator IDs to query sub indicators')
      return
    }

    console.log(`   Querying sub indicators for ${indicatorIds.length} indicators:`)
    indicatorIds.forEach(id => console.log(`      - ${id}`))

    const { data: subIndicatorsData, error: subIndicatorsError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    if (subIndicatorsError) {
      console.log('   ❌ Sub indicators error:', subIndicatorsError.message)
      console.log('   Error details:', JSON.stringify(subIndicatorsError, null, 2))
      return
    }

    console.log(`   ✅ Found ${subIndicatorsData?.length || 0} sub indicators`)
    
    if (subIndicatorsData && subIndicatorsData.length > 0) {
      // Group by indicator
      const subsByIndicator = subIndicatorsData.reduce((acc, sub) => {
        if (!acc[sub.indicator_id]) acc[sub.indicator_id] = []
        acc[sub.indicator_id].push(sub)
        return acc
      }, {} as Record<string, any[]>)

      Object.entries(subsByIndicator).forEach(([indicatorId, subs]) => {
        const indicator = indicatorsData?.find(i => i.id === indicatorId)
        console.log(`      📈 ${indicator?.code || indicatorId}: ${subs.length} sub indicators`)
        subs.forEach(sub => {
          console.log(`         📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        })
      })
    } else {
      console.log('   ⚠️ NO SUB INDICATORS FOUND!')
      console.log('   This explains why they are not showing in the UI')
      
      // Let's check if there are any sub indicators at all
      console.log('\n   🔍 Checking if any sub indicators exist in database...')
      const { data: allSubs, error: allSubsError } = await supabase
        .from('m_kpi_sub_indicators')
        .select('*')
        .limit(10)

      if (allSubsError) {
        console.log('      ❌ Error checking all sub indicators:', allSubsError.message)
      } else {
        console.log(`      Found ${allSubs?.length || 0} total sub indicators in database`)
        if (allSubs && allSubs.length > 0) {
          console.log('      Sample sub indicators:')
          allSubs.slice(0, 5).forEach(sub => {
            console.log(`         📋 ${sub.code}: ${sub.name} (Indicator: ${sub.indicator_id})`)
          })
          
          // Check if any of these belong to our indicators
          const matchingSubs = allSubs.filter(sub => indicatorIds.includes(sub.indicator_id))
          console.log(`      ${matchingSubs.length} sub indicators match our indicator IDs`)
        }
      }
    }

    // 5. Test the KPITree component data structure
    console.log('\n5. ✅ Testing KPITree data structure...')
    
    const categories = categoriesData || []
    const indicators = indicatorsData || []
    const subIndicators = subIndicatorsData || []

    console.log('   Data summary:')
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Indicators: ${indicators.length}`)
    console.log(`   - Sub Indicators: ${subIndicators.length}`)

    // Simulate the KPITree logic
    categories.forEach(category => {
      const categoryIndicators = indicators.filter(i => i.category_id === category.id)
      console.log(`   📂 ${category.category}: ${categoryIndicators.length} indicators`)
      
      categoryIndicators.forEach(indicator => {
        const indicatorSubs = subIndicators.filter(s => s.indicator_id === indicator.id)
        console.log(`      📈 ${indicator.code}: ${indicatorSubs.length} sub indicators`)
        
        if (indicatorSubs.length === 0) {
          console.log('         ⚠️ NO SUB INDICATORS - This is why the UI shows empty!')
        } else {
          indicatorSubs.forEach(sub => {
            console.log(`         📋 ${sub.code}: ${sub.name}`)
          })
        }
      })
    })

    console.log('\n🎯 DEBUG COMPLETE')
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugKPIConfigLoading()