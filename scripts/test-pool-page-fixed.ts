import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testPoolPageFixed() {
  console.log('🔍 Testing Pool Page After RLS Fix\n')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Login as superadmin
    console.log('1. Login sebagai superadmin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'mukhsin9@gmail.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Login gagal:', authError.message)
      return
    }
    console.log('✅ Login berhasil')
    
    // Test 2: Check user metadata
    console.log('\n2. Memeriksa user metadata...')
    const { data: { user } } = await supabase.auth.getUser()
    console.log('User ID:', user?.id)
    console.log('Email:', user?.email)
    console.log('Role dari metadata:', user?.user_metadata?.role)
    
    // Test 3: Get employee data
    console.log('\n3. Mengambil data employee...')
    const { data: employee, error: empError } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id')
      .eq('user_id', user?.id)
      .single()
    
    if (empError) {
      console.error('❌ Gagal ambil employee:', empError.message)
    } else {
      console.log('✅ Employee data:', employee)
    }
    
    // Test 4: Query pool table
    console.log('\n4. Query tabel pool...')
    const { data: pools, error: poolError } = await supabase
      .from('t_pool')
      .select('*')
      .order('period', { ascending: false })
      .limit(5)
    
    if (poolError) {
      console.error('❌ Query pool gagal:', poolError.message)
      console.error('Detail:', poolError)
    } else {
      console.log(`✅ Berhasil query pool: ${pools?.length || 0} records`)
      if (pools && pools.length > 0) {
        console.log('Sample:', pools[0])
      }
    }
    
    // Test 5: Test RLS functions
    console.log('\n5. Testing RLS functions...')
    const { data: rlsTest, error: rlsError } = await supabase.rpc('is_superadmin')
    
    if (rlsError) {
      console.error('❌ RLS function error:', rlsError.message)
    } else {
      console.log('✅ is_superadmin():', rlsTest)
    }
    
    console.log('\n✅ Semua test berhasil! Halaman pool seharusnya bisa diakses sekarang.')
    console.log('\n📝 Silakan refresh browser dan coba akses halaman pool lagi.')
    
  } catch (error: any) {
    console.error('❌ Test error:', error.message)
  }
}

testPoolPageFixed()
