'use server'

import { createClient } from '@/lib/supabase/server'
import type { Pegawai } from '@/lib/types/database.types'

/**
 * Server action to get pegawai with unit data
 */
export async function getPegawaiWithUnits(
  page: number = 1,
  pageSize: number = 50,
  searchTerm: string = ''
): Promise<{ data: Pegawai[]; count: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Verify user is superadmin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], count: 0, error: 'Tidak terautentikasi' }
    }
    
    // Check if user is superadmin from auth.users metadata
    const role = user.user_metadata?.role
    
    if (!role || role !== 'superadmin') {
      return { data: [], count: 0, error: 'Tidak memiliki akses' }
    }
    
    let query = supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id, tax_status, is_active, created_at, updated_at, m_units(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply search filter
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,employee_code.ilike.%${searchTerm}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: [], count: 0, error: error.message }
    }
    
    // Transform data to match Pegawai type
    const transformedData: Pegawai[] = (data || []).map((item: any) => ({
      id: item.id,
      employee_code: item.employee_code,
      full_name: item.full_name,
      unit_id: item.unit_id,
      tax_status: item.tax_status,
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
      m_units: Array.isArray(item.m_units) && item.m_units.length > 0 
        ? item.m_units[0] 
        : undefined
    }))
    
    return { data: transformedData, count: count || 0 }
  } catch (err: any) {
    console.error('getPegawaiWithUnits error:', err)
    return { data: [], count: 0, error: err.message }
  }
}
