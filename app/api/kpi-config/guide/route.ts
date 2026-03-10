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
    doc.text('PANDUAN KONFIGURASI KPI', 105, yPos, { align: 'center' })
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistem JASPEL - Struktur KPI', 105, yPos, { align: 'center' })
    yPos += 15

    // 1. Konsep KPI
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('1. KONSEP STRUKTUR KPI', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const intro = [
      'KPI (Key Performance Indicator) adalah indikator kinerja yang',
      'digunakan untuk mengukur pencapaian pegawai.',
      '',
      'Struktur KPI terdiri dari:',
      '- Kategori: P1 (Posisi), P2 (Kinerja), P3 (Perilaku)',
      '- Indikator: Ukuran spesifik dalam setiap kategori',
      '- Bobot: Persentase kontribusi terhadap total skor',
      '- Target: Nilai yang harus dicapai'
    ]
    intro.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // 2. Kategori KPI
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('2. KATEGORI KPI', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const rules = [
      'P1 (Posisi): Indikator berbasis job description',
      '  - Tugas dan tanggung jawab jabatan',
      '  - Bobot total: 40-50%',
      '',
      'P2 (Kinerja): Indikator berbasis output/hasil',
      '  - Target kuantitatif yang terukur',
      '  - Bobot total: 30-40%',
      '',
      'P3 (Perilaku): Indikator kompetensi dan perilaku',
      '  - Soft skills dan attitude',
      '  - Bobot total: 20-30%'
    ]
    rules.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // New page
    doc.addPage()
    yPos = 20

    // 3. Cara Membuat Kategori
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('3. CARA MEMBUAT KATEGORI', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const steps1 = [
      '1. Pilih unit dari dropdown',
      '2. Klik tombol "Tambah Kategori"',
      '3. Pilih kategori (P1/P2/P3)',
      '4. Isi nama kategori',
      '5. Isi bobot persentase (total harus 100%)',
      '6. Isi deskripsi (opsional)',
      '7. Klik "Simpan"'
    ]
    steps1.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // 4. Mengelola Indikator
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('4. MENGELOLA INDIKATOR', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const steps2 = [
      'Menambah Indikator:',
      '1. Klik tombol "+" pada kategori',
      '2. Isi kode indikator (contoh: P1.1)',
      '3. Isi nama indikator',
      '4. Isi target nilai',
      '5. Isi bobot persentase',
      '6. Isi satuan pengukuran',
      '7. Isi deskripsi (opsional)',
      '8. Klik "Simpan"',
      '',
      'Mengedit Indikator:',
      '1. Klik tombol edit pada indikator',
      '2. Ubah data yang diperlukan',
      '3. Klik "Simpan"',
      '',
      'Menghapus Indikator:',
      '1. Klik tombol hapus pada indikator',
      '2. Konfirmasi penghapusan'
    ]
    steps2.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 5

    // New page for calculation
    doc.addPage()
    yPos = 20

    // 5. Salin Struktur
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('5. SALIN STRUKTUR KPI', 20, yPos)
    yPos += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    const approval = [
      'Untuk menyalin struktur KPI dari satu unit ke unit lain:',
      '1. Klik tombol "Salin Struktur"',
      '2. Pilih unit sumber (yang akan disalin)',
      '3. Pilih unit tujuan (yang akan menerima)',
      '4. Klik "Salin"',
      '',
      'Catatan:',
      '- Struktur yang ada di unit tujuan akan ditimpa',
      '- Semua kategori dan indikator akan disalin',
      '- Bobot akan sama dengan unit sumber'
    ]
    approval.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })
    yPos += 10

    // 6. Contoh Struktur
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('6. CONTOH STRUKTUR KPI', 20, yPos)
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Unit: Instalasi Rawat Jalan', 20, yPos)
    yPos += 8

    autoTable(doc, {
      startY: yPos,
      head: [['Kategori', 'Bobot', 'Indikator', 'Target']],
      body: [
        ['P1 - Posisi', '45%', 'Ketepatan waktu pelayanan', '95%'],
        ['', '', 'Kelengkapan dokumentasi', '100%'],
        ['P2 - Kinerja', '35%', 'Jumlah pasien dilayani', '500/bulan'],
        ['', '', 'Tingkat kepuasan pasien', '90%'],
        ['P3 - Perilaku', '20%', 'Kerjasama tim', '4.5/5'],
        ['', '', 'Komunikasi efektif', '4.5/5']
      ],
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
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
      'Skor Indikator = (Realisasi / Target) x 100',
      '',
      'Skor Kategori = Σ (Skor Indikator x Bobot Indikator)',
      '',
      'Skor Total = Σ (Skor Kategori x Bobot Kategori)',
      '',
      'Contoh:',
      'P1 = 90 x 45% = 40.5',
      'P2 = 85 x 35% = 29.75',
      'P3 = 95 x 20% = 19',
      'Total = 89.25'
    ]
    formulas.forEach(line => {
      doc.text(line, 20, yPos)
      yPos += 5
    })

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Sistem JASPEL - Konfigurasi KPI', 105, 280, { align: 'center' })
    doc.text(new Date().toLocaleDateString('id-ID'), 105, 285, { align: 'center' })

    // Generate PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Panduan_Konfigurasi_KPI.pdf"'
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
