'use client'

import { useEffect, useState } from 'react'

export function Footer() {
  const [footerText, setFooterText] = useState('© 2026 JASPEL Enterprise - All Rights Reserved')
  
  useEffect(() => {
    const loadFooter = async () => {
      try {
        const response = await fetch('/api/settings', {
          headers: {
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          }
        })
        if (response.ok) {
          const data = await response.json()
          // Check footer field at root level, or use companyInfo.footer as fallback
          if (data?.footer?.text) {
            setFooterText(data.footer.text)
          } else if (data?.companyInfo?.footer) {
            setFooterText(data.companyInfo.footer)
          }
        }
      } catch (error) {
        // Use default footer on error
        console.error('Failed to load footer:', error)
      }
    }
    
    loadFooter()
  }, [])
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-600">
      {footerText}
    </footer>
  )
}
