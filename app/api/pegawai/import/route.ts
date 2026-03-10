import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = user.user_metadata?.role
    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const row of data as any[]) {
      try {
        const employeeCode = row['Kode Pegawai']?.toString().trim()
        const nik = row['NIK']?.toString().trim()
        const fullName = row['Nama Lengkap']?.toString().trim()
        const unitCode = row['Kode Unit']?.toString().trim()
        const position = row['Jabatan']?.toString().trim()
        const email = row['Email']?.toString().trim().toLowerCase()
        const phone = row['Telepon']?.toString().trim()
        const address = row['Alamat']?.toString().trim()
        const taxStatus = row['Status Pajak']?.toString().trim() || 'TK/0'
        const bankName = row['Nama Bank']?.toString().trim()
        const bankAccountNumber = row['Nomor Rekening']?.toString().trim()
        const bankAccountName = row['Nama Pemilik Rekening']?.toString().trim()
        const roleStr = row['Role']?.toString().trim().toLowerCase()
        const status = row['Status']?.toString().trim().toLowerCase()

        if (!employeeCode || !fullName || !unitCode || !email || !roleStr) {
          results.failed++
          results.errors.push(`Baris "${employeeCode || 'kosong'}": Data wajib tidak lengkap`)
          continue
        }

        // Get unit_id from code
        const { data: unit, error: unitError } = await supabase
          .from('m_units')
          .select('id')
          .eq('code', unitCode)
          .single()

        if (unitError || !unit) {
          results.failed++
          results.errors.push(`Baris "${employeeCode}": Unit dengan kode "${unitCode}" tidak ditemukan`)
          continue
        }

        // Check if employee exists
        const { data: existing } = await supabase
          .from('m_employees')
          .select('id, user_id')
          .eq('employee_code', employeeCode)
          .single()

        const employeeData = {
          employee_code: employeeCode,
          nik: nik || null,
          full_name: fullName,
          unit_id: unit.id,
          position: position || null,
          email,
          phone: phone || null,
          address: address || null,
          tax_status: taxStatus,
          bank_name: bankName || null,
          bank_account_number: bankAccountNumber || null,
          bank_account_name: bankAccountName || null,
          role: roleStr,
          is_active: status === 'aktif',
          updated_at: new Date().toISOString()
        }

        if (existing) {
          // Update existing employee
          const { error } = await supabase
            .from('m_employees')
            .update(employeeData)
            .eq('id', existing.id)

          if (error) throw error

          // Update auth user metadata if user_id exists
          if (existing.user_id) {
            await supabase.auth.admin.updateUserById(existing.user_id, {
              email,
              user_metadata: {
                role: roleStr,
                full_name: fullName
              }
            })
          }
        } else {
          // Insert new employee
          const { error } = await supabase
            .from('m_employees')
            .insert(employeeData)

          if (error) throw error
        }

        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(`Baris "${row['Kode Pegawai']}": ${error.message}`)
      }
    }

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Error importing pegawai:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import pegawai' },
      { status: 500 }
    )
  }
}
