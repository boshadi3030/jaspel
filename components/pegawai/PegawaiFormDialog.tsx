'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createPegawai, updatePegawai } from '@/lib/services/pegawai.service'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import type { Pegawai } from '@/lib/types/database.types'

interface PegawaiFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  pegawai?: Pegawai | null
}

interface Unit {
  id: string
  name: string
}

export function PegawaiFormDialog({ open, onClose, onSuccess, pegawai }: PegawaiFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    unit_id: '',
    tax_status: 'TK/0',
  })
  
  // Load units
  useEffect(() => {
    const loadUnits = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('m_units')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      
      if (data) {
        setUnits(data)
      }
    }
    
    if (open) {
      loadUnits()
    }
  }, [open])
  
  // Populate form when editing
  useEffect(() => {
    if (pegawai) {
      setFormData({
        employee_code: pegawai.employee_code,
        full_name: pegawai.full_name,
        unit_id: pegawai.unit_id,
        tax_status: pegawai.tax_status,
      })
    } else {
      setFormData({
        employee_code: '',
        full_name: '',
        unit_id: '',
        tax_status: 'TK/0',
      })
    }
  }, [pegawai, open])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.employee_code || !formData.full_name || !formData.unit_id) {
      alert('Kode pegawai, nama lengkap, dan unit wajib diisi')
      return
    }
    
    setLoading(true)
    
    let result
    if (pegawai) {
      // Update existing pegawai
      result = await updatePegawai(pegawai.id, formData)
    } else {
      // Create new pegawai
      result = await createPegawai(formData)
    }
    
    setLoading(false)
    
    if (result.success) {
      alert(pegawai ? 'Pegawai berhasil diperbarui' : 'Pegawai berhasil ditambahkan')
      onSuccess()
    } else {
      alert(`Gagal: ${result.error}`)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pegawai ? 'Ubah Pegawai' : 'Tambah Pegawai'}</DialogTitle>
          <DialogDescription>
            {pegawai ? 'Perbarui informasi pegawai' : 'Tambahkan pegawai baru ke sistem'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_code">Kode Pegawai *</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="Contoh: PEG001"
                disabled={loading || !!pegawai}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nama lengkap pegawai"
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit_id">Unit *</Label>
              <select
                id="unit_id"
                value={formData.unit_id}
                onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
                required
              >
                <option value="">Pilih Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="tax_status">Status Pajak</Label>
              <select
                id="tax_status"
                value={formData.tax_status}
                onChange={(e) => setFormData({ ...formData, tax_status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              >
                <option value="TK/0">TK/0</option>
                <option value="TK/1">TK/1</option>
                <option value="TK/2">TK/2</option>
                <option value="TK/3">TK/3</option>
                <option value="K/0">K/0</option>
                <option value="K/1">K/1</option>
                <option value="K/2">K/2</option>
                <option value="K/3">K/3</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                pegawai ? 'Perbarui' : 'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
