# API Documentation - JASPEL System

## Overview

JASPEL menggunakan Next.js 15 Server Actions untuk semua operasi backend. Semua actions dilindungi dengan Row Level Security (RLS) di level database.

## Authentication

Semua API calls memerlukan authenticated user melalui Supabase Auth. User session dikelola otomatis oleh middleware.

## Core Services

### 1. Calculation Service

Location: `services/calculation.service.ts`

#### calculateIndividualScores(period: string)

Menghitung skor individu (P1, P2, P3) untuk semua karyawan dalam periode tertentu.

**Parameters:**
- `period` (string): Format YYYY-MM (contoh: "2024-03")

**Returns:**
```typescript
Array<{
  employee_id: string
  p1Score: Decimal
  p2Score: Decimal
  p3Score: Decimal
  p1Weighted: Decimal
  p2Weighted: Decimal
  p3Weighted: Decimal
  totalIndividualScore: Decimal
}>
```

**Process:**
1. Ambil semua karyawan aktif
2. Untuk setiap karyawan:
   - Ambil realisasi KPI per indikator
   - Group by kategori (P1, P2, P3)
   - Hitung achievement percentage per indikator
   - Hitung weighted score per indikator
   - Aggregate score per kategori
   - Hitung total individual score dengan bobot kategori
3. Simpan ke `t_individual_scores`

**Example:**
```typescript
const results = await calculateIndividualScores('2024-03')
```

---

#### calculateFinalDistribution(period: string)

Menghitung distribusi final insentif untuk semua karyawan.

**Parameters:**
- `period` (string): Format YYYY-MM

**Returns:**
```typescript
Array<{
  employee_id: string
  gross_incentive: number
  tax_amount: number
  net_incentive: number
}>
```

**Process:**
1. Ambil pool data untuk periode
2. Untuk setiap unit:
   - Hitung alokasi unit dari pool
   - Ambil semua karyawan dengan skor individual
   - Hitung total skor unit
   - Distribusi alokasi unit berdasarkan proporsi skor
   - Hitung pajak PPh 21
   - Hitung insentif netto
3. Simpan ke `t_calculation_results`

**Example:**
```typescript
const results = await calculateFinalDistribution('2024-03')
```

---

#### runFullCalculation(period: string)

Menjalankan pipeline kalkulasi lengkap.

**Parameters:**
- `period` (string): Format YYYY-MM

**Returns:**
```typescript
{
  success: boolean
  message: string
}
```

**Process:**
1. Jalankan `calculateIndividualScores()`
2. Jalankan `calculateFinalDistribution()`
3. Return status

**Example:**
```typescript
const result = await runFullCalculation('2024-03')
if (result.success) {
  console.log('Calculation completed')
}
```

---

### 2. KPI Calculator Library

Location: `lib/formulas/kpi-calculator.ts`

#### calculateIndividualScore()

```typescript
function calculateIndividualScore(
  p1Score: number,
  p2Score: number,
  p3Score: number,
  weights: { p1: number; p2: number; p3: number }
): IndividualScores
```

**Formula:**
```
Individual Score = (W_p1 × Score_P1) + (W_p2 × Score_P2) + (W_p3 × Score_P3)
```

---

#### calculateFinalScore()

```typescript
function calculateFinalScore(
  unitScore: number,
  individualScore: number,
  unitWeight: number,
  individualWeight: number
): FinalScore
```

**Formula:**
```
Final Score = (W_unit × Score_unit) + (W_individual × Score_individual)
```

---

#### calculatePoolAllocation()

```typescript
function calculatePoolAllocation(
  revenue: number,
  deductions: number,
  globalAllocationPercentage: number
): { netPool: Decimal; allocatedAmount: Decimal }
```

**Formula:**
```
Net Pool = Revenue - Deductions
Allocated Amount = Net Pool × Global Allocation %
```

---

#### calculateUnitAllocation()

```typescript
function calculateUnitAllocation(
  allocatedAmount: number,
  unitProportionPercentage: number
): Decimal
```

**Formula:**
```
Unit Allocation = Allocated Amount × Unit Proportion %
```

---

#### calculateIndividualIncentive()

```typescript
function calculateIndividualIncentive(
  unitAllocation: number,
  employeeFinalScore: number,
  totalUnitScores: number
): { proportion: Decimal; grossIncentive: Decimal }
```

**Formula:**
```
Proportion = Employee Score / Total Unit Scores
Gross Incentive = Unit Allocation × Proportion
```

---

#### calculatePPh21TER()

```typescript
function calculatePPh21TER(
  grossIncome: number,
  taxStatus: string = 'TK/0'
): Decimal
```

Menghitung PPh 21 menggunakan metode TER (Tarif Efektif Rata-rata).

