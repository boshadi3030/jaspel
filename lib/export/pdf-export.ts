import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatPercentage } from '@/lib/formulas/kpi-calculator'

interface IncentiveSlipData {
  period: string
  employeeCode: string
  employeeName: string
  unit: string
  taxStatus: string
  p1Score: number
  p2Score: number
  p3Score: number
  p1Weighted: number
  p2Weighted: number
  p3Weighted: number
  finalScore: number
  grossIncentive: number
  taxAmount: number
  netIncentive: number
  indicators?: Array<{
    category: string
    name: string
    target: number
    realization: number
    achievement: number
    score: number
  }>
}

/**
 * Generate incentive slip PDF
 */
export function generateIncentiveSlipPDF(data: IncentiveSlipData) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SLIP INSENTIF KARYAWAN', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periode: ${data.period}`, 105, 28, { align: 'center' })
  
  // Employee Info
  doc.setFontSize(10)
  let yPos = 40
  
  doc.setFont('helvetica', 'bold')
  doc.text('Informasi Karyawan', 14, yPos)
  yPos += 7
  
  doc.setFont('helvetica', 'normal')
  doc.text(`Kode Karyawan: ${data.employeeCode}`, 14, yPos)
  yPos += 5
  doc.text(`Nama: ${data.employeeName}`, 14, yPos)
  yPos += 5
  doc.text(`Unit: ${data.unit}`, 14, yPos)
  yPos += 5
  doc.text(`Status Pajak: ${data.taxStatus}`, 14, yPos)
  yPos += 10
  
  // KPI Scores
  doc.setFont('helvetica', 'bold')
  doc.text('Skor KPI', 14, yPos)
  yPos += 7
  
  const kpiData = [
    ['P1 (Position)', data.p1Score.toFixed(2), data.p1Weighted.toFixed(2)],
    ['P2 (Performance)', data.p2Score.toFixed(2), data.p2Weighted.toFixed(2)],
    ['P3 (Behavior)', data.p3Score.toFixed(2), data.p3Weighted.toFixed(2)],
    ['Total', '', data.finalScore.toFixed(2)]
  ]
  
  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Skor', 'Skor Tertimbang']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 50, halign: 'right' }
    }
  })
  
  yPos = (doc as any).lastAutoTable.finalY + 10
  
  // Detailed Indicators (if provided)
  if (data.indicators && data.indicators.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.text('Detail Indikator', 14, yPos)
    yPos += 7
    
    const indicatorData = data.indicators.map(ind => [
      ind.category,
      ind.name,
      ind.target.toFixed(2),
      ind.realization.toFixed(2),
      formatPercentage(ind.achievement),
      ind.score.toFixed(2)
    ])
    
    autoTable(doc, {
      startY: yPos,
      head: [['Kategori', 'Indikator', 'Target', 'Realisasi', 'Pencapaian', 'Skor']],
      body: indicatorData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    })
    
    yPos = (doc as any).lastAutoTable.finalY + 10
  }
  
  // Financial Summary
  doc.setFont('helvetica', 'bold')
  doc.text('Rincian Insentif', 14, yPos)
  yPos += 7
  
  const financialData = [
    ['Insentif Bruto', formatCurrency(data.grossIncentive)],
    ['Pajak PPh 21', `(${formatCurrency(data.taxAmount)})`],
    ['Insentif Netto', formatCurrency(data.netIncentive)]
  ]
  
  autoTable(doc, {
    startY: yPos,
    body: financialData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'bold' },
      1: { cellWidth: 80, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 12
        data.cell.styles.textColor = [0, 128, 0]
      }
    }
  })
  
  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Dokumen ini dibuat secara otomatis oleh sistem JASPEL', 105, pageHeight - 15, { align: 'center' })
  doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 105, pageHeight - 10, { align: 'center' })
  
  // Save PDF
  doc.save(`slip-insentif-${data.employeeCode}-${data.period}.pdf`)
}

/**
 * Generate summary report PDF for all employees
 */
