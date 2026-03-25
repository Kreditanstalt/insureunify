'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CommandItem {
  id: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  category: 'action' | 'client' | 'submission' | 'nav'
  onSelect: () => void
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const IC = ({ d }: { d: string }) => (
  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
)

const ICONS = {
  plus:   <IC d="M12 4v16m8-8H4" />,
  search: <IC d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
  doc:    <IC d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  user:   <IC d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
  home:   <IC d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
  cog:    <IC d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />,
  compare:<IC d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
}

const CLASS_LABELS: Record<string, string> = {
  property: 'Имущество', general_liability: 'ОГО', occupational_accident: 'Трудова злоп.',
  professional_liability: 'Проф. отг.', trade_credit: 'Търг. кредит',
}

const CATEGORY_LABELS: Record<string, string> = {
  action: 'Действия', nav: 'Навигация', client: 'Клиенти', submission: 'Запитвания',
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Open/close with Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((p) => !p)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Build items
  const getItems = useCallback((): CommandItem[] => {
    const items: CommandItem[] = []

    // Actions
    items.push(
      { id: 'new-property', label: 'Ново запитване — Имущество', icon: ICONS.plus, category: 'action', onSelect: () => router.push('/dashboard/new/property') },
      { id: 'new-gl', label: 'Ново запитване — ОГО', icon: ICONS.plus, category: 'action', onSelect: () => router.push('/dashboard/new/general-liability') },
      { id: 'new-oa', label: 'Ново запитване — Трудова злополука', icon: ICONS.plus, category: 'action', onSelect: () => router.push('/dashboard/new/occupational-accident') },
      { id: 'new-pl', label: 'Ново запитване — Проф. отговорност', icon: ICONS.plus, category: 'action', onSelect: () => router.push('/dashboard/new/professional-liability') },
      { id: 'new-tc', label: 'Ново запитване — Търговски кредит', icon: ICONS.plus, category: 'action', onSelect: () => router.push('/dashboard/new/trade-credit') },
    )

    // Nav
    items.push(
      { id: 'nav-home', label: 'Начало', icon: ICONS.home, category: 'nav', onSelect: () => router.push('/dashboard') },
      { id: 'nav-submissions', label: 'Запитвания', icon: ICONS.doc, category: 'nav', onSelect: () => router.push('/dashboard/submissions') },
      { id: 'nav-clients', label: 'Клиенти', icon: ICONS.user, category: 'nav', onSelect: () => router.push('/dashboard/clients') },
      { id: 'nav-comparisons', label: 'Сравнения', icon: ICONS.compare, category: 'nav', onSelect: () => router.push('/dashboard/comparisons') },
      { id: 'nav-settings', label: 'Настройки', icon: ICONS.cog, category: 'nav', onSelect: () => router.push('/dashboard/settings') },
    )

    // Load clients from localStorage
    try {
      const raw = localStorage.getItem('iu_clients')
      if (raw) {
        const clients = JSON.parse(raw) as { id: string; company_name: string; eik?: string }[]
        clients.slice(0, 20).forEach((c) => {
          items.push({
            id: `client-${c.id}`,
            label: c.company_name,
            sublabel: c.eik ? `ЕИК: ${c.eik}` : undefined,
            icon: ICONS.user,
            category: 'client',
            onSelect: () => router.push(`/dashboard/clients/${c.id}`),
          })
        })
      }
    } catch { /* ignore */ }

    // Load submissions from localStorage
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) {
        const subs = JSON.parse(raw) as { id: string; clientName?: string; client_name?: string; insuranceClass?: string; insurance_class?: string }[]
        subs.slice(0, 20).forEach((s) => {
          const name = s.clientName ?? s.client_name ?? 'Без име'
          const cls = s.insuranceClass ?? s.insurance_class ?? 'property'
          items.push({
            id: `sub-${s.id}`,
            label: name,
            sublabel: CLASS_LABELS[cls] ?? cls,
            icon: ICONS.doc,
            category: 'submission',
            onSelect: () => router.push(`/review/${s.id}`),
          })
        })
      }
    } catch { /* ignore */ }

    return items
  }, [router])

  const allItems = getItems()

  const filtered = query.trim()
    ? allItems.filter((item) => {
        const q = query.toLowerCase()
        return item.label.toLowerCase().includes(q) || (item.sublabel?.toLowerCase().includes(q) ?? false)
      }).slice(0, 12)
    : allItems.filter((i) => i.category === 'action' || i.category === 'nav').slice(0, 8)

  // Group by category
  const grouped: Record<string, CommandItem[]> = {}
  filtered.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = []
    grouped[item.category].push(item)
  })

  function handleSelect(item: CommandItem) {
    setOpen(false)
    item.onSelect()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((p) => Math.min(p + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((p) => Math.max(p - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault()
      handleSelect(filtered[activeIdx])
    }
  }

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  if (!open) return null

  let globalIdx = -1

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Търси клиент, запитване, действие..."
            className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
          />
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Няма резултати за &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {CATEGORY_LABELS[cat] ?? cat}
                </p>
                {items.map((item) => {
                  globalIdx++
                  const idx = globalIdx
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={item.id}
                      data-idx={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={isActive ? 'text-blue-500' : 'text-gray-400'}>{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{item.label}</span>
                        {item.sublabel && <span className="text-xs text-gray-400 truncate block">{item.sublabel}</span>}
                      </div>
                      {isActive && (
                        <kbd className="text-[10px] text-blue-400 font-mono">↵</kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 text-[10px] text-gray-400">
          <span><kbd className="font-mono">↑↓</kbd> навигация</span>
          <span><kbd className="font-mono">↵</kbd> избери</span>
          <span><kbd className="font-mono">esc</kbd> затвори</span>
        </div>
      </div>
    </div>
  )
}
