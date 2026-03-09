'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, TrendingUp, Users, Building2, Receipt } from 'lucide-react'
type ReportType = 'incentive' | 'kpi-achievement' | 'unit-comparison' | 'employee-slip'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const reportTypes = [
    {
      id: 'incentive' as ReportType,
      title: 'Incentive Report',
      description: 'Detailed incentive distribution with P1, P2, P3 scores',
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      id: 'kpi-achievement' as ReportType,
      title: 'KPI Achievement Report',
      description: 'KPI realization and achievement percentages',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      id: 'unit-comparison' as ReportType,
      title: 'Unit Comparison Report',
      description: 'Compare performance across units',
      icon: Building2,
      color: 'text-purple-600',
    },
    {
      id: 'employee-slip' as ReportType,
      title: 'Employee Slip',
      description: 'Individual employee incentive slip',
      icon: Receipt,
      color: 'text-orange-600',
    },
  ]

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedPeriod) {
      setError('Please select report type and period')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReport,
          period: selectedPeriod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report')
      }

      if (data.data && data.data.length === 0) {
        setError(`No data available for the selected period ${selectedPeriod}`)
        setReportData(null)
      } else {
        setReportData(data.data)
        setError(null)
      }
    } catch (err) {
      setError((err as Error).message)
      setReportData(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!reportData || !selectedReport || !selectedPeriod) return

    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: selectedReport,
          period: selectedPeriod,
          format,
          data: reportData,
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedReport}-${selectedPeriod}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and export various reports</p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon
            return (
              <Card
                key={report.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-lg ${selectedReport === report.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                  }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 ${report.color}`} />
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Period Selection and Generate */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Period</label>
              <input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border rounded-md w-full max-w-xs"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGenerateReport}
                disabled={!selectedReport || !selectedPeriod || isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportData && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('excel')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}
          </div>
        </Card>

        {/* Report Preview */}
        {reportData && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Report Preview</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(reportData[0] || {}).map((key) => (
                      <th key={key} className="border p-2 text-left font-semibold">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, cellIdx: number) => (
                        <td key={cellIdx} className="border p-2">
                          {typeof value === 'number'
                            ? value.toLocaleString('id-ID', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
  )
}
