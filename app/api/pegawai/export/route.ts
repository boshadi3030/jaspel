import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'excel'

    // Get all employees with unit info
    const { data: pegawai, error } = await supabase
      .from('m_employees')
      .select(`
        *,
        m_units (
          code,
          name
        )
      `)
      .order('employee_code', { ascending: true })

    if (error) throw error

    if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF('landscape')
      
      doc.setFontSize(16)
      doc.text('LAPORAN DATA PEGAWAI', 148, 15, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 148, 22, { align: 'center' })

      const tableData = (pegawai || []).map((p, index) => [
        index + 1,
        p.employee_code,
        p.nik || '-',
        p.full_name,
        p.m_units?.name || '-',
        p.position || '-',
        p.email,
        p.phone || '-',
        p.tax_status,
        p.bank_name || '-',
        p.bank_account_number || '-',
        p.is_active ? 'Aktif' : 'Nonaktif'
      ])

      autoTable(doc, {
        startY: 30,
        head: [['No', 'Kode', 'NIK', 'Nama', 'Unit', 'Jabatan', 'Email', 'Telepon', 'Pajak', 'Bank', 'No. Rek', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], fontSize: 8 },
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 35 },
          7: { cellWidth: 20 },
          8: { cellWidth: 15 },
          9: { cellWidth: 20 },
          10: { cellWidth: 20 },
          11: { cellWidth: 15 }
        }
      })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Laporan_Pegawai_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } else {
      // Generate Excel
      const excelData = (pegawai || []).map((p, index) => ({
        'No': index + 1,
        'Kode Pegawai': p.employee_code,
        'NIK': p.nik || '',
        'Nama Lengkap': p.full_name,
        'Kode Unit': p.m_units?.code || '',
        'Nama Unit': p.m_units?.name || '',
        'Jabatan': p.position || '',
        'Email': p.email,
        'Telepon': p.phone || '',
        'Alamat': p.address || '',
        'Status Pajak': p.tax_status,
        'Nama Bank': p.bank_name || '',
        'Nomor Rekening': p.bank_account_number || '',
        'Nama Pemilik Rekening': p.bank_account_name || '',
        'Role': p.role,
        'Status': p.is_active ? 'Aktif' : 'Nonaktif',
        'Dibuat': new Date(p.created_at).toLocaleDateString('id-ID'),
        'Diperbarui': new Date(p.updated_at).toLocaleDateString('id-ID')
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      ws['!cols'] = [
        { wch: 5 },  // No
        { wch: 15 }, // Kode Pegawai
        { wch: 18 }, // NIK
        { wch: 25 }, // Nama Lengkap
        { wch: 12 }, // Kode Unit
        { wch: 25 }, // Nama Unit
        { wch: 25 }, // Jabatan
        { wch: 30 }, // Email
        { wch: 15 }, // Telepon
        { wch: 40 }, // Alamat
        { wch: 12 }, // Status Pajak
        { wch: 15 }, // Nama Bank
        { wch: 18 }, // Nomor Rekening
        { wch: 25 }, // Nama Pemilik Rekening
        { wch: 15 }, // Role
        { wch: 10 }, // Status
        { wch: 15 }, // Dibuat
        { wch: 15 }  // Diperbarui
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Data Pegawai')

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Pegawai_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }
  } catch (error: any) {
    console.error('Error exporting pegawai:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export pegawai' },
      { status: 500 }
    )
  }
}
