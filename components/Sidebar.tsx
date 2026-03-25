'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'

interface NavItem {
  label: string
  href: string
  soon?: boolean
  exact?: boolean
  icon: React.ReactNode
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const Icon = ({ d, d2 }: { d: string; d2?: string }) => (
  <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" d={d2} />}
  </svg>
)

const MAIN_ITEMS: NavItem[] = [
  {
    label: 'Начало', href: '/dashboard', exact: true,
    icon: <Icon d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
  },
  {
    label: 'Запитвания', href: '/dashboard/submissions',
    icon: <Icon d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  },
  {
    label: 'Клиенти', href: '/dashboard/clients',
    icon: <Icon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  },
  {
    label: 'Нови формуляри', href: '/dashboard/form-requests',
    icon: <Icon d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
  },
  {
    label: 'Сравнения', href: '/dashboard/comparisons',
    icon: <Icon d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
  },
]

const CLASS_ITEMS: NavItem[] = [
  {
    label: 'Имущество', href: '/dashboard/new/property',
    icon: <Icon d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />,
  },
  {
    label: 'Проф. отговорност', href: '/dashboard/new/professional-liability',
    icon: <Icon d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-13.5 0c-1.01.143-2.01.317-3 .52m3-.52L5.25 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.97z" />,
  },
  {
    label: 'ОГО / Работодател', href: '/dashboard/new/general-liability',
    icon: <Icon d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
  },
  {
    label: 'Трудова злополука', href: '/dashboard/new/occupational-accident',
    icon: <Icon d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  },
  {
    label: 'Търговски кредит', href: '/dashboard/new/trade-credit',
    icon: <Icon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
  },
  {
    label: 'Здравна', href: '#', soon: true,
    icon: <Icon d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
  },
]

// ─── NavItem ──────────────────────────────────────────────────────────────────

function SidebarItem({ item, active, onNavigate }: {
  item: NavItem; active: boolean; onNavigate?: () => void
}) {
  const base = 'relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all'

  if (item.soon || item.href === '#') {
    return (
      <div className={`${base} cursor-not-allowed opacity-40`}>
        <span className="flex-shrink-0 text-gray-400">{item.icon}</span>
        <span className="flex-1 text-gray-400">{item.label}</span>
        <span className="rounded bg-gray-100 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400">скоро</span>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`${base} ${active
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-blue-600" />}
      <span className={`flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  function isActive(item: NavItem): boolean {
    if (item.href === '#') return false
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside className={[
        'fixed inset-y-0 left-0 z-50 flex w-52 flex-col',
        'border-r border-gray-100 bg-white',
        'transition-transform duration-200 ease-in-out',
        'lg:static lg:z-auto lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}>

        {/* Logo */}
        <div className="flex h-14 flex-shrink-0 items-center px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">InsureUnify</span>
          </Link>
        </div>

        {/* New button */}
        <div className="px-3 pt-3 pb-2">
          <Link
            href="/dashboard/new"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-100 transition-all hover:bg-blue-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ново запитване
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
          <div>
            <p className="mb-0.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Основни</p>
            <div className="space-y-0.5">
              {MAIN_ITEMS.map((item) => (
                <SidebarItem key={item.href} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-0.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Класове</p>
            <div className="space-y-0.5">
              {CLASS_ITEMS.map((item) => (
                <SidebarItem key={item.href + item.label} item={item} active={isActive(item)} onNavigate={onClose} />
              ))}
            </div>
          </div>
        </nav>

        {/* Bottom */}
        <div className="flex-shrink-0 border-t border-gray-100 p-2">
          {profile && (
            <div className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  {profile.company_name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-gray-900">{profile.company_name}</p>
                <p className="truncate text-[11px] text-gray-400">{profile.email}</p>
              </div>
            </div>
          )}
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
              pathname.startsWith('/dashboard/settings')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <svg className="h-[15px] w-[15px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Настройки
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="h-[15px] w-[15px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Изход
          </button>
        </div>
      </aside>
    </>
  )
}
