#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSubIndicatorsImplementation() {
  console.log('🔍 Testing Sub Indicators Implementation...\n')

  try {
    // 1. Check if sub indicators table exists and has data
    console.log('1. Checking sub indicators table...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .order('code')

    if (subError) {
      console.error('❌ Error fetching sub indicators:', subError)
      return
    }

    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators`)
    
    if (subIndicators && subIndicators.length > 0) {
      console.log('\n📋 Sub Indicators:')
      subIndicators.forEach(sub => {
        console.log(`   - ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        console.log(`     Indicator ID: ${sub.indicator_id}`)
        console.log(`     Scores: ${sub.score_1}(${sub.score_1_label}) | ${sub.score_2}(${sub.score_2_label}) | ${sub.score_3}(${sub.score_3_label}) | ${sub.score_4}(${sub.score_4_label}) | ${sub.score_5}(${sub.score_5_label})`)
      })
    }

    // 2. Check indicators that should have sub indicators
    console.log('\n2. Checking indicators with sub indicators...')
    const { data: indicators, error: indError } = await supabase
      .from('m_kpi_indicators')
      .select(`
        *,
        m_kpi_sub_indicators(*)
      `)
      .order('code')

    if (indError) {
      console.error('❌ Error fetching indicators:', indError)
      return
    }

    console.log(`✅ Found ${indicators?.length || 0} indicators`)
    
    if (indicators) {
      const indicatorsWithSubs = indicators.filter(ind => 
        ind.m_kpi_sub_indicators && ind.m_kpi_sub_indicators.length > 0
      )
      
      console.log(`📊 ${indicatorsWithSubs.length} indicators have sub indicators:`)
      indicatorsWithSubs.forEach(ind => {
        console.log(`   - ${ind.code}: ${ind.name}`)
        console.log(`     Sub indicators: ${ind.m_kpi_sub_indicators.length}`)
        ind.m_kpi_sub_indicators.forEach((sub: any) => {
          console.log(`       * ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        })
      })
    }

    // 3. Check specific indicators mentioned (IND-001, IND-002)
    console.log('\n3. Checking specific indicators (IND-001, IND-002)...')
    const { data: specificIndicators, error: specError } = await supabase
      .from('m_kpi_indicators')
      .select(`
        *,
        m_kpi_sub_indicators(*),
        m_kpi_categories(*)
      `)
      .in('code', ['IND-001', 'IND-002'])

    if (specError) {
      console.error('❌ Error fetching specific indicators:', specError)
      return
    }

    if (specificIndicators && specificIndicators.length > 0) {
      console.log(`✅ Found ${specificIndicators.length} specific indicators`)
      specificIndicators.forEach(ind => {
        console.log(`\n📌 ${ind.code}: ${ind.name}`)
        console.log(`   Category: ${ind.m_kpi_categories?.category} - ${ind.m_kpi_categories?.category_name}`)
        console.log(`   Unit ID: ${ind.m_kpi_categories?.unit_id}`)
        console.log(`   Sub indicators: ${ind.m_kpi_sub_indicators?.length || 0}`)
        
        if (ind.m_kpi_sub_indicators && ind.m_kpi_sub_indicators.length > 0) {
          ind.m_kpi_sub_indicators.forEach((sub: any) => {
            console.log(`     - ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        } else {
          console.log('     ⚠️  No sub indicators found')
        }
      })
    } else {
      console.log('⚠️  IND-001 and IND-002 not found')
    }

    // 4. Check UK01 - MEDIS unit
    console.log('\n4. Checking UK01 - MEDIS unit...')
    const { data: medisUnit, error: unitError } = await supabase
      .from('m_units')
      .select('*')
      .eq('code', 'UK01')
      .single()

    if (unitError) {
      console.error('❌ Error fetching MEDIS unit:', unitError)
      return
    }

    if (medisUnit) {
      console.log(`✅ Found unit: ${medisUnit.code} - ${medisUnit.name}`)
      
      // Get categories for this unit
      const { data: categories, error: catError } = await supabase
        .from('m_kpi_categories')
        .select(`
          *,
          m_kpi_indicators(
            *,
            m_kpi_sub_indicators(*)
          )
        `)
        .eq('unit_id', medisUnit.id)
        .order('category')

      if (catError) {
        console.error('❌ Error fetching categories:', catError)
        return
      }

      console.log(`📊 Categories for ${medisUnit.code}:`)
      categories?.forEach(cat => {
        console.log(`\n   ${cat.category}: ${cat.category_name} (${cat.weight_percentage}%)`)
        console.log(`   Indicators: ${cat.m_kpi_indicators?.length || 0}`)
        
        cat.m_kpi_indicators?.forEach((ind: any) => {
          const subCount = ind.m_kpi_sub_indicators?.length || 0
          console.log(`     - ${ind.code}: ${ind.name} ${subCount > 0 ? `(${subCount} sub indicators)` : ''}`)
          
          if (subCount > 0) {
            ind.m_kpi_sub_indicators.forEach((sub: any) => {
              console.log(`       * ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
            })
          }
        })
      })
    }

    console.log('\n✅ Sub Indicators Implementation Test Complete!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSubIndicatorsImplementation()