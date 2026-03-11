#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testKPIApiEndpoint() {
  console.log('🌐 Testing KPI API Endpoint...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Test 1: Login as superadmin to get session token
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
    const accessToken = authData.session?.access_token
    
    if (!accessToken) {
      console.error('❌ No access token received')
      return
    }
    
    // Test 2: Test the KPI config API endpoint
    console.log('\n🔌 Testing /api/kpi-config endpoint...')
    
    try {
      // Use Node.js built-in fetch (available in Node 18+)
      const response = await fetch('http://localhost:3003/api/kpi-config', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`📡 Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API endpoint working!')
        console.log(`📊 Response data structure:`)
        console.log(`  - Categories: ${data.categories?.length || 0}`)
        console.log(`  - Indicators: ${data.indicators?.length || 0}`)
        console.log(`  - Sub Indicators: ${data.subIndicators?.length || 0}`)
        
        if (data.subIndicators && data.subIndicators.length > 0) {
          console.log('\n📋 Sub Indicators from API:')
          data.subIndicators.forEach((sub: any) => {
            console.log(`  • ${sub.code}: ${sub.name} (${sub.weight_percentage}%)`)
          })
        } else {
          console.log('⚠️ No sub indicators returned from API')
        }
        
        // Show full structure
        if (data.categories) {
          console.log('\\n🏗️ Full KPI Structure from API:')
          data.categories.forEach((category: any) => {
            console.log(\`📁 \${category.category}: \${category.category_name}\`)
            const catIndicators = data.indicators?.filter((i: any) => i.category_id === category.id) || []
            catIndicators.forEach((indicator: any) => {
              console.log(\`  📈 \${indicator.code}: \${indicator.name}\`)
              const indSubs = data.subIndicators?.filter((s: any) => s.indicator_id === indicator.id) || []
              console.log(\`    📋 \${indSubs.length} sub indicators\`)
              indSubs.forEach((sub: any) => {
                console.log(\`      • \${sub.code}: \${sub.name} (\${sub.weight_percentage}%)\`)
              })
            })
          })
        }
        
      } else {
        const errorText = await response.text()
        console.error(\`❌ API error (\${response.status}):\`, errorText)
      }
      
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError)
      console.log('💡 Make sure the dev server is running on port 3003')
    }
    
    console.log('\\n✅ KPI API endpoint test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testKPIApiEndpoint()