'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getClients, deleteClient, syncClientsFromSubmissions, type ClientProfile } from '@/lib/clients'

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (days === 0) return 'Днес'
  if (days === 1) return 'Вчера'
  if (days < 7)   return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  { bg: '#dbeafe', color: '#1e40af' },
  { bg: '#dcfce7', color: '#166534' },
  { bg: '#f3e8ff', color: '#581c87' },
  { bg: '#fee2e2', color: '#991b1b' },
  { bg: '#fef3c7', color: '#92400e' },
  { bg: '#e0f2fe', color: '#075985' },
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function ClientsList() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [search, setSearch] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load from localStorage immediately
    syncClientsFromSubmissions()
    setClients(getClients())
    setSynced(true)
    // Then fetch fresh data from Supabase
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => {
        if (d.clients?.length) {
          // Merge Supabase data into localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('iu_clients', JSON.stringify(d.clients))
          }
          setClients(d.clients)
        }
      })
      .catch(() => {/* offline */})
  }, [])

  function handleDelete(id: string) {
    deleteClient(id)
    setClients(getClients())
    setDeleteConfirmId(null)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return clients
    const q = search.toLowerCase()
    return clients.filter(
      (c) =>
        c.company_name.toLowerCase().includes(q) ||
        (c.eik ?? '').includes(q) ||
        (c.activity ?? '').toLowerCase().includes(q),
    )
  }, [clients, search])

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-5 sm:space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Клиенти</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {clients.length} {clients.length === 1 ? 'клиент' : 'клиента'} в регистъра
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/clients/new')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Нов клиент
          </button>
        </div>

        {/* ── Search ── */}
        <label className="flex items-center gap-2.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all cursor-text">
          <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Търсене по наименование, ЕИК или дейност..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </label>

        {/* ── List ── */}
        {!synced ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={!!search.trim()} onCreate={() => router.push('/dashboard/clients/new')} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-50">
              {filtered.map((client) => {
                const av = avatarColor(client.company_name)
                const initials = getInitials(client.company_name)
                return (
                  <div key={client.id} className="group px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div
                        className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: av.bg, color: av.color }}
                      >
                        {initials}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left truncate block"
                        >
                          {client.company_name}
                        </button>
                        <div className="mt-0.5 flex items-center gap-2 sm:gap-3 flex-wrap">
                          {client.eik && (
                            <span className="text-xs text-gray-400 font-mono">ЕИК {client.eik}</span>
                          )}
                          {client.activity && (
                            <span className="hidden sm:inline text-xs text-gray-400 truncate max-w-[200px]">{client.activity}</span>
                          )}
                          {client.tags && client.tags.length > 0 && client.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats (desktop) */}
                      <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900 tabular-nums">{client.submissions_count ?? 0}</p>
                          <p className="text-[10px] text-gray-400">запитвания</p>
                        </div>
                        <div className="text-center hidden lg:block">
                          <p className="text-xs font-medium text-gray-700">{fmtDate(client.last_submission_at)}</p>
                          <p className="text-[10px] text-gray-400">последно</p>
                        </div>
                      </div>

                      {/* Actions (desktop) */}
                      <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => router.push(`/dashboard/new?client=${client.id}`)}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
                        >
                          + Запитване
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Отвори
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(client.id)}
                          className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Изтрий"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Mobile actions + stats */}
                    <div className="flex sm:hidden items-center gap-2 mt-2 ml-12">
                      {(client.submissions_count ?? 0) > 0 && (
                        <span className="text-[10px] text-gray-400 mr-1">{client.submissions_count} запитв.</span>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/new?client=${client.id}`)}
                        className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 active:bg-green-100 min-h-[36px]"
                      >
                        + Запитване
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 active:bg-blue-100 min-h-[36px]"
                      >
                        Отвори
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(client.id)}
                        className="rounded-lg p-1.5 text-gray-400 active:bg-red-50 active:text-red-500 ml-auto min-h-[36px]"
                        title="Изтрий"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Delete modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Изтриване на клиент</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Сигурни ли сте? Действието не може да бъде отменено.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Изтрий
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ hasSearch, onCreate }: { hasSearch: boolean; onCreate: () => void }) {
  if (hasSearch) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-sm text-gray-500">Няма намерени клиенти</p>
        <p className="mt-1 text-xs text-gray-400">Опитайте с различна търсачка</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Няма клиенти</h3>
      <p className="mb-5 text-xs text-gray-400 max-w-xs mx-auto">
        Клиентите се добавят автоматично при запитване, или ги добавете ръчно.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mx-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Нов клиент
      </button>
    </div>
  )
}
