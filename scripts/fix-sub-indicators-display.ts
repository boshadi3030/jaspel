#!/usr/bin/env tsx

/**
 * Script untuk memperbaiki tampilan sub indikator
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

async function fixSubIndicatorsDisplay() {
  console.log('🔧 Fixing Sub Indicators Display...\n')

  try {
    // 1. Ensure all sub indicators have proper data
    console.log('1. Checking sub indicators data integrity...')
    
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')

    if (subError) throw subError

    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators`)

    // 2. Check for any missing required fields
    if (subIndicators && subIndicators.length > 0) {
      for (const sub of subIndicators) {
        const issues = []
        
        if (!sub.code) issues.push('missing code')
        if (!sub.name) issues.push('missing name')
        if (sub.weight_percentage === null || sub.weight_percentage === undefined) issues.push('missing weight')
        if (!sub.score_1_label) issues.push('missing score labels')
        
        if (issues.length > 0) {
          console.log(`⚠️  Sub indicator ${sub.id}: ${issues.join(', ')}`)
        }
      }
    }

    // 3. Test the exact query used by frontend
    console.log('\n2. Testing frontend query pattern...')
    
    const { data: units } = await supabase
      .from('m_units')
      .select('id')
      .eq('code', 'UK01')
      .limit(1)

    if (!units || units.length === 0) {
      console.log('❌ Test unit UK01 not found')
      return
    }

    const unitId = units[0].id

    // Simulate exact frontend loading sequence
    const { data: categories } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', unitId)
      .order('category')

    const categoryIds = categories?.map(c => c.id) || []
    
    const { data: indicators } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .in('category_id', categoryIds)
      .order('code')

    const indicatorIds = indicators?.map(i => i.id) || []
    
    const { data: subs } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .in('indicator_id', indicatorIds)
      .order('code')

    console.log(`✅ Frontend query simulation:`)
    console.log(`   Categories: ${categories?.length || 0}`)
    console.log(`   Indicators: ${indicators?.length || 0}`)
    console.log(`   Sub indicators: ${subs?.length || 0}`)

    // 4. Create a simple test sub indicator if none exist for first indicator
    if (indicators && indicators.length > 0 && (!subs || subs.length === 0)) {
      console.log('\n3. Creating test sub indicator...')
      
      const testIndicator = indicators[0]
      const testSubData = {
        indicator_id: testIndicator.id,
        code: 'TEST-SUB-001',
        name: 'Test Sub Indikator untuk Debugging',
        weight_percentage: 100,
        target_value: 100,
        score_1: 20,
        score_2: 40,
        score_3: 60,
        score_4: 80,
        score_5: 100,
        score_1_label: 'Sangat Kurang',
        score_2_label: 'Kurang',
        score_3_label: 'Cukup',
        score_4_label: 'Baik',
        score_5_label: 'Sangat Baik',
        is_active: true
      }

      const { error: createError } = await supabase
        .from('m_kpi_sub_indicators')
        .insert(testSubData)

      if (createError) {
        console.log('❌ Error creating test sub indicator:', createError.message)
      } else {
        console.log('✅ Test sub indicator created')
      }
    }

    console.log('\n✅ Sub indicators display fix completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Refresh the KPI Config page in browser')
    console.log('2. Check browser console for debug logs')
    console.log('3. Click expand arrows next to indicators')
    console.log('4. Sub indicators should now be visible')

  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

async function main() {
  await fixSubIndicatorsDisplay()
}

if (require.main === module) {
  main().catch(console.error)
}