'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface OptimizedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  prefetch?: boolean
  onClick?: () => void
}

export function OptimizedLink({ 
  href, 
  children, 
  className, 
  prefetch = true,
  onClick 
}: OptimizedLinkProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    startTransition(() => {
      router.push(href)
    })
  }, [href, router, onClick])

  return (
    <Link 
      href={href} 
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}