**Tax Rates:**
- TK/0: 5%
- TK/1: 4.5%
- TK/2: 4%
- TK/3: 3.5%
- K/0: 4.5%
- K/1: 4%
- K/2: 3.5%
- K/3: 3%

---

#### calculateNetIncentive()

```typescript
function calculateNetIncentive(
  grossIncentive: number,
  taxStatus: string = 'TK/0'
): IncentiveDistribution
```

**Formula:**
```
Net Incentive = Gross Incentive - Tax Amount
```

---

### 3. Export Services

#### Excel Export

Location: `lib/export/excel-export.ts`

##### exportToExcel()

```typescript
function exportToExcel({
  headers: string[],
  data: any[][],
  sheetName?: string,
  fileName?: string
}): void
```

##### exportKPITemplate()

```typescript
function exportKPITemplate(
  employees: Array<{ code: string; name: string }>,
  indicators: Array<{ code: string; name: string; target: number }>
): void
```

Menghasilkan template Excel untuk bulk import realisasi KPI.

##### exportCalculationResults()

```typescript
function exportCalculationResults(
  results: Array<{...}>,
  period: string
): void
```

Export hasil kalkulasi ke Excel.

##### parseExcelFile()

```typescript
async function parseExcelFile(file: File): Promise<any[]>
```

Parse Excel file untuk bulk import.

---

#### PDF Export

Location: `lib/export/pdf-export.ts`

##### generateIncentiveSlipPDF()

```typescript
function generateIncentiveSlipPDF(data: IncentiveSlipData): void
```

Generate slip insentif individual dalam format PDF.

**Includes:**
- Employee information
- KPI scores breakdown (P1, P2, P3)
- Detailed indicators (optional)
- Financial summary (gross, tax, net)

##### generateSummaryReportPDF()

```typescript
function generateSummaryReportPDF(
  results: Array<{...}>,
  period: string
): void
```

Generate laporan rekapitulasi untuk semua karyawan.

---

## Database Queries

### Supabase Client

#### Browser Client
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

#### Server Client
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

### Common Queries

#### Get Current User Employee Data
```typescript
const { data: employee } = await supabase
  .from('m_employees')
  .select('*, m_units(name)')
  .eq('email', user.email)
  .single()
```

#### Get KPI Indicators for Unit
```typescript
const { data: indicators } = await supabase
  .from('m_kpi_indicators')
  .select(`
    *,
    m_kpi_categories!inner (
      category,
      unit_id
    )
  `)
  .eq('m_kpi_categories.unit_id', unitId)
  .eq('is_active', true)
```

#### Get Calculation Results
```typescript
const { data: results } = await supabase
  .from('t_calculation_results')
  .select(`
    *,
    m_employees!inner (
      employee_code,
      full_name,
      m_units (name)
    )
  `)
  .eq('period', period)
  .order('net_incentive', { ascending: false })
```

---

## Error Handling

Semua service functions menggunakan try-catch dan mengembalikan error yang informatif:

```typescript
try {
  const result = await runFullCalculation(period)
  return { success: true, data: result }
} catch (error) {
  console.error('Calculation error:', error)
  return { 
    success: false, 
    message: error instanceof Error ? error.message : 'Unknown error' 
  }
}
```

---

## Security

### Row Level Security (RLS)

Semua queries otomatis difilter berdasarkan RLS policies:

- **Superadmin**: Akses penuh
- **Unit Manager**: Hanya data unitnya
- **Employee**: Hanya data pribadi

### Server Actions

Semua business logic berjalan di server-side untuk mencegah manipulasi client-side:

```typescript
'use server'

export async function sensitiveOperation() {
  // This runs on server only
  // Client cannot manipulate the logic
}
```

---

## Performance Optimization

### Database Indexes

Semua tabel memiliki indexes untuk query performance:
- `idx_employees_unit`
- `idx_realization_employee`
- `idx_realization_period`
- `idx_calculation_period`

### Decimal.js Configuration

```typescript
Decimal.set({ 
  precision: 20, 
  rounding: Decimal.ROUND_HALF_UP 
})
```

---

## Testing

### Unit Tests (Example)

```typescript
import { calculateIndividualScore } from '@/lib/formulas/kpi-calculator'

test('calculate individual score', () => {
  const result = calculateIndividualScore(
    90, // P1
    85, // P2
    95, // P3
    { p1: 30, p2: 50, p3: 20 }
  )
  
  expect(result.totalIndividualScore.toNumber()).toBeCloseTo(88.5)
})
```

### Integration Tests

```typescript
import { runFullCalculation } from '@/services/calculation.service'

test('full calculation pipeline', async () => {
  const result = await runFullCalculation('2024-03')
  expect(result.success).toBe(true)
})
```

---

## Changelog

### Version 1.0.0
- Initial release
- Core calculation engine
- RLS implementation
- Export functionality (Excel, PDF)
- Dashboard UI for all roles
