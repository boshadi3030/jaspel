#!/usr/bin/env tsx

/**
 * Test script untuk memeriksa apakah sub indikator dimuat dengan benar di frontend
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFrontendData() {
  console.log('🧪 Testing Frontend Sub Indicators Data Loading...\n')

  try {
    // 1. Get test unit
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitsError) throw unitsError
    if (!units || units.length === 0) {
      console.log('❌ No active units found')
      return
    }

    const testUnit = units[0]
    console.log(`📋 Using test unit: ${testUnit.code} - ${testUnit.name}`)

    // 2. Simulate frontend data loading sequence
    console.log('\n🔄 Simulating frontend data loading...')

    // Load categories (like in KPIConfigPage)
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', testUnit.id)
      .order('category')

    if (categoriesError) throw categoriesError
    console.log(`✅ Categories loaded: ${categoriesData?.length || 0}`)

    if (!categoriesData || categoriesData.length === 0) {
      console.log('⚠️  No categories found for this unit')
      return
    }

    // Load indicators
    const categoryIds = categoriesData.map(c => c.id)
    const { data: indicatorsData, error: indicatorsError } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    if (indicatorsError) throw indicatorsError
    console.log(`✅ Indicators loaded: ${indicatorsData?.length || 0}`)

    if (!indicatorsData || indicatorsData.length === 0) {
      console.log('⚠️  No indicators found')
      return
    }

    // Load sub indicators
    const indicatorIds = indicatorsData.map(i => i.id)
    const { data: subIndicatorsData, error: subIndicatorsError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    if (subIndicatorsError) throw subIndicatorsError
    console.log(`✅ Sub indicators loaded: ${subIndicatorsData?.length || 0}`)

    // 3. Analyze the data structure
    console.log('\n📊 Data Structure Analysis:')
    
    for (const category of categoriesData) {
      const categoryIndicators = indicatorsData.filter(i => i.category_id === category.id)
      console.log(`\n📁 ${category.category} - ${category.category_name}`)
      console.log(`   Indicators: ${categoryIndicators.length}`)

      for (const indicator of categoryIndicators) {
        const indicatorSubs = subIndicatorsData?.filter(s => s.indicator_id === indicator.id) || []
        console.log(`   📈 ${indicator.code} - ${indicator.name}`)
        console.log(`      Sub indicators: ${indicatorSubs.length}`)
        
        if (indicatorSubs.length > 0) {
          for (const sub of indicatorSubs) {
            console.log(`      📊 ${sub.code} - ${sub.name} (${sub.weight_percentage}%)`)
          }
        }
      }
    }

    // 4. Test specific functions used in KPITree
    console.log('\n🔧 Testing KPITree functions:')
    
    function getIndicatorSubIndicators(indicatorId: string) {
      return subIndicatorsData?.filter(s => s.indicator_id === indicatorId) || []
    }

    // Test the function for each indicator
    for (const indicator of indicatorsData) {
      const subs = getIndicatorSubIndicators(indicator.id)
      console.log(`   ${indicator.code}: ${subs.length} sub indicators`)
      
      if (subs.length > 0) {
        console.log(`      Should auto-expand: YES`)
      }
    }

    // 5. Check if there are any RLS issues
    console.log('\n🔒 Testing RLS permissions...')
    
    // Test with anon key (like frontend would use)
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    
    const { data: anonSubData, error: anonError } = await anonSupabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(1)

    if (anonError) {
      console.log('⚠️  RLS might be blocking anon access:', anonError.message)
    } else {
      console.log('✅ Anon key can access sub indicators')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

async function main() {
  await testFrontendData()
  console.log('\n✅ Frontend test completed!')
}

if (require.main === module) {
  main().catch(console.error)
}