#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testKPIConfigSubIndicators() {
  console.log('🔍 Testing KPI Config Sub Indicators Display...')
  
  try {
    // Test 1: Login as superadmin
    console.log('\n👤 Testing superadmin login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError)
      return
    }
    
    console.log('✅ Superadmin logged in successfully')
    
    // Test 2: Fetch categories with indicators and sub indicators
    console.log('\n📊 Fetching KPI structure...')
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select(`
        id,
        category,
        category_name,
        weight_percentage,
        unit_id,
        m_kpi_indicators (
          id,
          code,
          name,
          weight_percentage,
          target_value,
          m_kpi_sub_indicators (
            id,
            code,
            name,
            weight_percentage,
            target_value,
            score_1,
            score_2,
            score_3,
            score_4,
            score_5
          )
        )
      `)
      .eq('is_active', true)
      .order('category')
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }
    
    console.log(`✅ Found ${categories?.length || 0} categories`)
    
    // Test 3: Display structure
    categories?.forEach(category => {
      console.log(`\n📁 ${category.category}: ${category.category_name} (${category.weight_percentage}%)`)
      
      const indicators = category.m_kpi_indicators || []
      console.log(`  📈 ${indicators.length} indicators`)
      
      indicators.forEach(indicator => {
        const subIndicators = indicator.m_kpi_sub_indicators || []
        console.log(`    📊 ${indicator.code}: ${indicator.name} (${indicator.weight_percentage}%)`)
        console.log(`      🔸 ${subIndicators.length} sub indicators`)
        
        subIndicators.forEach(sub => {
          console.log(`        📋 ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        })
      })
    })
    
    // Test 4: Test API endpoint
    console.log('\n🌐 Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3003/api/kpi-config', {
        headers: {
          'Authorization': `Bearer ${authData.session?.access_token}`
        }
      })
      
      if (response.ok) {
        const apiData = await response.json()
        console.log('✅ API endpoint working')
        console.log(`📊 API returned ${apiData.categories?.length || 0} categories`)
      } else {
        console.log(`⚠️ API returned status: ${response.status}`)
      }
    } catch (fetchError) {
      console.log('⚠️ Could not test API endpoint (server might not be ready)')
    }
    
    // Test 5: Check if sub indicators are properly linked
    console.log('\n🔗 Testing sub indicator relationships...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select(`
        id,
        code,
        name,
        indicator_id,
        m_kpi_indicators (
          id,
          code,
          name,
          m_kpi_categories (
            id,
            category,
            category_name
          )
        )
      `)
      .eq('is_active', true)
    
    if (subError) {
      console.error('❌ Error fetching sub indicators:', subError)
      return
    }
    
    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators with proper relationships`)
    
    subIndicators?.forEach(sub => {
      const indicator = sub.m_kpi_indicators
      const category = indicator?.m_kpi_categories
      console.log(`  📋 ${sub.code}: ${sub.name}`)
      console.log(`    ↳ Indicator: ${indicator?.code} - ${indicator?.name}`)
      console.log(`    ↳ Category: ${category?.category} - ${category?.category_name}`)
    })
    
    console.log('\n✅ KPI Config Sub Indicators test completed!')
    console.log('\n💡 If sub indicators are not showing in the UI:')
    console.log('   1. Check browser console for errors')
    console.log('   2. Verify RLS policies are working correctly')
    console.log('   3. Check if KPITree component is rendering sub indicators')
    console.log('   4. Visit: http://localhost:3003/kpi-config')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPIConfigSubIndicators()