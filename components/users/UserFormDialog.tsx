'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import { type UserWithPegawai } from '@/app/admin/users/actions'

interface UserFormDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserWithPegawai | null
}

interface Pegawai {
  id: string
  employee_code: string
  full_name: string
  unit_id: string
}

const roleLabels: Record<string, string> = {
  superadmin: 'Superadmin',
  unit_manager: 'Manajer Unit',
  employee: 'Pegawai'
}

export function UserFormDialog({ open, onClose, onSuccess, user }: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'employee' as 'superadmin' | 'unit_manager' | 'employee',
    employee_id: '',
  })
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  
  useEffect(() => {
    if (open) {
      loadPegawai()
      if (user) {
        setFormData({
          email: user.email,
          password: '',
          role: user.role,
          employee_id: user.employee_id || '',
        })
      } else {
        setFormData({
          email: '',
          password: '',
          role: 'employee',
          employee_id: '',
        })
      }
      setError('')
      setTempPassword('')
    }
  }, [open, user])
  
  const loadPegawai = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('m_employees')
      .select('id, employee_code, full_name, unit_id')
      .eq('is_active', true)
      .order('full_name')
    
    if (data) {
      setPegawaiList(data)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      
      if (user) {
        // Update existing user - call server action
        const response = await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: formData.email,
            role: formData.role,
            employee_id: formData.employee_id || null,
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert('Pengguna berhasil diperbarui')
          onSuccess()
        } else {
          setError(result.error || 'Gagal memperbarui pengguna')
        }
      } else {
        // Create new user
        if (!formData.password) {
          setError('Password wajib diisi untuk pengguna baru')
          setLoading(false)
          return
        }
        
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            role: formData.role,
            employee_id: formData.employee_id || null,
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          setTempPassword(formData.password)
          alert(`Pengguna berhasil dibuat. Password: ${formData.password}`)
          onSuccess()
        } else {
          setError(result.error || 'Gagal membuat pengguna')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    }
    
    setLoading(false)
  }
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          {!user && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Minimal 6 karakter"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="role">Peran</Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full border rounded-md p-2"
              required
            >
              <option value="employee">{roleLabels.employee}</option>
              <option value="unit_manager">{roleLabels.unit_manager}</option>
              <option value="superadmin">{roleLabels.superadmin}</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="employee_id">Pegawai (Opsional)</Label>
            <select
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full border rounded-md p-2"
            >
              <option value="">Pilih Pegawai</option>
              {pegawaiList.map((pegawai) => (
                <option key={pegawai.id} value={pegawai.id}>
                  {pegawai.employee_code} - {pegawai.full_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hubungkan pengguna dengan data pegawai untuk akses KPI
            </p>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          {tempPassword && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              Password sementara: <strong>{tempPassword}</strong>
              <br />
              <small>Simpan password ini dan bagikan kepada pengguna.</small>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Menyimpan...' : user ? 'Perbarui' : 'Buat'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
