import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'excel'

    // Get all units with employee count
    const { data: units, error } = await supabase
      .from('m_units')
      .select('*')
      .order('code', { ascending: true })

    if (error) throw error

    // Get employee counts
    const unitsWithCounts = await Promise.all(
      (units || []).map(async (unit) => {
        const { count } = await supabase
          .from('m_employees')
          .select('*', { count: 'exact', head: true })
          .eq('unit_id', unit.id)
        
        return {
          ...unit,
          employee_count: count || 0
        }
      })
    )

    if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(16)
      doc.text('LAPORAN DATA UNIT', 105, 15, { align: 'center' })
      
      doc.setFontSize(10)
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, 22, { align: 'center' })

      // Table
      const tableData = unitsWithCounts.map((unit, index) => [
        index + 1,
        unit.code,
        unit.name,
        `${unit.proportion_percentage.toFixed(2)}%`,
        unit.employee_count,
        unit.is_active ? 'Aktif' : 'Nonaktif'
      ])

      autoTable(doc, {
        startY: 30,
        head: [['No', 'Kode Unit', 'Nama Unit', 'Proporsi', 'Jumlah Pegawai', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      })

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Laporan_Unit_${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
    } else {
      // Generate Excel
      const excelData = unitsWithCounts.map((unit, index) => ({
        'No': index + 1,
        'Kode Unit': unit.code,
        'Nama Unit': unit.name,
        'Proporsi (%)': unit.proportion_percentage.toFixed(2),
        'Jumlah Pegawai': unit.employee_count,
        'Status': unit.is_active ? 'Aktif' : 'Nonaktif',
        'Dibuat': new Date(unit.created_at).toLocaleDateString('id-ID'),
        'Diperbarui': new Date(unit.updated_at).toLocaleDateString('id-ID')
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(excelData)

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 30 },
        { wch: 12 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Data Unit')

      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Laporan_Unit_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }
  } catch (error: any) {
    console.error('Error exporting units:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export units' },
      { status: 500 }
    )
  }
}
