import { NextResponse } from 'next/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET() {
  try {
    const doc = new jsPDF()
    let yPos = 20

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('PANDUAN MANAJEMEN POOL', 105, yPos, { align: 'center' })
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistem JASPEL - Distribusi Insentif', 105, yPos, { align: 'center' })
    yPos += 15

    // 1. Konsep Pool
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('1. KONSEP POOL', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const intro = [
      'Pool adalah kumpulan dana untuk distribusi insentif pegawai',
      'dalam periode tertentu (bulanan).',
      '',
      'Komponen Pool:',
      '- Pendapatan: Sumber dana yang masuk',
      '- Potongan: Pengurangan dari pendapatan',
      '- Pool Bersih = Pendapatan - Potongan',
      '- Jumlah Dialokasikan = Pool Bersih x % Alokasi'
    ]
    intro.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // 2. Status Pool
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('2. STATUS POOL', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const rules = [
      'Draft: Pool baru, masih dapat diubah',
      '  - Item pendapatan/potongan dapat ditambah/dihapus',
      '',
      'Approved: Pool disetujui, tidak dapat diubah',
      '  - Siap untuk perhitungan distribusi',
      '',
      'Distributed: Pool sudah didistribusikan',
      '  - Perhitungan insentif selesai'
    ]
    rules.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // New page
    doc.addPage()
    yPos = 20

    // 3. Cara Membuat Pool
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('3. CARA MEMBUAT POOL', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const steps1 = [
      '1. Klik menu "Manajemen Pool"',
      '2. Klik tombol "Buat Pool"',
      '3. Isi Periode (YYYY-MM), contoh: 2024-01',
      '4. Isi Persentase Alokasi (default: 100%)',
      '5. Klik "Buat Pool"',
      '',
      'Pool dibuat dengan status Draft'
    ]
    steps1.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // 4. Mengelola Item
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('4. MENGELOLA ITEM PENDAPATAN & POTONGAN', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const steps2 = [
      'Menambah Item Pendapatan:',
      '1. Klik "Lihat" pada pool (status Draft)',
      '2. Di bagian "Item Pendapatan"',
      '3. Isi deskripsi dan jumlah',
      '4. Klik "Tambah"',
      '',
      'Menambah Item Potongan:',
      '1. Di bagian "Item Potongan"',
      '2. Isi deskripsi dan jumlah',
      '3. Klik "Tambah"',
      '',
      'Sistem otomatis menghitung:',
      '- Total Pendapatan',
      '- Total Potongan',
      '- Pool Bersih',
      '- Jumlah Dialokasikan'
    ]
    steps2.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // New page for calculation
    doc.addPage()
    yPos = 20

    // 5. Persetujuan Pool
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('5. PERSETUJUAN POOL', 20, yPos)
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const approval = [
      'Setelah semua item lengkap:',
      '1. Klik tombol "Setujui" (hijau)',
      '2. Konfirmasi persetujuan',
      '3. Status berubah menjadi "Approved"',
      '',
      'Setelah disetujui:',
      '- Pool tidak dapat diubah lagi',
      '- Siap untuk perhitungan distribusi',
      '- Tercatat user dan waktu persetujuan'
    ]
    approval.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 10

    // 6. Contoh Perhitungan
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('6. CONTOH PERHITUNGAN', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Pool Januari 2024:', 20, yPos)
    yPos += 8

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Jumlah']],
      body: [
        ['Total Pendapatan', 'Rp 700.000.000'],
        ['Total Potongan', 'Rp 180.000.000'],
        ['Pool Bersih', 'Rp 520.000.000'],
        ['Alokasi (100%)', 'Rp 520.000.000']
      ],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    doc.text('Distribusi ke Unit:', 20, yPos)
    yPos += 5

    autoTable(doc, {
      startY: yPos,
      head: [['Unit', 'Proporsi', 'Alokasi']],
      body: [
        ['Unit A', '40%', 'Rp 208.000.000'],
        ['Unit B', '35%', 'Rp 182.000.000'],
        ['Unit C', '25%', 'Rp 130.000.000']
      ],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [92, 184, 92] }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // 7. Formula
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('7. FORMULA PERHITUNGAN', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const formulas = [
      'Pool Bersih = Total Pendapatan - Total Potongan',
      '',
      'Jumlah Dialokasikan = Pool Bersih x % Alokasi',
      '',
      'Alokasi Unit = Jumlah Dialokasikan x % Proporsi Unit',
      '',
      'Insentif Pegawai = Alokasi Unit x (Skor Pegawai / Total Skor Unit)',
      '',
      'Pajak = Insentif Bruto x Tarif Pajak',
      '',
      'Insentif Neto = Insentif Bruto - Pajak'
    ]
    formulas.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Sistem JASPEL - Manajemen Pool', 105, 280, { align: 'center' })
    doc.text(new Date().toLocaleDateString('id-ID'), 105, 285, { align: 'center' })

    // Generate PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Panduan_Manajemen_Pool.pdf"'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Gagal membuat panduan PDF' },
      { status: 500 }
    )
  }
}
