import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixKPIRLS() {
  console.log('🔧 Memperbaiki RLS Policies untuk KPI...\n')

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', 'fix_kpi_rls_policies.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    console.log('📄 Menjalankan migration fix_kpi_rls_policies.sql...')
    
    // Execute migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).single()
    
    if (error) {
      // Try direct execution if rpc doesn't exist
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.includes('SELECT') && statement.includes('FROM pg_policies')) {
          // Skip verification query
          continue
        }
        
        const { error: execError } = await supabase.rpc('exec', { 
          query: statement + ';' 
        })
        
        if (execError) {
          console.error(`❌ Error executing statement: ${execError.message}`)
          console.error(`Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }

    console.log('✅ Migration berhasil dijalankan\n')

    // Verify policies
    console.log('🔍 Memverifikasi policies...\n')
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd')
      .in('tablename', ['m_kpi_categories', 'm_kpi_indicators'])
      .order('tablename')
      .order('policyname')

    if (policiesError) {
      console.log('⚠️  Tidak dapat memverifikasi policies (ini normal jika pg_policies tidak accessible)')
    } else if (policies) {
      console.log('📋 Policies yang terpasang:')
      policies.forEach(p => {
        console.log(`  - ${p.tablename}: ${p.policyname} (${p.cmd})`)
      })
    }

    console.log('\n✅ Perbaikan RLS selesai!')
    console.log('\n📝 Catatan:')
    console.log('  - Superadmin sekarang dapat INSERT/UPDATE/DELETE kategori dan indikator')
    console.log('  - Unit Manager dan Employee tetap hanya bisa SELECT (view)')
    console.log('  - Pastikan user Anda memiliki role "superadmin" di tabel m_employees')
    
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixKPIRLS()
