'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/lib/useAuth'

// ─── Breadcrumb label map ────────────────────────────────────────────────────

function getLabel(pathname: string): string {
  if (pathname === '/dashboard') return 'Начало'
  if (pathname === '/dashboard/new') return 'Ново запитване'
  if (pathname === '/dashboard/submissions') return 'Запитвания'
  if (pathname.startsWith('/dashboard/clients/new')) return 'Нов клиент'
  if (pathname.startsWith('/dashboard/clients/')) return 'Клиент'
  if (pathname === '/dashboard/clients') return 'Клиенти'
  if (pathname === '/dashboard/comparisons') return 'Сравнения'
  if (pathname.startsWith('/dashboard/comparisons/')) return 'Сравнение на оферти'
  if (pathname === '/dashboard/settings') return 'Настройки'
  return 'Dashboard'
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isTrialExpired, loading } = useAuth()

  // Allow settings page even if trial expired
  const isSettingsPage = pathname === '/dashboard/settings'
  const showTrialBlock = !loading && isTrialExpired && !isSettingsPage

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
        <main className="flex-1 overflow-y-auto relative">
          {showTrialBlock && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="max-w-md mx-auto text-center px-6 py-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Пробният период е изтекъл</h2>
                <p className="text-sm text-gray-500 mb-6">
                  За да продължите да използвате InsureUnify, моля изберете план от настройките.
                </p>
                <button
                  onClick={() => router.push('/dashboard/settings')}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700"
                >
                  Изберете план &rarr;
                </button>
              </div>
            </div>
          )}
          {children}
        </main>

      </div>
    </div>
  )
}
