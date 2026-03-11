#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testFrontendFinal() {
  console.log('🎯 Final Test - Frontend Sub Indicators...')
  
  try {
    // Use anon key like the frontend does
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test 1: Login as superadmin
    console.log('\n👤 Logging in as superadmin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Login failed:', authError)
      return
    }
    
    console.log('✅ Login successful')
    
    // Test 2: Simulate the exact frontend query pattern
    console.log('\n🏗️ Simulating frontend KPI structure loading...')
    
    // Step 1: Load categories (like the frontend does)
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('is_active', true)
      .order('category')
    
    if (catError) {
      console.error('❌ Categories error:', catError)
      return
    }
    
    console.log('✅ Categories loaded:', categories?.length || 0)
    
    if (categories && categories.length > 0) {
      // Step 2: Load indicators for categories
      const categoryIds = categories.map(c => c.id)
      const { data: indicators, error: indError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')
      
      if (indError) {
        console.error('❌ Indicators error:', indError)
        return
      }
      
      console.log('✅ Indicators loaded:', indicators?.length || 0)
      
      if (indicators && indicators.length > 0) {
        // Step 3: Load sub indicators for indicators
        const indicatorIds = indicators.map(i => i.id)
        const { data: subIndicators, error: subError } = await supabase
          .from('m_kpi_sub_indicators')
          .select('*')
          .in('indicator_id', indicatorIds)
          .order('code')
        
        if (subError) {
          console.error('❌ Sub indicators error:', subError)
          console.log('This would cause sub indicators to not show in the frontend!')
          return
        }
        
        console.log('✅ Sub indicators loaded:', subIndicators?.length || 0)
        
        // Display the structure like the frontend would
        console.log('\n📊 KPI Structure (as frontend would see it):')
        categories.forEach(category => {
          console.log('📁', category.category + ':', category.category_name)
          const catIndicators = indicators.filter(i => i.category_id === category.id)
          catIndicators.forEach(indicator => {
            console.log('  📈', indicator.code + ':', indicator.name)
            const indSubs = subIndicators?.filter(s => s.indicator_id === indicator.id) || []
            if (indSubs.length > 0) {
              console.log('    📋', indSubs.length, 'sub indicators:')
              indSubs.forEach(sub => {
                console.log('      •', sub.code + ':', sub.name, '(' + sub.weight_percentage + '%)')
              })
            } else {
              console.log('    📋 No sub indicators')
            }
          })
        })
        
        console.log('\n✅ Frontend simulation successful!')
        console.log('🎉 Sub indicators should now be visible in the KPI Config page!')
        
      } else {
        console.log('⚠️ No indicators found')
      }
    } else {
      console.log('⚠️ No categories found')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFrontendFinal()