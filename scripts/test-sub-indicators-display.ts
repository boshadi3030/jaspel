#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSubIndicatorsDisplay() {
  console.log('🔍 Testing Sub Indicators Display Issue...\n')

  try {
    // 1. Check if sub indicators table exists and has data
    console.log('1. ✅ Checking sub indicators table...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .eq('is_active', true)
      .limit(10)

    if (subError) {
      console.error('❌ Error querying sub indicators:', subError)
      return
    }

    console.log(`   Found ${subIndicators?.length || 0} sub indicators`)
    if (subIndicators && subIndicators.length > 0) {
      subIndicators.forEach(sub => {
        console.log(`   📋 ${sub.code}: ${sub.name} (Indicator: ${sub.indicator_id})`)
      })
    }

    // 2. Check indicators with their sub indicators
    console.log('\n2. ✅ Checking indicators with sub indicators...')
    const { data: indicators, error: indError } = await supabase
      .from('m_kpi_indicators')
      .select(`
        id,
        code,
        name,
        category_id,
        m_kpi_sub_indicators (
          id,
          code,
          name,
          weight_percentage,
          score_1,
          score_2,
          score_3,
          score_4,
          score_5,
          score_1_label,
          score_2_label,
          score_3_label,
          score_4_label,
          score_5_label
        )
      `)
      .eq('is_active', true)
      .limit(5)

    if (indError) {
      console.error('❌ Error querying indicators with sub indicators:', indError)
      return
    }

    console.log(`   Found ${indicators?.length || 0} indicators`)
    indicators?.forEach(indicator => {
      const subCount = indicator.m_kpi_sub_indicators?.length || 0
      console.log(`   📈 ${indicator.code}: ${indicator.name} (${subCount} sub indicators)`)
      
      if (subCount > 0) {
        indicator.m_kpi_sub_indicators?.forEach((sub: any) => {
          console.log(`      📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          console.log(`         Scores: ${sub.score_1}(${sub.score_1_label}) - ${sub.score_5}(${sub.score_5_label})`)
        })
      }
    })

    // 3. Check categories with full hierarchy
    console.log('\n3. ✅ Checking full KPI hierarchy...')
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select(`
        id,
        category,
        category_name,
        unit_id,
        m_kpi_indicators (
          id,
          code,
          name,
          m_kpi_sub_indicators (
            id,
            code,
            name,
            weight_percentage
          )
        )
      `)
      .eq('is_active', true)
      .limit(3)

    if (catError) {
      console.error('❌ Error querying categories:', catError)
      return
    }

    console.log(`   Found ${categories?.length || 0} categories`)
    categories?.forEach(category => {
      const indCount = category.m_kpi_indicators?.length || 0
      console.log(`   📂 ${category.category}: ${category.category_name} (${indCount} indicators)`)
      
      category.m_kpi_indicators?.forEach((indicator: any) => {
        const subCount = indicator.m_kpi_sub_indicators?.length || 0
        console.log(`      📈 ${indicator.code}: ${indicator.name} (${subCount} sub indicators)`)
        
        if (subCount > 0) {
          indicator.m_kpi_sub_indicators?.forEach((sub: any) => {
            console.log(`         📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        }
      })
    })

    // 4. Test specific unit data
    console.log('\n4. ✅ Testing specific unit data...')
    const { data: units, error: unitError } = await supabase
      .from('m_units')
      .select('id, code, name')
      .eq('is_active', true)
      .limit(1)

    if (unitError || !units || units.length === 0) {
      console.log('   ⚠️ No units found')
      return
    }

    const testUnit = units[0]
    console.log(`   Testing unit: ${testUnit.code} - ${testUnit.name}`)

    const { data: unitCategories, error: unitCatError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('unit_id', testUnit.id)
      .eq('is_active', true)

    if (unitCatError) {
      console.error('❌ Error querying unit categories:', unitCatError)
      return
    }

    console.log(`   Found ${unitCategories?.length || 0} categories for this unit`)

    if (unitCategories && unitCategories.length > 0) {
      const categoryIds = unitCategories.map(c => c.id)
      
      const { data: unitIndicators, error: unitIndError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_active', true)

      if (unitIndError) {
        console.error('❌ Error querying unit indicators:', unitIndError)
        return
      }

      console.log(`   Found ${unitIndicators?.length || 0} indicators for this unit`)

      if (unitIndicators && unitIndicators.length > 0) {
        const indicatorIds = unitIndicators.map(i => i.id)
        
        const { data: unitSubIndicators, error: unitSubError } = await supabase
          .from('m_kpi_sub_indicators')
          .select('*')
          .in('indicator_id', indicatorIds)
          .eq('is_active', true)

        if (unitSubError) {
          console.error('❌ Error querying unit sub indicators:', unitSubError)
          return
        }

        console.log(`   Found ${unitSubIndicators?.length || 0} sub indicators for this unit`)
        
        if (unitSubIndicators && unitSubIndicators.length > 0) {
          unitSubIndicators.forEach(sub => {
            console.log(`      📋 ${sub.code}: ${sub.name} (Indicator: ${sub.indicator_id})`)
          })
        } else {
          console.log('   ⚠️ NO SUB INDICATORS FOUND - This is the issue!')
        }
      }
    }

    console.log('\n🎯 DIAGNOSIS COMPLETE')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSubIndicatorsDisplay()