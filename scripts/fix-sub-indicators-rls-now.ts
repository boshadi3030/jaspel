#!/usr/bin/env tsx

/**
 * Fix RLS policies for sub indicators immediately
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixSubIndicatorRLS() {
  console.log('🔧 Fixing Sub Indicator RLS Policies...\n')

  try {
    // Drop existing policies
    console.log('🗑️  Dropping existing policies...')
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Superadmin full access to sub indicators" ON m_kpi_sub_indicators;
        DROP POLICY IF EXISTS "Unit manager view sub indicators" ON m_kpi_sub_indicators;
        DROP POLICY IF EXISTS "Employee view sub indicators" ON m_kpi_sub_indicators;
      `
    })

    // Create new policies using m_employees table
    console.log('✨ Creating new RLS policies...')
    await supabase.rpc('exec_sql', {
      sql: `
        -- Superadmin: Full access to all sub indicators
        CREATE POLICY "Superadmin full access to sub indicators" ON m_kpi_sub_indicators
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM m_employees e
              WHERE e.user_id = auth.uid()
              AND e.role = 'superadmin'
              AND e.is_active = true
            )
          );

        -- Unit Manager: Can view sub indicators for their unit only
        CREATE POLICY "Unit manager view sub indicators" ON m_kpi_sub_indicators
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM m_employees e
              JOIN m_kpi_indicators i ON i.id = m_kpi_sub_indicators.indicator_id
              JOIN m_kpi_categories c ON c.id = i.category_id
              WHERE e.user_id = auth.uid()
              AND e.role = 'unit_manager'
              AND e.unit_id = c.unit_id
              AND e.is_active = true
            )
          );

        -- Employee: Can view sub indicators for their unit only
        CREATE POLICY "Employee view sub indicators" ON m_kpi_sub_indicators
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM m_employees e
              JOIN m_kpi_indicators i ON i.id = m_kpi_sub_indicators.indicator_id
              JOIN m_kpi_categories c ON c.id = i.category_id
              WHERE e.user_id = auth.uid()
              AND e.role = 'employee'
              AND e.unit_id = c.unit_id
              AND e.is_active = true
            )
          );
      `
    })

    console.log('✅ RLS policies updated successfully!')

    // Test access
    console.log('\n🧪 Testing sub indicator access...')
    const { data: subIndicators, error } = await supabase
      .from('m_kpi_sub_indicators')
      .select('*')
      .limit(5)

    if (error) {
      console.log('❌ Error accessing sub indicators:', error.message)
    } else {
      console.log(`✅ Successfully accessed ${subIndicators?.length || 0} sub indicators`)
    }

  } catch (error: any) {
    console.error('❌ Error fixing RLS policies:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting Sub Indicator RLS Fix\n')
  await fixSubIndicatorRLS()
  console.log('\n✅ Fix completed!')
}

if (require.main === module) {
  main().catch(console.error)
}