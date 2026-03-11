#!/usr/bin/env tsx

console.log(`
🌐 Browser Test Script for Sub Indicators

Copy and paste this code into your browser console when logged in as superadmin:

=== START BROWSER CONSOLE CODE ===

// Test sub indicators access in browser
async function testSubIndicators() {
  console.log('🔍 Testing Sub Indicators in Browser...')
  
  try {
    // Get the supabase client from window (if available)
    const supabase = window.supabase || (() => {
      console.log('Creating new Supabase client...')
      return window.createClient(
        '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
        '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}'
      )
    })()
    
    // Check current session
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      return
    }
    
    console.log('✅ Current session:', session?.session?.user?.email || 'No session')
    
    // Test 1: Direct sub indicators query
    console.log('\\n📊 Testing direct sub indicators query...')
    const { data: subIndicators, error: subError } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .eq('is_active', true)
    
    if (subError) {
      console.error('❌ Sub indicators error:', subError)
    } else {
      console.log(\`✅ Sub indicators loaded: \${subIndicators?.length || 0}\`)
      subIndicators?.forEach(sub => {
        console.log(\`  • \${sub.code}: \${sub.name} (\${sub.weight_percentage}%)\`)
      })
    }
    
    // Test 2: Categories query
    console.log('\\n📁 Testing categories query...')
    const { data: categories, error: catError } = await supabase
      .from('m_kpi_categories')
      .select('*')
      .eq('is_active', true)
    
    if (catError) {
      console.error('❌ Categories error:', catError)
    } else {
      console.log(\`✅ Categories loaded: \${categories?.length || 0}\`)
    }
    
    // Test 3: Full KPI structure query (like the frontend does)
    console.log('\\n🏗️ Testing full KPI structure query...')
    if (categories && categories.length > 0) {
      const categoryIds = categories.map(c => c.id)
      
      const { data: indicators, error: indError } = await supabase
        .from('m_kpi_indicators')
        .select('*')
        .in('category_id', categoryIds)
        .order('code')
      
      if (indError) {
        console.error('❌ Indicators error:', indError)
      } else {
        console.log(\`✅ Indicators loaded: \${indicators?.length || 0}\`)
        
        if (indicators && indicators.length > 0) {
          const indicatorIds = indicators.map(i => i.id)
          
          const { data: subs, error: subsError } = await supabase
            .from('m_kpi_sub_indicators')
            .select('*')
            .in('indicator_id', indicatorIds)
            .order('code')
          
          if (subsError) {
            console.error('❌ Sub indicators in structure error:', subsError)
            console.log('This is likely the same error the KPI Config page is experiencing!')
          } else {
            console.log(\`✅ Sub indicators in structure loaded: \${subs?.length || 0}\`)
            
            // Show structure
            console.log('\\n📊 KPI Structure:')
            categories.forEach(category => {
              console.log(\`📁 \${category.category}: \${category.category_name}\`)
              const catIndicators = indicators.filter(i => i.category_id === category.id)
              catIndicators.forEach(indicator => {
                console.log(\`  📈 \${indicator.code}: \${indicator.name}\`)
                const indSubs = subs?.filter(s => s.indicator_id === indicator.id) || []
                indSubs.forEach(sub => {
                  console.log(\`    📋 \${sub.code}: \${sub.name} (\${sub.weight_percentage}%)\`)
                })
              })
            })
          }
        }
      }
    }
    
    console.log('\\n✅ Browser test completed!')
    
  } catch (error) {
    console.error('❌ Browser test failed:', error)
  }
}

// Run the test
testSubIndicators()

=== END BROWSER CONSOLE CODE ===

Instructions:
1. Open http://localhost:3003/login in your browser
2. Login with admin@example.com / admin123
3. Navigate to Konfigurasi KPI page
4. Open browser Developer Tools (F12)
5. Go to Console tab
6. Copy and paste the code above
7. Press Enter to run the test
8. Check the results to see if sub indicators are accessible

`)

console.log('Browser test script generated. Follow the instructions above.')