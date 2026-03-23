'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: string
  label: string
  href: string
  soon?: boolean
  exact?: boolean
}

interface Profile {
  companyName: string
  email: string
}

// ─── Nav definitions ──────────────────────────────────────────────────────────

const MAIN_ITEMS: NavItem[] = [
  { icon: '🏠', label: 'Начало',         href: '/dashboard',          exact: true },
  { icon: '➕', label: 'Ново запитване', href: '/dashboard/new' },
  { icon: '📋', label: 'Запитвания',     href: '/dashboard/submissions' },
  { icon: '👥', label: 'Клиенти',        href: '/dashboard/clients' },
]

const CLASS_ITEMS: NavItem[] = [
  { icon: '🏢', label: 'Имущество',            href: '/dashboard/new/property' },
  { icon: '⚖️', label: 'Проф. отговорност',    href: '/dashboard/new/professional-liability' },
  { icon: '🔧', label: 'ОГО / Работодател',    href: '/dashboard/new/general-liability'      },
  { icon: '⚡', label: 'Трудова злополука',    href: '/dashboard/new/occupational-accident'  },
  { icon: '🏥', label: 'Здравна',              href: '#',                                     soon: true },
  { icon: '💳', label: 'Търговски кредит',     href: '#',                                     soon: true },
]

// ─── NavItem component ────────────────────────────────────────────────────────

function SidebarItem({ item, active, onNavigate }: {
  item:        NavItem
  active:      boolean
  onNavigate?: () => void
}) {
  const base = 'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'

  if (item.soon || item.href === '#') {
    return (
      <div className={`${base} cursor-not-allowed text-gray-400`}>
        <span className="text-base leading-none">{item.icon}</span>
        <span className="flex-1">{item.label}</span>
        {item.soon && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            скоро
          </span>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`${base} ${
        active
          ? 'bg-[#EFF6FF] font-medium text-[#3B82F6]'
          : 'text-[#64748B] hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {active && (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-[#3B82F6]" />
      )}
      <span className="text-base leading-none">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  )
}

// ─── Main Sidebar component ───────────────────────────────────────────────────

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen:   boolean
  onClose:  () => void
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iu_profile')
      if (raw) setProfile(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function logout() {
    localStorage.removeItem('iu_auth')
    router.push('/login')
  }

  function isActive(item: NavItem): boolean {
    if (item.href === '#') return false
    if (item.exact)        return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col',
          'border-r border-gray-200 bg-white',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* ── Logo ── */}
        <div className="flex h-14 flex-shrink-0 items-center border-b border-gray-100 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-gray-900">InsureUnify</span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">

          {/* Основни */}
          <div>
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-gray-400">
              Основни
            </p>
            <div className="space-y-0.5">
              {MAIN_ITEMS.map((item) => (
                <SidebarItem key={item.label} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Класове застраховки */}
          <div>
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-gray-400">
              Класове застраховки
            </p>
            <div className="space-y-0.5">
              {CLASS_ITEMS.map((item) => (
                <SidebarItem key={item.label} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>

        </nav>

        {/* ── Bottom: profile + settings + logout ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-3 py-3 space-y-0.5">
          {profile && (
            <div className="mb-1 flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                {profile.companyName[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{profile.companyName}</p>
                <p className="truncate text-xs text-gray-400">{profile.email}</p>
              </div>
            </div>
          )}

          <div className="relative flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400">
            <span className="text-base leading-none">⚙️</span>
            <span className="flex-1">Настройки</span>
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">скоро</span>
          </div>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <span className="text-base leading-none">🚪</span>
            <span>Изход</span>
          </button>
        </div>
      </aside>
    </>
  )
}
