#!/usr/bin/env tsx

/**
 * Debug script untuk memeriksa mengapa sub indikator tidak tampil
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

async function debugSubIndicators() {
  console.log('🔍 Debugging Sub Indicators Display...\n')

  try {
    // 1. Check if sub indicators table exists
    console.log('1. Checking sub indicators table...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(1)

    if (tableError) {
      console.log('❌ Sub indicators table error:', tableError.message)
      return
    }
    console.log('✅ Sub indicators table exists')

    // 2. Check existing sub indicators
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')

    if (subError) {
      console.log('❌ Error fetching sub indicators:', subError.message)
      return
    }

    console.log(`📊 Found ${subIndicators?.length || 0} sub indicators in database`)

    if (subIndicators && subIndicators.length > 0) {
      console.log('\n📋 Existing sub indicators:')
      subIndicators.forEach(sub => {
        console.log(`  • ${sub.code}: ${sub.name} (Indicator: ${sub.indicator_id})`)
      })
    }

    // 3. Check indicators that should have sub indicators
    const { data: indicators, error: indError } = await supabase
      .from('m_kpi_indicators')
      .select('*')

    if (indError) {
      console.log('❌ Error fetching indicators:', indError.message)
      return
    }

    console.log(`\n📈 Found ${indicators?.length || 0} indicators`)

    // 4. Check if any indicators have sub indicators
    if (indicators && indicators.length > 0) {
      for (const indicator of indicators) {
        const { data: subs, error: subsError } = await supabase
          .from('m_kpi_sub_indicators')
          .select('*')
          .eq('indicator_id', indicator.id)

        if (subsError) {
          console.log(`❌ Error checking subs for ${indicator.code}:`, subsError.message)
          continue
        }

        console.log(`  ${indicator.code}: ${subs?.length || 0} sub indicators`)
      }
    }

    // 5. Test creating a sample sub indicator
    console.log('\n🧪 Testing sub indicator creation...')
    
    if (indicators && indicators.length > 0) {
      const testIndicator = indicators[0]
      
      const testSubData = {
        indicator_id: testIndicator.id,
        code: 'SUB-TEST-001',
        name: 'Test Sub Indicator',
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

      const { data: newSub, error: createError } = await supabase
        .from('m_kpi_sub_indicators')
        .insert(testSubData)
        .select()

      if (createError) {
        console.log('❌ Error creating test sub indicator:', createError.message)
      } else {
        console.log('✅ Test sub indicator created successfully')
        
        // Clean up test data
        if (newSub && newSub.length > 0) {
          await supabase
            .from('m_kpi_sub_indicators')
            .delete()
            .eq('id', newSub[0].id)
          console.log('🧹 Test data cleaned up')
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

async function main() {
  await debugSubIndicators()
  console.log('\n✅ Debug completed!')
}

if (require.main === module) {
  main().catch(console.error)
}