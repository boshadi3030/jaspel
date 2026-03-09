/**
 * Script untuk cek users yang ada
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkUsers() {
  console.log('Checking users in database...')
  console.log('')

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: employees, error } = await supabase
    .from('m_employees')
    .select('id, email, role, is_active, full_name')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.log('Error:', error.message)
    return
  }

  if (!employees || employees.length === 0) {
    console.log('No users found in database')
    return
  }

  console.log(`Found ${employees.length} users:`)
  console.log('')

  employees.forEach((emp, index) => {
    console.log(`${index + 1}. ${emp.full_name || 'No name'}`)
    console.log(`   Email: ${emp.email}`)
    console.log(`   Role: ${emp.role}`)
    console.log(`   Active: ${emp.is_active}`)
    console.log('')
  })
}

checkUsers().catch(console.error)
