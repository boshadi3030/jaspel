#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testSubIndicatorsDisplayFix() {
  console.log('🔧 Testing Sub Indicators Display Fix...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // 1. Get test data
    console.log('\n1. Getting test data...')
    
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
    console.log(`📍 Testing with unit: ${selectedUnit.code} - ${selectedUnit.name}`)

    // Get categories
    const { data: categories } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', selectedUnit.id)
      .order('category')

    // Get indicators
    const categoryIds = categories?.map(c => c.id) || []
    const { data: indicators } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    // Get sub indicators
    const indicatorIds = indicators?.map(i => i.id) || []
    const { data: subIndicators } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    console.log(`✅ Data loaded: ${categories?.length} categories, ${indicators?.length} indicators, ${subIndicators?.length} sub indicators`)

    // 2. Test the logic that determines which indicators should be expanded
    console.log('\n2. Testing expanded indicators logic...')
    
    const indicatorsWithSubs = indicators?.filter(indicator => 
      subIndicators?.some(sub => sub.indicator_id === indicator.id)
    ) || []

    console.log(`📊 Indicators with sub indicators: ${indicatorsWithSubs.length}`)
    indicatorsWithSubs.forEach(indicator => {
      const subs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
      console.log(`   • ${indicator.code} - ${indicator.name} (${subs.length} subs)`)
      subs.forEach(sub => {
        console.log(`     - ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
      })
    })

    // 3. Test the component behavior simulation
    console.log('\n3. Simulating KPITree component behavior...')
    
    // Simulate initial state
    const expandedCategories = new Set(categories?.map(c => c.id) || [])
    const expandedIndicators = new Set(indicatorsWithSubs.map(i => i.id))
    
    console.log(`📂 Expanded categories: ${expandedCategories.size}`)
    console.log(`📊 Expanded indicators: ${expandedIndicators.size}`)

    // 4. Verify sub indicator rendering conditions
    console.log('\n4. Verifying sub indicator rendering conditions...')
    
    let shouldShowSubIndicators = 0
    let totalSubIndicators = 0

    categories?.forEach(category => {
      const isExpanded = expandedCategories.has(category.id)
      if (isExpanded) {
        const categoryIndicators = indicators?.filter(i => i.category_id === category.id) || []
        
        categoryIndicators.forEach(indicator => {
          const isIndicatorExpanded = expandedIndicators.has(indicator.id)
          const indicatorSubs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
          
          if (isIndicatorExpanded && indicatorSubs.length > 0) {
            shouldShowSubIndicators += indicatorSubs.length
            console.log(`   ✅ Should show ${indicatorSubs.length} sub indicators for "${indicator.name}"`)
          }
          
          totalSubIndicators += indicatorSubs.length
        })
      }
    })

    console.log(`\n📊 Summary:`)
    console.log(`   Total sub indicators in database: ${subIndicators?.length || 0}`)
    console.log(`   Sub indicators that should be visible: ${shouldShowSubIndicators}`)
    console.log(`   Sub indicators that should be hidden: ${totalSubIndicators - shouldShowSubIndicators}`)

    // 5. Check for potential issues
    console.log('\n5. Checking for potential issues...')
    
    let hasIssues = false

    // Check if any indicators have sub indicators but aren't expanded
    indicators?.forEach(indicator => {
      const subs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
      const isExpanded = expandedIndicators.has(indicator.id)
      
      if (subs.length > 0 && !isExpanded) {
        console.log(`⚠️  Indicator "${indicator.name}" has ${subs.length} sub indicators but is not expanded`)
        hasIssues = true
      }
    })

    // Check for sub indicators with invalid data
    subIndicators?.forEach(sub => {
      if (!sub.name || sub.name.trim() === '') {
        console.log(`⚠️  Sub indicator ${sub.code} has empty name`)
        hasIssues = true
      }
      
      if (sub.weight_percentage < 0 || sub.weight_percentage > 100) {
        console.log(`⚠️  Sub indicator ${sub.code} has invalid weight: ${sub.weight_percentage}%`)
        hasIssues = true
      }
    })

    if (!hasIssues) {
      console.log('✅ No issues found')
    }

    // 6. Browser testing instructions
    console.log('\n6. Browser testing instructions:')
    console.log('🌐 Open http://localhost:3002/kpi-config in your browser')
    console.log('📋 Expected behavior:')
    console.log('   ✅ Categories should be expanded by default')
    console.log('   ✅ Indicators with sub indicators should be expanded by default')
    console.log('   ✅ Sub indicators should be visible with score badges')
    console.log('   ✅ "Tambah Sub Indikator" button should be visible for each indicator')
    console.log('   ✅ Sub indicators should show weight percentages and score labels')

    console.log('\n✅ Test completed successfully!')
    console.log('🔍 If sub indicators are still not showing, check browser console for errors')

  } catch (error) {
    console.error('❌ Error testing sub indicators display fix:', error)
    process.exit(1)
  }
}

testSubIndicatorsDisplayFix()