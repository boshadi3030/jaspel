#!/usr/bin/env tsx

/**
 * Test sub indicators display in frontend
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

async function testSubIndicatorDisplay() {
  console.log('🧪 Testing Sub Indicator Display...\n')

  try {
    // 1. Check if we have sub indicators
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')

    if (subError) throw subError

    console.log(`📊 Found ${subIndicators?.length || 0} sub indicators in database`)

    if (!subIndicators || subIndicators.length === 0) {
      console.log('⚠️  No sub indicators found. Creating sample data...')
      
      // Get first indicator to create sub indicators
      const { data: indicators, error: indError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .limit(1)

      if (indError) throw indError

      if (indicators && indicators.length > 0) {
        const indicator = indicators[0]
        
        // Create sample sub indicators
        const sampleSubs = [
          {
            indicator_id: indicator.id,
            code: 'SUB001',
            name: 'Ketepatan Waktu Pelayanan',
            weight_percentage: 40.00,
            target_value: 100.00,
            score_1: 20, score_2: 40, score_3: 60, score_4: 80, score_5: 100,
            score_1_label: 'Sangat Kurang', score_2_label: 'Kurang', 
            score_3_label: 'Cukup', score_4_label: 'Baik', score_5_label: 'Sangat Baik',
            measurement_unit: '%',
            description: 'Persentase ketepatan waktu dalam memberikan pelayanan'
          },
          {
            indicator_id: indicator.id,
            code: 'SUB002',
            name: 'Kualitas Pelayanan',
            weight_percentage: 35.00,
            target_value: 100.00,
            score_1: 20, score_2: 40, score_3: 60, score_4: 80, score_5: 100,
            score_1_label: 'Sangat Kurang', score_2_label: 'Kurang', 
            score_3_label: 'Cukup', score_4_label: 'Baik', score_5_label: 'Sangat Baik',
            measurement_unit: '%',
            description: 'Tingkat kepuasan pasien terhadap kualitas pelayanan'
          },
          {
            indicator_id: indicator.id,
            code: 'SUB003',
            name: 'Kelengkapan Dokumentasi',
            weight_percentage: 25.00,
            target_value: 100.00,
            score_1: 20, score_2: 40, score_3: 60, score_4: 80, score_5: 100,
            score_1_label: 'Sangat Kurang', score_2_label: 'Kurang', 
            score_3_label: 'Cukup', score_4_label: 'Baik', score_5_label: 'Sangat Baik',
            measurement_unit: '%',
            description: 'Persentase kelengkapan dokumentasi medis'
          }
        ]

        const { data: insertedSubs, error: insertError } = await supabase
          .from('m_kpi_sub_indicators')
          .insert(sampleSubs)
          .select()

        if (insertError) throw insertError

        console.log(`✅ Created ${insertedSubs?.length || 0} sample sub indicators`)
      }
    }

    // 2. Test the same query that frontend uses
    console.log('\n🔍 Testing frontend query pattern...')
    
    const { data: indicators, error: indError } = await supabase
      .from('m_kpi_indicators')
      .select('*')
      .limit(3)

    if (indError) throw indError

    if (indicators && indicators.length > 0) {
      const indicatorIds = indicators.map(i => i.id)
      
      const { data: frontendSubs, error: frontendError } = await supabase
        .from('m_kpi_sub_indicators')
        .select('*')
        .in('indicator_id', indicatorIds)
        .order('code')

      if (frontendError) {
        console.log('❌ Frontend query failed:', frontendError.message)
      } else {
        console.log(`✅ Frontend query successful: ${frontendSubs?.length || 0} sub indicators`)
        
        if (frontendSubs && frontendSubs.length > 0) {
          console.log('\n📋 Sample sub indicators:')
          frontendSubs.slice(0, 3).forEach(sub => {
            console.log(`  • ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        }
      }
    }

    console.log('\n✅ Sub indicator display test completed!')
    console.log('\n📝 Next steps:')
    console.log('1. Refresh the KPI Config page in browser')
    console.log('2. Expand an indicator to see sub indicators')
    console.log('3. Click "Tambah Sub" to add new sub indicators')

  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting Sub Indicator Display Test\n')
  await testSubIndicatorDisplay()
  console.log('\n✅ Test completed!')
}

if (require.main === module) {
  main().catch(console.error)
}