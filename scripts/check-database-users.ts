import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsers() {
  console.log('='.repeat(60))
  console.log('CHECKING DATABASE USERS')
  console.log('='.repeat(60))
  console.log('')

  try {
    // Check m_employees table
    console.log('1. Checking m_employees table...')
    const { data: employees, error: empError } = await supabase
      .from('m_employees')
      .select('id, email, full_name, role, is_active')
      .order('email')

    if (empError) {
      console.error('❌ Error fetching employees:', empError)
      return
    }

    if (!employees || employees.length === 0) {
      console.log('❌ No employees found in database!')
      console.log('')
      console.log('You need to run the seed script:')
      console.log('  npm run seed')
      return
    }

    console.log(`✅ Found ${employees.length} employees:`)
    console.log('')
    employees.forEach(emp => {
      console.log(`  Email: ${emp.email}`)
      console.log(`  Name: ${emp.full_name}`)
      console.log(`  Role: ${emp.role}`)
      console.log(`  Active: ${emp.is_active ? '✅' : '❌'}`)
      console.log('')
    })

    // Check auth.users table
    console.log('2. Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    if (!authUsers || authUsers.users.length === 0) {
      console.log('❌ No auth users found!')
      console.log('')
      console.log('You need to create auth users. Run:')
      console.log('  npm run seed')
      return
    }

    console.log(`✅ Found ${authUsers.users.length} auth users:`)
    console.log('')
    authUsers.users.forEach(user => {
      console.log(`  Email: ${user.email}`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`)
      console.log(`  Created: ${user.created_at}`)
      console.log('')
    })

    // Cross-check
    console.log('3. Cross-checking employees with auth users...')
    console.log('')
    
    for (const emp of employees) {
      const authUser = authUsers.users.find(u => u.email === emp.email)
      if (authUser) {
        console.log(`✅ ${emp.email} - Has auth account`)
      } else {
        console.log(`❌ ${emp.email} - Missing auth account!`)
      }
    }

    console.log('')
    console.log('='.repeat(60))
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Employees in m_employees: ${employees.length}`)
    console.log(`Users in auth.users: ${authUsers.users.length}`)
    console.log('')
    console.log('Test credentials:')
    console.log('  Email: admin@example.com')
    console.log('  Password: admin123')
    console.log('')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkUsers()
