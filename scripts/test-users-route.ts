import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testUsersRoute() {
  console.log('🧪 Testing Users Route Access\n')
  console.log('=' .repeat(70))
  
  try {
    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test 1: Check if users page exists
    console.log('\n1️⃣ Checking route structure...')
    const fs = require('fs')
    const path = require('path')
    
    const usersPagePath = path.join(process.cwd(), 'app', '(authenticated)', 'users', 'page.tsx')
    const usersActionsPath = path.join(process.cwd(), 'app', '(authenticated)', 'users', 'actions.ts')
    
    if (fs.existsSync(usersPagePath)) {
      console.log('✅ Users page exists at: app/(authenticated)/users/page.tsx')
    } else {
      console.log('❌ Users page NOT found')
    }
    
    if (fs.existsSync(usersActionsPath)) {
      console.log('✅ Users actions exists at: app/(authenticated)/users/actions.ts')
    } else {
      console.log('❌ Users actions NOT found')
    }
    
    // Test 2: Check if there's an API route at /api/users
    const apiUsersPath = path.join(process.cwd(), 'app', 'api', 'users', 'route.ts')
    if (fs.existsSync(apiUsersPath)) {
      console.log('⚠️  API route exists at: app/api/users/route.ts (might conflict)')
    } else {
      console.log('✅ No conflicting API route at /api/users')
    }
    
    // Test 3: Check available API endpoints
    console.log('\n2️⃣ Available API endpoints under /api/users:')
    const apiUsersDir = path.join(process.cwd(), 'app', 'api', 'users')
    if (fs.existsSync(apiUsersDir)) {
      const endpoints = fs.readdirSync(apiUsersDir)
      endpoints.forEach((endpoint: string) => {
        console.log(`   - /api/users/${endpoint}`)
      })
    }
    
    // Test 4: Test database query (what the page uses)
    console.log('\n3️⃣ Testing database query (Server Action simulation)...')
    const { data: employees, error } = await adminClient
      .from('m_employees')
      .select(`
        id,
        employee_code,
        full_name,
        unit_id,
        tax_status,
        is_active,
        user_id,
        created_at,
        updated_at,
        m_units(id, name)
      `)
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.log('❌ Database query failed:', error.message)
    } else {
      console.log(`✅ Database query successful: ${employees?.length || 0} employees found`)
      if (employees && employees.length > 0) {
        console.log('\n   Sample employee:')
        const sample = employees[0]
        console.log(`   - ID: ${sample.id}`)
        console.log(`   - Code: ${sample.employee_code}`)
        console.log(`   - Name: ${sample.full_name}`)
        console.log(`   - User ID: ${sample.user_id}`)
      }
    }
    
    // Test 5: Check middleware configuration
    console.log('\n4️⃣ Checking middleware configuration...')
    const middlewarePath = path.join(process.cwd(), 'middleware.ts')
    if (fs.existsSync(middlewarePath)) {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8')
      if (middlewareContent.includes('/users/:path*')) {
        console.log('✅ Middleware includes /users route matcher')
      } else {
        console.log('❌ Middleware does NOT include /users route matcher')
      }
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('\n✅ Route structure test completed')
    console.log('\n📝 Summary:')
    console.log('   - Users page should be accessible at: http://localhost:3002/users')
    console.log('   - Page uses Server Actions (not API routes)')
    console.log('   - If you see 500 error, check:')
    console.log('     1. Dev server is running (npm run dev)')
    console.log('     2. No conflicting API routes')
    console.log('     3. Browser console for actual error message')
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    console.error(error)
  }
}

testUsersRoute()
