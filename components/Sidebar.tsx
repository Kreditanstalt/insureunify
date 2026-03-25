'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { PLAN_LABELS } from '@/lib/planLimits'

interface NavItem { label: string; href: string; soon?: boolean; exact?: boolean; icon: React.ReactNode }

const I = ({ d }: { d: string }) => (
  <svg className="h-[18px] w-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const MAIN: NavItem[] = [
  { label: 'Начало', href: '/dashboard', exact: true, icon: <I d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
  { label: 'Запитвания', href: '/dashboard/submissions', icon: <I d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> },
  { label: 'Клиенти', href: '/dashboard/clients', icon: <I d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
  { label: 'Формуляри', href: '/dashboard/form-requests', icon: <I d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /> },
  { label: 'Сравнения', href: '/dashboard/comparisons', icon: <I d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /> },
]

const CLASSES: NavItem[] = [
  { label: 'Имущество', href: '/dashboard/new/property', icon: <I d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /> },
  { label: 'Проф. отговорност', href: '/dashboard/new/professional-liability', icon: <I d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-13.5 0c-1.01.143-2.01.317-3 .52m3-.52L5.25 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.97z" /> },
  { label: 'ОГО', href: '/dashboard/new/general-liability', icon: <I d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /> },
  { label: 'Трудова злоп.', href: '/dashboard/new/occupational-accident', icon: <I d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> },
  { label: 'Търг. кредит', href: '/dashboard/new/trade-credit', icon: <I d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /> },
]

const SETTINGS_ICON = <I d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
const LOGOUT_ICON = <I d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />

// ─── Exports ─────────────────────────────────────────────────────────────────

export default function Sidebar({ mobileOpen, onMobileClose }: { mobileOpen: boolean; onMobileClose: () => void }) {
  const pathname = usePathname()
  const { profile, signOut, plan, trialDaysLeft } = useAuth()

  // Desktop collapse state persisted in localStorage
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('iu_sidebar_collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  // Auto-collapse on form pages
  const isFormPage = pathname.startsWith('/dashboard/new/')
  const effectiveCollapsed = collapsed || isFormPage

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('iu_sidebar_collapsed', String(next))
      return next
    })
  }, [])

  function isActive(item: NavItem) {
    if (item.href === '#') return false
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const closeMobile = onMobileClose

  // Shared nav item renderer
  function NavLink({ item, mini }: { item: NavItem; mini?: boolean }) {
    const active = isActive(item)
    if (item.soon || item.href === '#') {
      return (
        <div className={`relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] cursor-not-allowed opacity-30 ${mini ? 'justify-center' : ''}`}>
          <span className="text-gray-400">{item.icon}</span>
          {!mini && <span className="text-gray-400 truncate">{item.label}</span>}
        </div>
      )
    }
    return (
      <Link
        href={item.href}
        onClick={closeMobile}
        className={`group/nav relative flex items-center rounded-lg transition-colors ${
          mini ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'
        } text-[13px] ${
          active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`}
        title={mini ? item.label : undefined}
      >
        {active && !mini && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-blue-600" />}
        <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
        {!mini && <span className="truncate">{item.label}</span>}
        {active && mini && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-600" />}
        {/* Tooltip for collapsed */}
        {mini && (
          <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white opacity-0 group-hover/nav:opacity-100 transition-opacity">
            {item.label}
          </span>
        )}
      </Link>
    )
  }

  // ─── Sidebar content ───────────────────────────────────────────────

  function SidebarContent({ mini }: { mini?: boolean }) {
    return (
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={`flex h-14 flex-shrink-0 items-center border-b border-gray-100 ${mini ? 'justify-center px-0' : 'px-4'}`}>
          <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {!mini && <span className="text-sm font-bold text-gray-900">InsureUnify</span>}
          </Link>
        </div>

        {/* New button */}
        <div className={`pt-3 pb-2 ${mini ? 'px-2' : 'px-3'}`}>
          <Link
            href="/dashboard/new"
            onClick={closeMobile}
            className={`flex items-center justify-center rounded-lg bg-blue-600 text-white font-semibold shadow-sm shadow-blue-100 hover:bg-blue-700 transition-colors ${
              mini ? 'h-9 w-full text-sm' : 'gap-1.5 py-2 text-xs'
            }`}
            title={mini ? 'Ново запитване' : undefined}
          >
            <svg className={mini ? 'h-4 w-4' : 'h-3.5 w-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {!mini && 'Ново запитване'}
          </Link>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-1 space-y-3 ${mini ? 'px-1.5' : 'px-2'}`}>
          <div>
            {!mini && <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Основни</p>}
            <div className="space-y-0.5">
              {MAIN.map((item) => <NavLink key={item.href} item={item} mini={mini} />)}
            </div>
          </div>
          <div>
            {!mini && <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Класове</p>}
            <div className="space-y-0.5">
              {CLASSES.map((item) => <NavLink key={item.href + item.label} item={item} mini={mini} />)}
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className={`flex-shrink-0 border-t border-gray-100 ${mini ? 'px-1.5 py-2' : 'p-2'}`}>
          {/* User info */}
          {profile && (
            <div className={`mb-1 flex items-center rounded-lg ${mini ? 'justify-center py-1.5' : 'gap-2 px-2 py-1.5'}`}>
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  {profile.company_name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              {!mini && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-gray-900">{profile.company_name}</p>
                  <p className="truncate text-[10px] text-gray-400">{profile.email}</p>
                </div>
              )}
            </div>
          )}

          {/* Plan badge */}
          {plan && (() => {
            const pi = PLAN_LABELS[plan.plan_id] ?? PLAN_LABELS.trial
            return mini ? (
              <div className="flex justify-center mb-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pi.color }} title={pi.label} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 mb-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: pi.bg, color: pi.color }}>{pi.label}</span>
                {plan.plan_id === 'trial' && trialDaysLeft !== null && trialDaysLeft > 0 && (
                  <span className={`text-[10px] ${trialDaysLeft <= 3 ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>{trialDaysLeft}д</span>
                )}
              </div>
            )
          })()}

          {/* Settings + Logout */}
          <NavLink item={{ label: 'Настройки', href: '/dashboard/settings', icon: SETTINGS_ICON }} mini={mini} />
          <button
            onClick={signOut}
            className={`group/nav relative flex w-full items-center rounded-lg text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
              mini ? 'justify-center py-2.5' : 'gap-2.5 px-2.5 py-2'
            }`}
            title={mini ? 'Изход' : undefined}
          >
            <span className="text-gray-400">{LOGOUT_ICON}</span>
            {!mini && 'Изход'}
            {mini && (
              <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white opacity-0 group-hover/nav:opacity-100 transition-opacity">
                Изход
              </span>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={closeMobile} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 transition-transform duration-200 ease-in-out lg:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close button */}
        <button onClick={closeMobile} className="absolute top-3 right-3 z-10 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 transition-[width] duration-200 ease-in-out relative ${
          effectiveCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent mini={effectiveCollapsed} />

        {/* Toggle button — desktop only, not on form pages */}
        {!isFormPage && (
          <button
            onClick={toggleCollapse}
            className="absolute top-1/2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
            title={collapsed ? 'Разшири' : 'Свий'}
          >
            <svg className={`h-3 w-3 text-gray-400 transition-transform ${effectiveCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </aside>
    </>
  )
}
