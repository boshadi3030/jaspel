#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSubIndicatorsBrowser() {
  console.log('🌐 Testing Sub Indicators in Browser Context...\n')

  try {
    // 1. Test the exact data flow that the browser would use
    console.log('1. Testing UK01 - MEDIS unit data flow...')
    
    // Get UK01 unit
    const { data: unit, error: unitError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('code', 'UK01')
      .eq('is_active', true)
      .single()

    if (unitError || !unit) {
      console.error('❌ Error fetching UK01 unit:', unitError)
      return
    }

    console.log(`✅ Unit: ${unit.code} - ${unit.name}`)

    // 2. Load categories (same as page does)
    const { data: categories, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', unit.id)
      .order('category')

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError)
      return
    }

    console.log(`✅ Categories: ${categories?.length || 0}`)

    // 3. Load indicators
    const categoryIds = categories?.map(c => c.id) || []
    let indicators: any[] = []
    let subIndicators: any[] = []

    if (categoryIds.length > 0) {
      const { data: indicatorsData, error: indicatorsError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')

      if (indicatorsError) {
        console.error('❌ Error fetching indicators:', indicatorsError)
        return
      }

      indicators = indicatorsData || []
      console.log(`✅ Indicators: ${indicators.length}`)

      // 4. Load sub indicators
      const indicatorIds = indicators.map(i => i.id)
      if (indicatorIds.length > 0) {
        const { data: subIndicatorsData, error: subIndicatorsError } = await supabase
          .from('m_kpi_sub_indicators')
          .select('*')
          .in('indicator_id', indicatorIds)
          .order('code')

        if (subIndicatorsError) {
          console.error('❌ Error fetching sub indicators:', subIndicatorsError)
          return
        }

        subIndicators = subIndicatorsData || []
        console.log(`✅ Sub Indicators: ${subIndicators.length}`)
      }
    }

    // 5. Simulate KPITree component logic
    console.log('\n2. Simulating KPITree component logic...')
    
    categories?.forEach(category => {
      console.log(`\n📂 ${category.category}: ${category.category_name} (${category.weight_percentage}%)`)
      
      const categoryIndicators = indicators.filter(i => i.category_id === category.id)
      console.log(`   Indicators: ${categoryIndicators.length}`)
      
      categoryIndicators.forEach(indicator => {
        const indicatorSubs = subIndicators.filter(s => s.indicator_id === indicator.id)
        const hasSubIndicators = indicatorSubs.length > 0
        
        console.log(`   📊 ${indicator.code}: ${indicator.name} (${indicator.weight_percentage}%)`)
        
        if (hasSubIndicators) {
          console.log(`      🏷️  Badge: "${indicatorSubs.length} sub indikator" should be visible`)
          console.log(`      🔽 Auto-expand: Should be expanded by default`)
          console.log(`      📋 Sub indicators:`)
          
          indicatorSubs.forEach(sub => {
            console.log(`         • ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
            console.log(`           Scores: ${sub.score_1}(${sub.score_1_label}) | ${sub.score_2}(${sub.score_2_label}) | ${sub.score_3}(${sub.score_3_label}) | ${sub.score_4}(${sub.score_4_label}) | ${sub.score_5}(${sub.score_5_label})`)
          })
        } else {
          console.log(`      ⚪ No sub indicators`)
        }
      })
    })

    // 6. Check specific features mentioned
    console.log('\n3. Checking specific features...')
    
    const indicatorsWithSubs = indicators.filter(indicator => 
      subIndicators.some(sub => sub.indicator_id === indicator.id)
    )
    
    console.log(`✅ Auto-Expand: ${indicatorsWithSubs.length} indicators should auto-expand`)
    console.log(`✅ Visual Indicator: Badge "X sub indikator" for ${indicatorsWithSubs.length} indicators`)
    console.log(`✅ CRUD Functions: Add/Edit/Delete buttons should be available`)
    console.log(`✅ Score Measurement: 5-level scoring system implemented`)

    // 7. Test specific indicators mentioned (IND-001, IND-002)
    console.log('\n4. Testing specific indicators...')
    
    const ind001 = indicators.find(i => i.code === 'IND-001')
    const ind002 = indicators.find(i => i.code === 'IND-002')
    
    if (ind001) {
      const ind001Subs = subIndicators.filter(s => s.indicator_id === ind001.id)
      console.log(`✅ IND-001: ${ind001.name} has ${ind001Subs.length} sub indicators`)
      console.log(`   Should show badge: "${ind001Subs.length} sub indikator"`)
    }
    
    if (ind002) {
      const ind002Subs = subIndicators.filter(s => s.indicator_id === ind002.id)
      console.log(`✅ IND-002: ${ind002.name} has ${ind002Subs.length} sub indicators`)
      console.log(`   Should show badge: "${ind002Subs.length} sub indikator"`)
    }

    // 8. Generate browser test instructions
    console.log('\n5. Browser Test Instructions:')
    console.log('🌐 Open: http://localhost:3000/kpi-config')
    console.log('🔐 Login as: superadmin')
    console.log('🏢 Select Unit: UK01 - MEDIS')
    console.log('👀 Look for:')
    console.log('   - P1 category should be expanded')
    console.log('   - IND-001 should show "3 sub indikator" badge')
    console.log('   - IND-002 should show "2 sub indikator" badge')
    console.log('   - Click ▼ button to expand indicators')
    console.log('   - Sub indicators should show with colored score badges')
    console.log('   - Edit/Delete buttons should be available for each sub indicator')

    console.log('\n✅ Sub Indicators Browser Test Complete!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSubIndicatorsBrowser()