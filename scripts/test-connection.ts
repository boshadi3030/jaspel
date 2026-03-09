import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Check if we can query m_units
    console.log('\n1. Testing m_units query...')
    const { data: units, error: unitsError } = await supabase
      .from('m_units')
      .select('*')
      .limit(5)
    
    if (unitsError) {
      console.error('❌ Error querying m_units:', unitsError)
    } else {
      console.log('✅ Successfully queried m_units:', units?.length || 0, 'rows')
    }
    
    // Test 2: Check if we can query m_employees
    console.log('\n2. Testing m_employees query...')
    const { data: employees, error: employeesError } = await supabase
      .from('m_employees')
      .select('*')
      .limit(5)
    
    if (employeesError) {
      console.error('❌ Error querying m_employees:', employeesError)
    } else {
      console.log('✅ Successfully queried m_employees:', employees?.length || 0, 'rows')
    }
    
    // Test 3: Check RLS functions
    console.log('\n3. Testing RLS functions...')
    const { data: funcTest, error: funcError } = await supabase.rpc('is_superadmin')
    
    if (funcError) {
      console.error('❌ Error calling is_superadmin:', funcError)
    } else {
      console.log('✅ Successfully called is_superadmin:', funcTest)
    }
    
    console.log('\n✅ All tests completed!')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testConnection()
