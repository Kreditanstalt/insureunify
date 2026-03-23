'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

// ─── Breadcrumb label map ────────────────────────────────────────────────────

function getLabel(pathname: string): string {
  if (pathname === '/dashboard') return 'Начало'
  if (pathname === '/dashboard/new') return 'Ново запитване'
  if (pathname === '/dashboard/submissions') return 'Запитвания'
  if (pathname.startsWith('/dashboard/clients/new')) return 'Нов клиент'
  if (pathname.startsWith('/dashboard/clients/')) return 'Клиент'
  if (pathname === '/dashboard/clients') return 'Клиенти'
  return 'Dashboard'
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">

      {/* Left sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right: header + content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Top header */}
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Отвори навигацията"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <nav className="flex min-w-0 items-center gap-1.5 text-sm">
            <span className="text-gray-400 hidden sm:block">InsureUnify</span>
            <span className="text-gray-300 hidden sm:block">/</span>
            <span className="font-semibold text-gray-900">{getLabel(pathname)}</span>
          </nav>

          {/* Search bar */}
          <div className="ml-auto flex items-center">
            <label className="hidden sm:flex items-center gap-2 w-56 lg:w-64 cursor-text rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:bg-white">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Търсене...</span>
            </label>
          </div>

        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}
