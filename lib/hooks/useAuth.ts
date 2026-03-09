'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type Role, hasPermission, type Permission, getMenuItemsForRole, type MenuItem } from '@/lib/services/rbac.service'

export interface User {
  id: string
  email: string
  role: Role
  full_name?: string
  unit_id?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const resolveUser = async (sessionUser: any) => {
      try {
        if (!sessionUser) {
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }

        const role = (sessionUser.user_metadata?.role || 'employee') as Role
        let fullName = sessionUser.user_metadata?.full_name || sessionUser.email
        let unitId: string | undefined

        try {
          // Timeout the fetch after 3 seconds to guarantee it doesn't hang
          const getEmployeeTask = supabase
            .from('m_employees')
            .select('id, full_name, unit_id')
            .eq('user_id', sessionUser.id)
            .single()

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
          )

          const { data, error } = await Promise.race([getEmployeeTask, timeoutPromise]) as any

          if (data && !error) {
            fullName = data.full_name || fullName
            unitId = data.unit_id
          }
        } catch (err) {
          console.warn('[useAuth] Failed to fetch employee metadata (non-critical).', err)
        }

        if (mounted) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email,
            role,
            full_name: fullName,
            unit_id: unitId,
          })
          setLoading(false)
        }
      } catch (fatalError) {
        console.error('[useAuth] Fatal error resolving user:', fatalError)
        if (mounted) setLoading(false)
      }
    }

    // 1. Get immediate session from cache (no network lock contention)
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveUser(session?.user)
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    // 2. Listen to changes securely
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveUser(session?.user)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}

export function usePermission(permission: Permission) {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }, [user, permission])
}

export function useMenuItems(): MenuItem[] {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return []
    return getMenuItemsForRole(user.role)
  }, [user])
}
