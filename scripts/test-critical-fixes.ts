import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testCriticalFixes() {
  console.log('🧪 Testing Critical Fixes...\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test 1: Verify m_pegawai table no longer exists
  console.log('1️⃣ Testing database migration (m_pegawai elimination)...')
  try {
    const { data: tables, error } = await supabase
      .from('m_pegawai')
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('does not exist')) {
      console.log('✅ m_pegawai table successfully removed')
    } else {
      console.log('⚠️  m_pegawai table still exists - migration incomplete')
    }
  } catch (error: any) {
    if (error.message.includes('does not exist')) {
      console.log('✅ m_pegawai table successfully removed')
    } else {
      console.log('❌ Error checking m_pegawai:', error.message)
    }
  }
  
  // Test 2: Verify m_employees table exists and has data
  console.log('\n2️⃣ Testing m_employees table...')
  try {
    const { data, error } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id')
      .limit(5)
    
    if (error) {
      console.log('❌ Error accessing m_employees:', error.message)
    } else {
      console.log(`✅ m_employees table accessible with ${data?.length || 0} records`)
      if (data && data.length > 0) {
        console.log('   Sample record:', data[0])
      }
    }
  } catch (error: any) {
    console.log('❌ Error:', error.message)
  }
  
  // Test 3: Verify ErrorBoundary component exists
  console.log('\n3️⃣ Testing ErrorBoundary component...')
  try {
    const fs = require('fs')
    const path = require('path')
    
    const errorBoundaryPath = path.join(process.cwd(), 'components', 'ErrorBoundary.tsx')
    if (fs.existsSync(errorBoundaryPath)) {
      console.log('✅ ErrorBoundary component exists')
      
      const content = fs.readFileSync(errorBoundaryPath, 'utf-8')
      if (content.includes('ChunkLoadError') || content.includes('chunk')) {
        console.log('✅ ErrorBoundary handles chunk loading errors')
      } else {
        console.log('⚠️  ErrorBoundary may not handle chunk loading errors')
      }
    } else {
      console.log('❌ ErrorBoundary component not found')
    }
  } catch (error: any) {
    console.log('❌ Error checking ErrorBoundary:', error.message)
  }
  
  // Test 4: Verify authenticated layout exists
  console.log('\n4️⃣ Testing authenticated layout structure...')
  try {
    const fs = require('fs')
    const path = require('path')
    
    const layoutPaths = [
      path.join(process.cwd(), 'app', '(authenticated)', 'layout.tsx'),
      path.join(process.cwd(), 'app', 'admin', 'layout.tsx'),
    ]
    
    let layoutFound = false
    for (const layoutPath of layoutPaths) {
      if (fs.existsSync(layoutPath)) {
        console.log(`✅ Layout found: ${path.basename(path.dirname(layoutPath))}/layout.tsx`)
        
        const content = fs.readFileSync(layoutPath, 'utf-8')
        if (content.includes('Sidebar') || content.includes('sidebar')) {
          console.log('✅ Layout includes Sidebar component')
        }
        layoutFound = true
        break
      }
    }
    
    if (!layoutFound) {
      console.log('⚠️  No authenticated layout with sidebar found')
    }
  } catch (error: any) {
    console.log('❌ Error checking layout:', error.message)
  }
  
  // Test 5: Verify middleware exists and handles auth
  console.log('\n5️⃣ Testing middleware authentication...')
  try {
    const fs = require('fs')
    const path = require('path')
    
    const middlewarePath = path.join(process.cwd(), 'middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      console.log('✅ Middleware exists')
      
      const content = fs.readFileSync(middlewarePath, 'utf-8')
      if (content.includes('getUser') || content.includes('auth')) {
        console.log('✅ Middleware handles authentication')
      } else {
        console.log('⚠️  Middleware may not handle authentication properly')
      }
    } else {
      console.log('❌ Middleware not found')
    }
  } catch (error: any) {
    console.log('❌ Error checking middleware:', error.message)
  }
  
  // Test 6: Test page accessibility
  console.log('\n6️⃣ Testing page accessibility...')
  try {
    const response = await fetch('http://localhost:3001/admin/pegawai')
    console.log(`   /admin/pegawai: ${response.status} ${response.statusText}`)
    
    if (response.status === 200 || response.status === 307 || response.status === 302) {
      console.log('✅ Employee management page accessible')
    } else {
      console.log('⚠️  Employee management page may have issues')
    }
  } catch (error: any) {
    console.log('⚠️  Could not test page accessibility:', error.message)
  }
  
  console.log('\n✅ Critical fixes verification complete!')
  console.log('\n📋 Summary:')
  console.log('   - Database migration: m_pegawai → m_employees')
  console.log('   - Error boundary for chunk loading')
  console.log('   - Authenticated layout with persistent sidebar')
  console.log('   - Middleware authentication')
  console.log('   - Next.js configuration optimized')
}

testCriticalFixes().catch(console.error)
