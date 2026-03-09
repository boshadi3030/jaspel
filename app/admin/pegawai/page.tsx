'use client'

import { useState, useEffect, useCallback } from 'react'

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getPegawaiWithUnits } from './actions'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { PegawaiTable } from '@/components/pegawai/PegawaiTable'
import { PegawaiFormDialog } from '@/components/pegawai/PegawaiFormDialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { Pegawai } from '@/lib/types/database.types'

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function PegawaiPage() {
  const [pegawai, setPegawai] = useState<Pegawai[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null)
  
  const pageSize = 50
  const totalPages = Math.ceil(totalCount / pageSize)
  
  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  const loadPegawai = useCallback(async () => {
    setLoading(true)
    const result = await getPegawaiWithUnits(currentPage, pageSize, debouncedSearchTerm)
    if (!result.error) {
      setPegawai(result.data)
      setTotalCount(result.count)
    } else {
      console.error('Gagal memuat pegawai:', result.error)
    }
    setLoading(false)
  }, [currentPage, debouncedSearchTerm])
  
  useEffect(() => {
    loadPegawai()
  }, [loadPegawai])
  
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // Reset to first page on search
  }, [])
  
  const handleEdit = useCallback((pegawai: Pegawai) => {
    setSelectedPegawai(pegawai)
    setShowCreateDialog(true)
  }, [])
  
  const handleCloseDialog = useCallback(() => {
    setShowCreateDialog(false)
    setSelectedPegawai(null)
  }, [])
  
  const handleSuccess = useCallback(() => {
    loadPegawai()
    handleCloseDialog()
  }, [loadPegawai, handleCloseDialog])
  
  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Master Pegawai</h1>
            <p className="text-gray-500">Kelola data pegawai organisasi</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pegawai
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pegawai</CardTitle>
            <CardDescription>
              Total: {totalCount} pegawai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama, kode pegawai, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={loadPegawai}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Muat Ulang
              </Button>
            </div>
            
            <PegawaiTable
              pegawai={pegawai}
              loading={loading}
              onEdit={handleEdit}
              onRefresh={loadPegawai}
            />
            
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <span className="flex items-center px-4">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <PegawaiFormDialog
          open={showCreateDialog}
          onClose={handleCloseDialog}
          onSuccess={handleSuccess}
          pegawai={selectedPegawai}
        />
      </div>
  )
}
