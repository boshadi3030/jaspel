/**
 * Verify User - Check if user exists in Supabase Auth and Database
 * 
 * Usage: npx tsx scripts/verify-user.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Environment variables tidak lengkap')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function verifyUser() {
  const email = 'mukhsin9@gmail.com'
  
  console.log('🔍 Memeriksa user:', email)
  console.log('=' .repeat(60))

  try {
    // 1. Check Auth Users
    console.log('\n1️⃣ Checking Supabase Auth...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error mengakses Auth:', authError.message)
      return
    }

    const authUser = authUsers.users.find(u => u.email === email)
    
    if (authUser) {
      console.log('✅ User ditemukan di Auth')
      console.log('   User ID:', authUser.id)
      console.log('   Email:', authUser.email)
      console.log('   Email Confirmed:', authUser.email_confirmed_at ? '✓' : '✗')
      console.log('   Created:', authUser.created_at)
    } else {
      console.log('❌ User TIDAK ditemukan di Auth')
      console.log('   Total users di Auth:', authUsers.users.length)
      console.log('\n📝 Users yang ada:')
      authUsers.users.forEach(u => {
        console.log(`   - ${u.email} (${u.id})`)
      })
    }

    // 2. Check Database
    console.log('\n2️⃣ Checking Database (m_employees)...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('*, m_units(name)')
      .eq('email', email)
      .single()

    if (empError) {
      if (empError.code === 'PGRST116') {
        console.log('❌ Employee TIDAK ditemukan di database')
      } else {
        console.error('❌ Error:', empError.message)
      }
    } else {
      console.log('✅ Employee ditemukan di database')
      console.log('   Employee Code:', employee.employee_code)
      console.log('   Full Name:', employee.full_name)
      console.log('   Email:', employee.email)
      console.log('   Role:', employee.role)
      console.log('   Unit:', employee.m_units?.name)
      console.log('   Active:', employee.is_active ? '✓' : '✗')
    }

    // 3. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 SUMMARY')
    console.log('='.repeat(60))
    
    if (authUser && employee) {
      console.log('✅ Setup LENGKAP - User siap login')
    } else if (!authUser && !employee) {
      console.log('❌ Setup BELUM DILAKUKAN')
      console.log('\n💡 Solusi: Jalankan script setup-auth.ts')
      console.log('   npx tsx scripts/setup-auth.ts')
    } else if (!authUser && employee) {
      console.log('⚠️  Employee ada di database tapi TIDAK ada di Auth')
      console.log('\n💡 Solusi: Buat user manual di Supabase Dashboard')
      console.log('   1. Buka: https://supabase.com/dashboard')
      console.log('   2. Authentication → Users → Add user')
      console.log('   3. Email:', email)
      console.log('   4. Password: [pilih password]')
      console.log('   5. ✓ Auto Confirm User')
    } else if (authUser && !employee) {
      console.log('⚠️  User ada di Auth tapi TIDAK ada di database')
      console.log('\n💡 Solusi: Jalankan SQL di Supabase SQL Editor')
      console.log(`
INSERT INTO m_units (code, name, proportion_percentage) VALUES
('IT', 'Information Technology', 25.00)
ON CONFLICT (code) DO NOTHING;

INSERT INTO m_employees (
  employee_code, full_name, unit_id, role, email, tax_status, is_active
) VALUES (
  'SA001', 'Mukhsin', 
  (SELECT id FROM m_units WHERE code = 'IT'),
  'superadmin', '${email}', 'TK/0', true
)
ON CONFLICT (email) DO UPDATE SET
  role = 'superadmin', is_active = true;
      `)
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  }
}

verifyUser()
