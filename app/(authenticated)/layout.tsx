'use client'

import Sidebar from '@/components/navigation/Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Footer } from '@/components/layout/Footer'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-72 flex flex-col">
        <div className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
        <Footer />
      </main>
    </div>
  )
}
