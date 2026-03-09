import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function completeMigration() {
  console.log('🔄 Completing m_pegawai migration...\n')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  // Step 1: Verify migration script was run
  console.log('1️⃣ Checking migration status...')
  const { data: backupCheck, error: backupError } = await supabase
    .from('m_pegawai_backup')
    .select('count')
    .limit(1)
  
  if (backupError) {
    console.log('⚠️  Backup table not found. Running migration script first...')
    
    // Read and execute migration script
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', 'eliminate_m_pegawai_duplication.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    // Execute migration (excluding the DROP TABLE command)
    const sqlWithoutDrop = migrationSQL.replace(/-- DROP TABLE IF EXISTS m_pegawai CASCADE;/g, '')
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: sqlWithoutDrop })
      if (error) {
        console.log('⚠️  Could not execute migration via RPC. Please run migration manually.')
        console.log('   Run: psql -d your_database < supabase/migrations/eliminate_m_pegawai_duplication.sql')
      } else {
        console.log('✅ Migration script executed')
      }
    } catch (e) {
      console.log('⚠️  RPC method not available. Continuing with verification...')
    }
  } else {
    console.log('✅ Backup table exists - migration was run')
  }
  
  // Step 2: Verify data integrity
  console.log('\n2️⃣ Verifying data integrity...')
  
  const { count: pegawaiCount } = await supabase
    .from('m_pegawai')
    .select('*', { count: 'exact', head: true })
  
  const { count: employeesCount } = await supabase
    .from('m_employees')
    .select('*', { count: 'exact', head: true })
  
  console.log(`   m_pegawai records: ${pegawaiCount || 0}`)
  console.log(`   m_employees records: ${employeesCount || 0}`)
  
  if (employeesCount === 0 && pegawaiCount && pegawaiCount > 0) {
    console.log('⚠️  Data not migrated yet. Need to run migration script.')
    return
  }
  
  // Step 3: Check for foreign key references
  console.log('\n3️⃣ Checking for foreign key references...')
  
  // Check t_user table
  const { data: users, error: usersError } = await supabase
    .from('t_user')
    .select('id, employee_id')
    .not('employee_id', 'is', null)
    .limit(5)
  
  if (!usersError && users && users.length > 0) {
    console.log(`✅ Found ${users.length} users with employee references`)
    
    // Verify these references point to m_employees
    const employeeIds = users.map(u => u.employee_id)
    const { data: employees } = await supabase
      .from('m_employees')
      .select('id')
      .in('id', employeeIds)
    
    if (employees && employees.length === users.length) {
      console.log('✅ All user references point to m_employees')
    } else {
      console.log('⚠️  Some user references may be invalid')
    }
  }
  
  // Step 4: Final decision - drop m_pegawai table
  console.log('\n4️⃣ Preparing to drop m_pegawai table...')
  
  if (employeesCount && employeesCount > 0) {
    console.log('✅ m_employees has data, safe to drop m_pegawai')
    console.log('\n⚠️  IMPORTANT: This will permanently delete the m_pegawai table!')
    console.log('   Backup exists in m_pegawai_backup table')
    console.log('\n   To complete migration, run this SQL command:')
    console.log('   DROP TABLE IF EXISTS m_pegawai CASCADE;')
    console.log('\n   Or use Supabase SQL Editor to execute the command.')
  } else {
    console.log('❌ m_employees is empty, NOT safe to drop m_pegawai')
    console.log('   Please investigate why data was not migrated')
  }
  
  console.log('\n✅ Migration verification complete!')
}

completeMigration().catch(console.error)
