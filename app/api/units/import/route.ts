import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    const role = user.user_metadata?.role
    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each row
    for (const row of data as any[]) {
      try {
        const code = row['Kode Unit']?.toString().trim()
        const name = row['Nama Unit']?.toString().trim()
        const proportion = parseFloat(row['Proporsi (%)']?.toString() || '0')
        const status = row['Status']?.toString().trim().toLowerCase()

        if (!code || !name) {
          results.failed++
          results.errors.push(`Baris dengan kode "${code || 'kosong'}": Kode dan Nama wajib diisi`)
          continue
        }

        // Check if unit exists
        const { data: existing } = await supabase
          .from('m_units')
          .select('id')
          .eq('code', code)
          .single()

        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('m_units')
            .update({
              name,
              proportion_percentage: proportion,
              is_active: status === 'aktif',
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) throw error
        } else {
          // Insert new
          const { error } = await supabase
            .from('m_units')
            .insert({
              code,
              name,
              proportion_percentage: proportion,
              is_active: status === 'aktif'
            })

          if (error) throw error
        }

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Baris "${row['Kode Unit']}": ${error.message}`)
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error importing units:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import units' },
      { status: 500 }
    )
  }
}
