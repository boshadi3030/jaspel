/**
 * Verification script for recent fixes
 * Run this to verify all fixes are working correctly
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function verifyFixes() {
  console.log('🔍 Verifying fixes...\n')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // 1. Check settings table
  console.log('1. Checking settings table...')
  const { data: settings, error: settingsError } = await supabase
    .from('t_settings')
    .select('key, value')
  
  if (settingsError) {
    console.error('❌ Settings table error:', settingsError.message)
    return
  }
  
  const settingsMap = new Map(settings?.map(s => [s.key, s.value]))
  
  // Check for required settings
  const requiredSettings = ['company_info', 'footer', 'tax_rates', 'calculation_params', 'session_timeout']
  let allSettingsPresent = true
  
  for (const key of requiredSettings) {
    if (settingsMap.has(key)) {
      console.log(`   ✅ ${key} exists`)
      if (key === 'company_info') {
        const companyInfo = settingsMap.get(key)
        if (companyInfo.appName) {
          console.log(`      - appName: ${companyInfo.appName}`)
        } else {
          console.log(`      ⚠️  appName not set`)
        }
      }
      if (key === 'footer') {
        const footer = settingsMap.get(key)
        console.log(`      - text: ${footer.text}`)
      }
    } else {
      console.log(`   ❌ ${key} missing`)
      allSettingsPresent = false
    }
  }
  
  if (!allSettingsPresent) {
    console.log('\n⚠️  Some settings are missing. Run the migration:')
    console.log('   npm run supabase:migration:apply add_footer_and_appname_settings')
    return
  }
  
  // 2. Check units table
  console.log('\n2. Checking units table...')
  const { data: units, error: unitsError } = await supabase
    .from('m_units')
    .select('id, name')
    .limit(1)
  
  if (unitsError) {
    console.error('❌ Units table error:', unitsError.message)
  } else if (units && units.length > 0) {
    console.log(`   ✅ Units table accessible (${units.length} unit found)`)
  } else {
    console.log('   ⚠️  No units found in database')
  }
  
  // 3. Check employees table
  console.log('\n3. Checking employees table...')
  const { data: employees, error: employeesError } = await supabase
    .from('m_employees')
    .select('id, full_name, email, role')
    .limit(1)
  
  if (employeesError) {
    console.error('❌ Employees table error:', employeesError.message)
  } else if (employees && employees.length > 0) {
    console.log(`   ✅ Employees table accessible (${employees.length} employee found)`)
  } else {
    console.log('   ⚠️  No employees found in database')
  }
  
  // 4. Check notifications table
  console.log('\n4. Checking notifications table...')
  const { data: notifications, error: notificationsError } = await supabase
    .from('t_notification')
    .select('id')
    .limit(1)
  
  if (notificationsError) {
    console.error('❌ Notifications table error:', notificationsError.message)
  } else {
    console.log('   ✅ Notifications table accessible')
  }
  
  console.log('\n✅ All verifications complete!')
  console.log('\n📝 Next steps:')
  console.log('   1. Start the development server: npm run dev')
  console.log('   2. Login to the application')
  console.log('   3. Check that sidebar menu appears')
  console.log('   4. Check that user name and unit appear at bottom of sidebar')
  console.log('   5. Check that footer appears at bottom of pages')
  console.log('   6. Go to Admin > Settings and update app name and footer')
  console.log('   7. Verify changes are saved and displayed')
}

verifyFixes().catch(console.error)
