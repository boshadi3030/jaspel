#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIConfigSubIndicators() {
  console.log('🔍 Testing KPI Config Sub Indicators Display...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Get units
    console.log('\n1. Getting units...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .order('code')

    if (unitsError) throw unitsError
    console.log(`✅ Found ${units?.length || 0} units`)

    if (!units || units.length === 0) {
      console.log('❌ No units found')
      return
    }

    const selectedUnit = units[0]
    console.log(`📍 Testing with unit: ${selectedUnit.code} - ${selectedUnit.name}`)

    // 2. Get categories for the unit
    console.log('\n2. Getting categories...')
    const { data: categories, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit.id)
      .order('category')

    if (categoriesError) throw categoriesError
    console.log(`✅ Found ${categories?.length || 0} categories`)

    if (!categories || categories.length === 0) {
      console.log('❌ No categories found for this unit')
      return
    }

    // 3. Get indicators for the categories
    console.log('\n3. Getting indicators...')
    const categoryIds = categories.map(c => c.id)
    const { data: indicators, error: indicatorsError } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    if (indicatorsError) throw indicatorsError
    console.log(`✅ Found ${indicators?.length || 0} indicators`)

    if (!indicators || indicators.length === 0) {
      console.log('❌ No indicators found for these categories')
      return
    }

    // 4. Get sub indicators for the indicators
    console.log('\n4. Getting sub indicators...')
    const indicatorIds = indicators.map(i => i.id)
    const { data: subIndicators, error: subIndicatorsError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    if (subIndicatorsError) throw subIndicatorsError
    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators`)

    // 5. Display structure
    console.log('\n📊 KPI Structure:')
    categories.forEach(category => {
      console.log(`\n🏷️  ${category.category} - ${category.category_name} (${category.weight_percentage}%)`)
      
      const categoryIndicators = indicators.filter(i => i.category_id === category.id)
      categoryIndicators.forEach(indicator => {
        console.log(`  📈 ${indicator.code} - ${indicator.name} (${indicator.weight_percentage}%)`)
        
        const indicatorSubs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
        if (indicatorSubs.length > 0) {
          console.log(`    📋 Sub Indicators (${indicatorSubs.length}):`)
          indicatorSubs.forEach(sub => {
            console.log(`      • ${sub.code} - ${sub.name} (${sub.weight_percentage}%)`)
            console.log(`        Scores: ${sub.score_1}(${sub.score_1_label}) | ${sub.score_2}(${sub.score_2_label}) | ${sub.score_3}(${sub.score_3_label}) | ${sub.score_4}(${sub.score_4_label}) | ${sub.score_5}(${sub.score_5_label})`)
          })
        } else {
          console.log(`    ⚠️  No sub indicators found`)
        }
      })
    })

    // 6. Test browser access
    console.log('\n🌐 Testing browser access...')
    const testUrl = 'http://localhost:3002/kpi-config'
    console.log(`📍 URL: ${testUrl}`)
    console.log('🔍 Please check the browser to see if sub indicators are displayed correctly')
    console.log('   - Sub indicators should appear under each indicator when expanded')
    console.log('   - "Tambah Sub Indikator" button should be visible for each indicator')
    console.log('   - Score badges should be displayed for each sub indicator')

    // 7. Check if there are any issues with the data structure
    console.log('\n🔍 Data validation:')
    let hasIssues = false

    indicators.forEach(indicator => {
      const subs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
      if (subs.length === 0) {
        console.log(`⚠️  Indicator "${indicator.name}" has no sub indicators`)
      } else {
        const totalWeight = subs.reduce((sum, s) => sum + Number(s.weight_percentage), 0)
        if (Math.abs(totalWeight - 100) > 0.01 && totalWeight > 0) {
          console.log(`⚠️  Indicator "${indicator.name}" sub indicators weight sum: ${totalWeight}% (should be 100%)`)
          hasIssues = true
        }
      }
    })

    if (!hasIssues) {
      console.log('✅ No data structure issues found')
    }

    console.log('\n✅ Test completed successfully!')
    console.log('🔍 If sub indicators are not showing in the browser, the issue might be in the frontend component rendering')

  } catch (error) {
    console.error('❌ Error testing KPI config:', error)
    process.exit(1)
  }
}

testKPIConfigSubIndicators()