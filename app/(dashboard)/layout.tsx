'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { AuthProvider, useAuth } from '@/lib/AuthProvider'
import { ToastProvider } from '@/components/ToastProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { BrandProvider } from '@/lib/BrandProvider'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import BrandLogo from '@/components/BrandLogo'
import { useBrand } from '@/lib/BrandProvider'

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
  if (pathname.startsWith('/dashboard/new/')) return 'Нов въпросник'
  if (pathname.startsWith('/review/')) return 'Преглед'
  return 'Dashboard'
}

// Inner layout that consumes the auth context
function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isTrialExpired, loading } = useAuth()
  useKeyboardShortcuts()

  const isSettingsPage = pathname === '/dashboard/settings'
  const showTrialBlock = !loading && isTrialExpired && !isSettingsPage

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden" aria-label="Навигация">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <Link href="/dashboard" className="lg:hidden">
            <BrandLogo size="sm" />
          </Link>
          <nav className="hidden lg:flex min-w-0 items-center gap-1.5 text-sm">
            <BrandLogo size="sm" showName />
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-900">{getLabel(pathname)}</span>
          </nav>
          <span className="lg:hidden text-sm font-semibold text-gray-900">{getLabel(pathname)}</span>
          {/* Shortcut hint — desktop only */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
              Ctrl+N
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/dashboard/new" className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors sm:hidden">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto relative">
          {showTrialBlock && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="max-w-md mx-auto text-center px-6 py-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Пробният период е изтекъл</h2>
                <p className="text-sm text-gray-500 mb-6">За да продължите, моля изберете план.</p>
                <button onClick={() => router.push('/dashboard/settings')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
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

// Root layout wraps everything in AuthProvider (loaded ONCE)
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BrandProvider>
        <ToastProvider>
          <ErrorBoundary>
            <DashboardShell>{children}</DashboardShell>
          </ErrorBoundary>
        </ToastProvider>
      </BrandProvider>
    </AuthProvider>
  )
}
