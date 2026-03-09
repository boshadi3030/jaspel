'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Settings, getSettings, updateSettings as updateSettingsService } from '@/lib/services/settings.service'
import { createClient } from '@/lib/supabase/client'

interface SettingsContextValue {
  settings: Settings | null
  loading: boolean
  error: string | null
  updateSettings: (settings: Partial<Settings>) => Promise<{ success: boolean; error: string | null }>
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

// In-memory cache
let settingsCache: Settings | null = null
let cacheTimestamp = 0
const CACHE_TTL = 60000 // 1 minute

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(settingsCache)
  const [loading, setLoading] = useState(!settingsCache)
  const [error, setError] = useState<string | null>(null)

  // Load settings dengan caching
  const loadSettings = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache
      if (!forceRefresh && settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
        setSettings(settingsCache)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await getSettings()

      if (fetchError) {
        // Don't throw error, just log it and set default settings
        console.warn('Failed to load settings:', fetchError)
        setError(null) // Don't show error to user
        setLoading(false)
        return
      }

      if (data) {
        settingsCache = data
        cacheTimestamp = Date.now()
        setSettings(data)
        setError(null)
      }
    } catch (err: any) {
      console.warn('Failed to load settings:', err)
      // Don't show error to user, just use defaults
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      setLoading(true)
      setError(null)

      const result = await updateSettingsService(newSettings)

      if (result.success) {
        // Invalidate cache
        settingsCache = null
        cacheTimestamp = 0
        await loadSettings(true)
        return { success: true, error: null }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memperbarui pengaturan'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [loadSettings])

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    settingsCache = null
    cacheTimestamp = 0
    await loadSettings(true)
  }, [loadSettings])

  // Initial load - only if user is authenticated
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Only load settings if user is authenticated
        if (session) {
          await loadSettings()
        } else {
          setLoading(false)
        }
      } catch (err: any) {
        // Silently handle lock errors
        if (err?.name === 'AbortError' || err?.message?.includes('Lock broken')) {
          console.warn('[Settings] Auth lock contention, retrying in 1s...')
          setTimeout(() => checkAuthAndLoad(), 1000)
          return
        }
        console.warn('Settings context init error:', err)
        setLoading(false)
      }
    }

    // Small delay to prevent hydration issues
    const timer = setTimeout(() => {
      checkAuthAndLoad()
    }, 0)

    return () => clearTimeout(timer)
  }, [loadSettings])

  // Subscribe to real-time changes - only if authenticated
  useEffect(() => {
    const supabase = createClient()

    const setupSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        // Only subscribe if user is authenticated
        if (!session) return

        const channel = supabase
          .channel('settings-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 't_settings'
            },
            () => {
              settingsCache = null
              cacheTimestamp = 0
              loadSettings(true)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.warn('Settings subscription error:', err)
      }
    }

    setupSubscription()
  }, [loadSettings])

  const value: SettingsContextValue = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook untuk menggunakan settings context
export function useSettings() {
  const context = useContext(SettingsContext)

  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }

  return context
}
