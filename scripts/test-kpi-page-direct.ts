#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIPageDirect() {
  console.log('🔍 Testing KPI Config Page Direct Access...')
  
  try {
    // Test 1: Test sub indicators data directly from database
    console.log('\n📊 Testing sub indicators from database...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select(`
        id,
        code,
        name,
        weight_percentage,
        indicator_id,
        m_kpi_indicators (
          id,
          code,
          name,
          category_id,
          m_kpi_categories (
            id,
            category,
            category_name,
            unit_id
          )
        )
      `)
      .eq('is_active', true)
    
    if (subError) {
      console.error('❌ Error fetching sub indicators:', subError)
      return
    }
    
    console.log(`✅ Found ${subIndicators?.length || 0} sub indicators`)
    
    if (subIndicators && subIndicators.length > 0) {
      console.log('\n📋 Sub indicators structure:')
      subIndicators.forEach(sub => {
        const indicator = sub.m_kpi_indicators
        const category = indicator?.m_kpi_categories
        console.log(`  • ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
        console.log(`    ↳ Indicator: ${indicator?.code} - ${indicator?.name}`)
        console.log(`    ↳ Category: ${category?.category} - ${category?.category_name}`)
        console.log(`    ↳ Unit ID: ${category?.unit_id}`)
        console.log('')
      })
    }
    
    // Test 2: Test with superadmin authentication
    console.log('\n👤 Testing with superadmin authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Authentication failed:', authError)
      return
    }
    
    console.log('✅ Authenticated as superadmin')
    
    // Test 3: Test data access with authenticated user
    console.log('\n🔐 Testing data access with authenticated user...')
    const { data: authSubIndicators, error: authSubError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .eq('is_active', true)
    
    if (authSubError) {
      console.error('❌ Error with authenticated access:', authSubError)
    } else {
      console.log(`✅ Authenticated access successful: ${authSubIndicators?.length || 0} sub indicators`)
    }
    
    // Test 4: Test categories and indicators
    console.log('\n📊 Testing full KPI structure...')
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select(`
        id,
        category,
        category_name,
        weight_percentage,
        unit_id
      `)
      .eq('is_active', true)
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError)
    } else {
      console.log(`✅ Found ${categories?.length || 0} categories`)
      
      for (const category of categories || []) {
        console.log(`\n📁 ${category.category}: ${category.category_name}`)
        
        // Get indicators for this category
        const { data: indicators, error: indError } = await supabase
          .from('m_kpi_indicators')
          .select('*')
          .eq('category_id', category.id)
          .eq('is_active', true)
        
        if (indError) {
          console.error('  ❌ Error fetching indicators:', indError)
          continue
        }
        
        console.log(`  📈 ${indicators?.length || 0} indicators`)
        
        for (const indicator of indicators || []) {
          console.log(`    • ${indicator.code}: ${indicator.name}`)
          
          // Get sub indicators for this indicator
          const { data: subs, error: subErr } = await supabase
            .from('m_kpi_sub_indicators')
            .select('*')
            .eq('indicator_id', indicator.id)
            .eq('is_active', true)
          
          if (subErr) {
            console.error('      ❌ Error fetching sub indicators:', subErr)
            continue
          }
          
          console.log(`      📋 ${subs?.length || 0} sub indicators`)
          subs?.forEach(sub => {
            console.log(`        - ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        }
      }
    }
    
    console.log('\n✅ KPI Page Direct Test completed!')
    console.log('\n💡 Next steps:')
    console.log('   1. Open browser to http://localhost:3003/login')
    console.log('   2. Login with admin@example.com / admin123')
    console.log('   3. Navigate to Konfigurasi KPI')
    console.log('   4. Check if sub indicators are visible in the tree')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPIPageDirect()