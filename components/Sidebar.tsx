'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  soon?: boolean
  exact?: boolean
  icon: React.ReactNode
}

interface Profile {
  companyName: string
  email: string
}

function DocIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

const MAIN_ITEMS: NavItem[] = [
  {
    label: 'Начало', href: '/dashboard', exact: true,
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  },
  {
    label: 'Запитвания', href: '/dashboard/submissions',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>,
  },
  {
    label: 'Клиенти', href: '/dashboard/clients',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  },
]

const CLASS_ITEMS: NavItem[] = [
  {
    label: 'Имущество', href: '/dashboard/new/property',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
  },
  {
    label: 'Проф. отговорност', href: '/dashboard/new/professional-liability',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-13.5 0c-1.01.143-2.01.317-3 .52m3-.52L2.63 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.97z" /></svg>,
  },
  {
    label: 'ОГО / Работодател', href: '/dashboard/new/general-liability',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>,
  },
  {
    label: 'Трудова злополука', href: '/dashboard/new/occupational-accident',
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  },
  {
    label: 'Здравна', href: '#', soon: true,
    icon: <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  },
  {
    label: 'Търговски кредит', href: '#', soon: true,
    icon: <DocIcon />,
  },
]

function SidebarItem({ item, active, onNavigate }: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
}) {
  const base = 'relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all'

  if (item.soon || item.href === '#') {
    return (
      <div className={`${base} cursor-not-allowed opacity-50`}>
        <span className="flex-shrink-0 text-gray-400">{item.icon}</span>
        <span className="flex-1 text-gray-400">{item.label}</span>
        <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
          скоро
        </span>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`${base} ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {active && (
        <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-blue-600" />
      )}
      <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
      <span className="flex-1">{item.label}</span>
    </Link>
  )
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={[
        'fixed inset-y-0 left-0 z-50 flex w-56 flex-col',
        'border-r border-gray-100 bg-white',
        'transition-transform duration-200 ease-in-out',
        'lg:static lg:z-auto lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="flex h-14 flex-shrink-0 items-center px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-gray-900">InsureUnify</span>
          </Link>
        </div>

        {/* New button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => { router.push('/dashboard/new'); onClose() }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-100 transition-all hover:bg-blue-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ново запитване
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">

          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Основни</p>
            <div className="space-y-0.5">
              {MAIN_ITEMS.map((item) => (
                <SidebarItem key={item.href} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Класове</p>
            <div className="space-y-0.5">
              {CLASS_ITEMS.map((item) => (
                <SidebarItem key={item.href + item.label} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>

        </nav>

        {/* Bottom */}
        <div className="flex-shrink-0 border-t border-gray-100 p-3">
          {profile && (
            <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {profile.companyName[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-900">{profile.companyName}</p>
                <p className="truncate text-[11px] text-gray-400">{profile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Изход
          </button>
        </div>

      </aside>
    </>
  )
}
