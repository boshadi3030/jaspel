import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...\n')

  // Check if m_pegawai table exists
  const { data: pegawaiExists, error: pegawaiError } = await supabase
    .from('m_pegawai')
    .select('count')
    .limit(1)

  if (pegawaiError && pegawaiError.code === '42P01') {
    console.log('✅ m_pegawai table does not exist (migration complete)')
  } else if (!pegawaiError) {
    const { count } = await supabase
      .from('m_pegawai')
      .select('*', { count: 'exact', head: true })
    console.log(`⚠️  m_pegawai table still exists with ${count} records`)
  }

  // Check if m_pegawai_backup exists
  const { data: backupExists, error: backupError } = await supabase
    .from('m_pegawai_backup')
    .select('count')
    .limit(1)

  if (backupError && backupError.code === '42P01') {
    console.log('⚠️  m_pegawai_backup table does not exist (migration not run)')
  } else if (!backupError) {
    const { count } = await supabase
      .from('m_pegawai_backup')
      .select('*', { count: 'exact', head: true })
    console.log(`✅ m_pegawai_backup table exists with ${count} records`)
  }

  // Check m_employees count
  const { count: employeesCount } = await supabase
    .from('m_employees')
    .select('*', { count: 'exact', head: true })
  console.log(`📊 m_employees table has ${employeesCount} records`)

  // Try to call verification function
  const { data: verifyData, error: verifyError } = await supabase
    .rpc('verify_pegawai_migration')

  if (verifyError) {
    console.log('\n⚠️  Verification function not available (migration not run)')
  } else {
    console.log('\n📋 Migration verification results:')
    console.table(verifyData)
  }
}

checkMigrationStatus().catch(console.error)
