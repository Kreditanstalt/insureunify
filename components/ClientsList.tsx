'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getClients, deleteClient, syncClientsFromSubmissions, type ClientProfile } from '@/lib/clients'

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASS_LABELS: Record<string, string> = {
  property:               'Имущество',
  general_liability:      'ОГО',
  occupational_accident:  'Труд. зл.',
  professional_liability: 'Проф. отг.',
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ClientsList() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [search, setSearch] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    syncClientsFromSubmissions()
    setClients(getClients())
    setSynced(true)
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
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">

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
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
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

      {/* ── Table ── */}
      {!synced ? (
        <SkeletonTable />
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={!!search.trim()} onCreate={() => router.push('/dashboard/clients/new')} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Наименование</th>
                  <th className="px-5 py-3">ЕИК</th>
                  <th className="hidden lg:table-cell px-5 py-3">Дейност</th>
                  <th className="px-5 py-3 text-center">Запитвания</th>
                  <th className="px-5 py-3">Последно</th>
                  <th className="px-5 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((client) => (
                  <tr key={client.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {client.company_name}
                      </button>
                      {client.tags && client.tags.length > 0 && (
                        <div className="mt-1 flex gap-1 flex-wrap">
                          {client.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">{client.eik || '—'}</td>
                    <td className="hidden lg:table-cell px-5 py-3.5 text-gray-500 text-xs max-w-[200px] truncate">{client.activity || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      {(client.submissions_count ?? 0) > 0 ? (
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 min-w-[24px]">
                          {client.submissions_count}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(client.last_submission_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          Отвори
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/new?client=${client.id}`)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700"
                        >
                          + Запитване
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(client.id)}
                          className="rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Изтрий"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((client) => (
              <div key={client.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                      className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {client.company_name}
                    </button>
                    {client.eik && <p className="mt-0.5 text-xs text-gray-400 font-mono">ЕИК: {client.eik}</p>}
                    {client.activity && <p className="mt-0.5 text-xs text-gray-500 truncate">{client.activity}</p>}
                  </div>
                  {(client.submissions_count ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      {client.submissions_count}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                    className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-medium text-gray-700 text-center transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    Отвори
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/new?client=${client.id}`)}
                    className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-medium text-gray-700 text-center transition-colors hover:bg-green-50 hover:text-green-700"
                  >
                    + Запитване
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-gray-900">Изтриване на клиент</h3>
            <p className="mt-2 text-sm text-gray-500">
              Сигурни ли сте, че искате да изтриете този клиент? Действието не може да бъде отменено.
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отказ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
            <div className="ml-auto h-4 w-16 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ hasSearch, onCreate }: { hasSearch: boolean; onCreate: () => void }) {
  if (hasSearch) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-sm text-gray-500">Няма намерени клиенти</p>
        <p className="mt-1 text-xs text-gray-400">Опитайте с друга търсачка</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
        <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">Няма клиенти</h3>
      <p className="mb-2 text-sm text-gray-500 max-w-sm mx-auto">
        Клиентите се добавят автоматично при създаване на запитване, или можете да добавите ръчно.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Нов клиент
      </button>
    </div>
  )
}
