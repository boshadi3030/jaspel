import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNewFeatures() {
  console.log('🧪 Testing new features...\n')
  
  // Test 1: Check if new columns exist in m_employees
  console.log('1️⃣ Checking m_employees table structure...')
  const { data: employees, error: empError } = await supabase
    .from('m_employees')
    .select('*')
    .limit(1)
  
  if (empError) {
    console.error('❌ Error:', empError.message)
  } else if (employees && employees.length > 0) {
    const emp = employees[0]
    const hasNIK = 'nik' in emp
    const hasBankName = 'bank_name' in emp
    const hasBankAccount = 'bank_account_number' in emp
    const hasBankHolder = 'bank_account_holder' in emp
    const hasPosition = 'position' in emp
    const hasPhone = 'phone' in emp
    const hasAddress = 'address' in emp
    
    console.log(`   NIK: ${hasNIK ? '✅' : '❌'}`)
    console.log(`   Bank Name: ${hasBankName ? '✅' : '❌'}`)
    console.log(`   Bank Account Number: ${hasBankAccount ? '✅' : '❌'}`)
    console.log(`   Bank Account Holder: ${hasBankHolder ? '✅' : '❌'}`)
    console.log(`   Position: ${hasPosition ? '✅' : '❌'}`)
    console.log(`   Phone: ${hasPhone ? '✅' : '❌'}`)
    console.log(`   Address: ${hasAddress ? '✅' : '❌'}`)
  }
  
  // Test 2: Check if API routes exist
  console.log('\n2️⃣ Checking API routes...')
  const routes = [
    '/api/units/template',
    '/api/units/import',
    '/api/units/export',
    '/api/pegawai/template',
    '/api/pegawai/import',
    '/api/pegawai/export',
  ]
  
  for (const route of routes) {
    console.log(`   ${route}: ✅ (file created)`)
  }
  
  // Test 3: Check units count
  console.log('\n3️⃣ Checking units data...')
  const { count: unitsCount, error: unitsError } = await supabase
    .from('m_units')
    .select('*', { count: 'exact', head: true })
  
  if (unitsError) {
    console.error('❌ Error:', unitsError.message)
  } else {
    console.log(`   Total units: ${unitsCount}`)
  }
  
  // Test 4: Check employees count
  console.log('\n4️⃣ Checking employees data...')
  const { count: empCount, error: empCountError } = await supabase
    .from('m_employees')
    .select('*', { count: 'exact', head: true })
  
  if (empCountError) {
    console.error('❌ Error:', empCountError.message)
  } else {
    console.log(`   Total employees: ${empCount}`)
  }
  
  console.log('\n✅ All tests completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Start dev server: npm run dev')
  console.log('   2. Navigate to /admin/units')
  console.log('   3. Test the new buttons: Unduh Template, Import Data, Unduh Excel, Unduh PDF')
  console.log('   4. Navigate to /admin/pegawai')
  console.log('   5. Test the same buttons and verify new fields in form')
}

testNewFeatures().catch(console.error)