export function generateSummaryReportPDF(
  results: Array<{
    employeeCode: string
    employeeName: string
    unit: string
    finalScore: number
    grossIncentive: number
    taxAmount: number
    netIncentive: number
  }>,
  period: string
) {
  const doc = new jsPDF('landscape')
  
  // Header
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN REKAPITULASI INSENTIF', 148, 15, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Periode: ${period}`, 148, 22, { align: 'center' })
  
  // Summary Table
  const tableData = results.map((r, index) => [
    (index + 1).toString(),
    r.employeeCode,
    r.employeeName,
    r.unit,
    r.finalScore.toFixed(2),
    formatCurrency(r.grossIncentive),
    formatCurrency(r.taxAmount),
    formatCurrency(r.netIncentive)
  ])
  
  // Calculate totals
  const totalGross = results.reduce((sum, r) => sum + r.grossIncentive, 0)
  const totalTax = results.reduce((sum, r) => sum + r.taxAmount, 0)
  const totalNet = results.reduce((sum, r) => sum + r.netIncentive, 0)
  
  tableData.push([
    '',
    '',
    '',
    'TOTAL',
    '',
    formatCurrency(totalGross),
    formatCurrency(totalTax),
    formatCurrency(totalNet)
  ])
  
  autoTable(doc, {
    startY: 30,
    head: [['No', 'Kode', 'Nama', 'Unit', 'Skor', 'Bruto', 'Pajak', 'Netto']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 35, halign: 'right' },
      6: { cellWidth: 35, halign: 'right' },
      7: { cellWidth: 35, halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fillColor = [240, 240, 240]
      }
    }
  })
  
  // Footer
  const pageHeight = doc.internal.pageSize.height
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Dokumen ini dibuat secara otomatis oleh sistem JASPEL', 148, pageHeight - 10, { align: 'center' })
  
  // Save PDF
  doc.save(`rekapitulasi-insentif-${period}.pdf`)
}


interface ReportExportOptions {
  reportType: string
  period: string
  data: any[]
}

/**
 * Export report to PDF with formatting
 * Requirements: 12.6
 */
export async function exportToPDF(options: ReportExportOptions): Promise<Buffer> {
  const { reportType, period, data } = options

  const doc = new jsPDF()

  // Header with company logo placeholder
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  
  let title = ''
  switch (reportType) {
    case 'incentive':
      title = 'INCENTIVE REPORT'
      break
    case 'kpi-achievement':
      title = 'KPI ACHIEVEMENT REPORT'
      break
    case 'unit-comparison':
      title = 'UNIT COMPARISON REPORT'
      break
    case 'employee-slip':
      title = 'EMPLOYEE SLIP REPORT'
      break
  }

  doc.text(title, 105, 20, { align: 'center' })

  // Generation date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const now = new Date()
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  doc.text(`Period: ${period}`, 105, 28, { align: 'center' })
  doc.text(`Generated: ${dateStr}`, 105, 34, { align: 'center' })

  // Prepare table data based on report type
  let headers: string[] = []
  let body: any[][] = []

  switch (reportType) {
    case 'incentive':
      headers = ['Employee', 'Unit', 'P1', 'P2', 'P3', 'Gross', 'Tax', 'Net']
      body = data.map((row: any) => [
        row.employee_name,
        row.unit,
        row.p1_score,
        row.p2_score,
        row.p3_score,
        row.gross_incentive,
        row.tax_amount,
        row.net_incentive,
      ])
      break

    case 'kpi-achievement':
      headers = ['Indicator', 'Target', 'Realization', 'Achievement']
      body = data.map((row: any) => [
        row.indicator_name,
        row.target_value,
        row.realization_value,
        row.achievement_percentage,
      ])
      break

    case 'unit-comparison':
      headers = ['Unit', 'Avg Score', 'Total Incentive', 'Employees']
      body = data.map((row: any) => [
        row.unit_name,
        row.average_score,
        row.total_incentive,
        row.employee_count,
      ])
      break

    case 'employee-slip':
      headers = ['Employee', 'P1', 'P2', 'P3', 'Gross', 'Tax', 'Net']
      body = data.map((row: any) => [
        row.employee_name,
        row.p1_score,
        row.p2_score,
        row.p3_score,
        row.gross_incentive,
        row.tax_amount,
        row.net_incentive,
      ])
      break
  }

  // Generate table
  autoTable(doc, {
    startY: 40,
    head: [headers],
    body: body,
    theme: 'grid',
    headStyles: {
      fillColor: [66, 139, 202],
      fontSize: 10,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
  })

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}
