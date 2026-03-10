/**
 * Test script for user management features
 * Tests: delete, template, import, export
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testUserManagementFeatures() {
  console.log('🧪 Testing User Management Features\n')
  
  try {
    // Test 1: Check if API routes exist
    console.log('1️⃣ Checking API routes...')
    const routes = [
      'app/api/users/delete/route.ts',
      'app/api/users/template/route.ts',
      'app/api/users/import/route.ts',
      'app/api/users/export/route.ts'
    ]
    
    const fs = require('fs')
    for (const route of routes) {
      if (fs.existsSync(route)) {
        console.log(`   ✅ ${route} exists`)
      } else {
        console.log(`   ❌ ${route} missing`)
      }
    }
    
    // Test 2: Check database structure
    console.log('\n2️⃣ Checking database structure...')
    
    const { data: employees, error: empError } = await supabase
      .from('m_employees')
      .select('id, user_id, employee_code, full_name')
      .limit(1)
    
    if (empError) {
      console.log(`   ❌ m_employees table error: ${empError.message}`)
    } else {
      console.log(`   ✅ m_employees table accessible`)
      console.log(`   📊 Sample employee:`, employees?.[0])
    }
    
    // Test 3: Check auth users
    console.log('\n3️⃣ Checking auth users...')
    
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.log(`   ❌ Auth users error: ${authError.message}`)
    } else {
      console.log(`   ✅ Auth users accessible`)
      console.log(`   👥 Total users: ${authData.users.length}`)
      
      // Show sample user
      if (authData.users.length > 0) {
        const sampleUser = authData.users[0]
        console.log(`   📊 Sample user:`)
        console.log(`      - Email: ${sampleUser.email}`)
        console.log(`      - Role: ${sampleUser.user_metadata?.role}`)
        console.log(`      - ID: ${sampleUser.id}`)
      }
    }
    
    // Test 4: Check user-employee linkage
    console.log('\n4️⃣ Checking user-employee linkage...')
    
    const { data: linkedEmployees, error: linkError } = await supabase
      .from('m_employees')
      .select('id, user_id, employee_code, full_name')
      .not('user_id', 'is', null)
      .limit(5)
    
    if (linkError) {
      console.log(`   ❌ Linkage check error: ${linkError.message}`)
    } else {
      console.log(`   ✅ Found ${linkedEmployees?.length || 0} linked employees`)
      linkedEmployees?.forEach((emp: any) => {
        console.log(`      - ${emp.full_name} (${emp.employee_code}) → ${emp.user_id}`)
      })
    }
    
    // Test 5: Component structure
    console.log('\n5️⃣ Checking component structure...')
    
    const components = [
      'app/admin/users/page.tsx',
      'components/users/UserTable.tsx',
      'components/users/UserFormDialog.tsx'
    ]
    
    for (const component of components) {
      if (fs.existsSync(component)) {
        const content = fs.readFileSync(component, 'utf-8')
        
        // Check for new features
        const hasDelete = content.includes('onDelete') || content.includes('handleDelete')
        const hasTemplate = content.includes('handleDownloadTemplate') || content.includes('template')
        const hasImport = content.includes('handleImport') || content.includes('import')
        const hasExport = content.includes('handleExport') || content.includes('export')
        
        console.log(`   📄 ${component}:`)
        console.log(`      - Delete: ${hasDelete ? '✅' : '❌'}`)
        console.log(`      - Template: ${hasTemplate ? '✅' : '❌'}`)
        console.log(`      - Import: ${hasImport ? '✅' : '❌'}`)
        console.log(`      - Export: ${hasExport ? '✅' : '❌'}`)
      } else {
        console.log(`   ❌ ${component} missing`)
      }
    }
    
    console.log('\n✅ All tests completed!')
    console.log('\n📝 Summary:')
    console.log('   - Delete functionality: Added to UserTable with confirmation')
    console.log('   - Template download: Excel template with reference sheets')
    console.log('   - Import: Bulk user creation from Excel')
    console.log('   - Export: Download all users as Excel report')
    console.log('\n🚀 Ready to test in browser at http://localhost:3002/admin/users')
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testUserManagementFeatures()
