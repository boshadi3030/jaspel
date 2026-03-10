import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkTableStructure() {
  console.log('🔍 Checking m_employees table structure...\n')
  
  try {
    // Get all columns by selecting everything
    const { data, error } = await supabase
      .from('m_employees')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('📋 Available columns in m_employees:')
      const columns = Object.keys(data[0])
      columns.forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]} = ${data[0][col]}`)
      })
    } else {
      console.log('⚠️  No data in m_employees table')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkTableStructure()
