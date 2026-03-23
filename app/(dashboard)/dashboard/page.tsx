'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { INSURERS } from '@/lib/schema'
import { OA_INSURERS } from '@/lib/oa-schema'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Submission {
  id:               string
  clientName:       string
  selectedInsurers: string[]
  insuranceClass?:  string
  createdAt:        string
}

interface Profile {
  companyName: string
  email:       string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_INSURERS: Record<string, { color: string; name: string }> = {
  ...INSURERS,
  ...OA_INSURERS,
}

const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  property:               { label: 'Имущество',         color: '#1B6B3A' },
  general_liability:      { label: 'ОГО / Работодател', color: '#C8102E' },
  occupational_accident:  { label: 'Трудова злополука', color: '#0B3D91' },
  professional_liability: { label: 'Проф. отговорност', color: '#6B21A8' },
}

const QUICK_ACTIONS = [
  {
    icon:   '🏢',
    label:  'Имущество',
    desc:   'Сгради, машини, стоки, оборудване',
    href:   '/dashboard/new/property',
    color:  '#1B6B3A',
    bg:     '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    icon:   '⚖️',
    label:  'Проф. отговорност',
    desc:   'E&O · Аксиом, Булстрад, Евроинс',
    href:   '/dashboard/new/professional-liability',
    color:  '#6B21A8',
    bg:     '#faf5ff',
    border: '#e9d5ff',
  },
  {
    icon:   '🔧',
    label:  'ОГО / Работодател',
    desc:   'Обща гражданска отговорност',
    href:   '/dashboard/new/general-liability',
    color:  '#C8102E',
    bg:     '#fff1f2',
    border: '#fecdd3',
  },
  {
    icon:   '⚡',
    label:  'Трудова злополука',
    desc:   'Алианц, Групама',
    href:   '/dashboard/new/occupational-accident',
    color:  '#0B3D91',
    bg:     '#eff6ff',
    border: '#bfdbfe',
  },
]

// ─── Helper: format date ──────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

function fmtToday() {
  return new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [profile,     setProfile]     = useState<Profile | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search,      setSearch]      = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Auth guard
    const auth = localStorage.getItem('iu_auth')
    if (!auth) { router.replace('/login'); return }

    // Profile guard
    const rawProfile = localStorage.getItem('iu_profile')
    if (!rawProfile) { router.replace('/onboarding'); return }
    setProfile(JSON.parse(rawProfile))
    setAuthChecked(true)

    // Submissions
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) setSubmissions(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [router])

  function deleteSubmission(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
  }

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length
    const now   = new Date()
    const thisMonth = submissions.filter((s) => {
      const d = new Date(s.createdAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    const uniqueClients = new Set(submissions.map((s) => s.clientName.trim().toLowerCase())).size
    return { total, thisMonth, uniqueClients }
  }, [submissions])

  // Filtered list
  const filtered = useMemo(
    () =>
      search
        ? submissions.filter((s) =>
            s.clientName.toLowerCase().includes(search.toLowerCase())
          )
        : submissions,
    [submissions, search],
  )

  if (!authChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  const today = fmtToday()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-8">

      {/* ── Welcome ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Добре дошли{profile ? `, ${profile.companyName}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">{today}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/new')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ново запитване
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard value={stats.total}        label="Общо запитвания"    icon="📊" />
        <StatCard value={stats.thisMonth}    label="Този месец"         icon="📅" />
        <StatCard value={stats.uniqueClients} label="Уникални клиенти" icon="👥" />
      </div>

      {/* ── Quick actions ── */}
      <section>
        <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-gray-400">
          Ново запитване по клас
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.href}
              type="button"
              onClick={() => router.push(action.href)}
              className="group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md"
              style={{ backgroundColor: action.bg, borderColor: action.border }}
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{action.desc}</p>
              </div>
              <span
                className="mt-auto rounded-lg px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: action.color }}
              >
                Ново →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Submissions list ── */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-gray-400">
            Последни запитвания
            {submissions.length > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500 normal-case tracking-normal">
                {submissions.length}
              </span>
            )}
          </h2>
          {/* Search */}
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-500 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Търси по клиент..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40 border-none bg-transparent text-gray-900 outline-none placeholder-gray-400 sm:w-52"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 ml-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </label>
        </div>

        {filtered.length === 0 ? (
          <EmptyState hasSearch={!!search} onNew={() => router.push('/dashboard/new')} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Клиент</th>
                  <th className="hidden px-5 py-3 sm:table-cell">Клас</th>
                  <th className="hidden px-5 py-3 md:table-cell">Застрахователи</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Дата</th>
                  <th className="px-5 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((sub) => {
                  const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                  return (
                    <tr key={sub.id} className="group hover:bg-gray-50 transition-colors">
                      {/* Client name */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => router.push(`/review/${sub.id}`)}
                          className="font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
                        >
                          {sub.clientName}
                        </button>
                        {/* Mobile: class label */}
                        <div className="mt-0.5 sm:hidden">
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: cls.color }}
                          >
                            {cls.label}
                          </span>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="hidden px-5 py-3.5 sm:table-cell">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                          style={{ backgroundColor: cls.color }}
                        >
                          {cls.label}
                        </span>
                      </td>

                      {/* Insurers */}
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {sub.selectedInsurers.map((key) => {
                            const ins = ALL_INSURERS[key]
                            if (!ins) return null
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                style={{ backgroundColor: ins.color }}
                              >
                                {ins.name}
                              </span>
                            )
                          })}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="hidden px-5 py-3.5 text-xs text-gray-400 lg:table-cell">
                        {fmtDate(sub.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/review/${sub.id}`)}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                          >
                            Преглед
                          </button>
                          <button
                            onClick={() => deleteSubmission(sub.id)}
                            className="rounded-lg px-2 py-1.5 text-xs text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Изтрий"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasSearch, onNew }: { hasSearch: boolean; onNew: () => void }) {
  if (hasSearch) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-gray-500 text-sm">Няма намерени резултати</p>
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
        <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">Все още няма запитвания</h3>
      <p className="mb-6 text-sm text-gray-500">Създайте първото запитване за клиент</p>
      <button
        type="button"
        onClick={onNew}
        className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ново запитване
      </button>
    </div>
  )
}
