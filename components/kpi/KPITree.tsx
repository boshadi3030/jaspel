'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KPICategory {
  id: string
  unit_id: string
  category: 'P1' | 'P2' | 'P3'
  category_name: string
  weight_percentage: number
  description: string | null
  is_active: boolean
}

interface KPIIndicator {
  id: string
  category_id: string
  code: string
  name: string
  target_value: number
  weight_percentage: number
  measurement_unit: string | null
  description: string | null
  is_active: boolean
}

interface KPITreeProps {
  categories: KPICategory[]
  indicators: KPIIndicator[]
  onEditCategory: (category: KPICategory) => void
  onDeleteCategory: (categoryId: string) => void
  onAddIndicator: (categoryId: string) => void
  onEditIndicator: (indicator: KPIIndicator) => void
  onDeleteIndicator: (indicatorId: string) => void
}

export default function KPITree({
  categories,
  indicators,
  onEditCategory,
  onDeleteCategory,
  onAddIndicator,
  onEditIndicator,
  onDeleteIndicator
}: KPITreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  )

  function toggleCategory(categoryId: string) {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  function getCategoryIndicators(categoryId: string) {
    return indicators.filter(i => i.category_id === categoryId)
  }

  function calculateIndicatorWeightSum(categoryId: string) {
    const categoryIndicators = getCategoryIndicators(categoryId)
    return categoryIndicators.reduce((sum, ind) => sum + Number(ind.weight_percentage), 0)
  }

  function calculateCategoryWeightSum() {
    return categories.reduce((sum, cat) => sum + Number(cat.weight_percentage), 0)
  }

  const categoryWeightSum = calculateCategoryWeightSum()
  const isValidCategorySum = Math.abs(categoryWeightSum - 100) <= 0.01

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Belum ada kategori KPI untuk unit ini.</p>
        <p className="text-sm mt-2">Klik "Tambah Kategori" untuk membuat kategori P1, P2, atau P3.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Category Weight Sum Validation */}
      <div className={`p-3 rounded-lg ${isValidCategorySum ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className={`text-sm font-medium ${isValidCategorySum ? 'text-green-800' : 'text-red-800'}`}>
          Total Bobot Kategori: {categoryWeightSum.toFixed(2)}%
          {isValidCategorySum ? ' ✓' : ' (Harus sama dengan 100%)'}
        </p>
      </div>

      {/* Categories */}
      {categories.map(category => {
        const isExpanded = expandedCategories.has(category.id)
        const categoryIndicators = getCategoryIndicators(category.id)
        const indicatorWeightSum = calculateIndicatorWeightSum(category.id)
        const isValidIndicatorSum = Math.abs(indicatorWeightSum - 100) <= 0.01

        return (
          <div key={category.id} className="border rounded-lg">
            {/* Category Header */}
            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{category.category}</span>
                    <span className="text-gray-700">{category.category_name}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                      {category.weight_percentage.toFixed(2)}%
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  {categoryIndicators.length > 0 && (
                    <p className={`text-xs mt-1 ${isValidIndicatorSum ? 'text-green-600' : 'text-red-600'}`}>
                      Bobot indikator: {indicatorWeightSum.toFixed(2)}%
                      {isValidIndicatorSum ? ' ✓' : ' (Harus sama dengan 100%)'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onAddIndicator(category.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Indikator
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteCategory(category.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>

            {/* Indicators */}
            {isExpanded && (
              <div className="p-4 space-y-2">
                {categoryIndicators.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada indikator. Klik "Tambah Indikator" untuk membuat indikator baru.
                  </p>
                ) : (
                  categoryIndicators.map(indicator => (
                    <div
                      key={indicator.id}
                      className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-gray-600">{indicator.code}</span>
                          <span className="font-medium">{indicator.name}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                            {indicator.weight_percentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-600">
                          <span>Target: {indicator.target_value.toFixed(2)}</span>
                          {indicator.measurement_unit && (
                            <span>Satuan: {indicator.measurement_unit}</span>
                          )}
                        </div>
                        {indicator.description && (
                          <p className="text-xs text-gray-500 mt-1">{indicator.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditIndicator(indicator)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteIndicator(indicator.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
