'use client'

import { useState } from 'react'
import { type UserWithPegawai } from '@/app/admin/users/actions'
import { deactivateUser } from '@/lib/services/user-management.service'
import { Button } from '@/components/ui/button'
import { Edit, Ban, CheckCircle } from 'lucide-react'

interface UserTableProps {
  users: UserWithPegawai[]
  loading: boolean
  onEdit: (user: UserWithPegawai) => void
  onRefresh: () => void
}

const roleLabels: Record<string, string> = {
  superadmin: 'Superadmin',
  unit_manager: 'Manajer Unit',
  employee: 'Pegawai'
}

export function UserTable({ users, loading, onEdit, onRefresh }: UserTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const handleDeactivate = async (user: UserWithPegawai) => {
    const userName = user.pegawai?.full_name || user.email
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan ${userName}?`)) {
      return
    }
    
    setActionLoading(user.id)
    const result = await deactivateUser(user.id)
    setActionLoading(null)
    
    if (result.success) {
      alert('Pengguna berhasil dinonaktifkan')
      onRefresh()
    } else {
      alert(`Error: ${result.error}`)
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Memuat...</p>
      </div>
    )
  }
  
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tidak ada pengguna ditemukan</p>
      </div>
    )
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">Nama</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Peran</th>
            <th className="text-left p-3">Unit</th>
            <th className="text-left p-3">Status</th>
            <th className="text-right p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{user.pegawai?.full_name || '-'}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {roleLabels[user.role] || user.role}
                </span>
              </td>
              <td className="p-3">{user.unit?.name || '-'}</td>
              <td className="p-3">
                {user.is_active ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aktif
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <Ban className="h-4 w-4 mr-1" />
                    Nonaktif
                  </span>
                )}
              </td>
              <td className="p-3 text-right space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(user)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {user.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeactivate(user)}
                    disabled={actionLoading === user.id}
                    title="Nonaktifkan"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
