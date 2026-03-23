'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { INSURERS } from '@/lib/schema'
import { OA_INSURERS } from '@/lib/oa-schema'

interface Submission {
  id: string
  clientName: string
  selectedInsurers: string[]
  insuranceClass?: string
  createdAt: string
}

const ALL_INSURERS: Record<string, { color: string; name: string }> = {
  ...INSURERS,
  ...OA_INSURERS,
}

const CLASS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  property:               { label: 'Имущество',         color: '#166534', bg: '#dcfce7' },
  general_liability:      { label: 'ОГО / Работодател', color: '#991b1b', bg: '#fee2e2' },
  occupational_accident:  { label: 'Трудова злополука', color: '#1e3a8a', bg: '#dbeafe' },
  professional_liability: { label: 'Проф. отговорност', color: '#1E2D6B', bg: '#f3e8ff' },
  trade_credit:           { label: 'Търговски кредит',  color: '#92400e', bg: '#fef3c7' },
}

const CLASS_FILTER_KEYS = ['all', 'property', 'general_liability', 'occupational_accident', 'professional_liability', 'trade_credit'] as const

const FILTER_LABELS: Record<string, string> = {
  all: 'Всички',
  property: 'Имущество',
  general_liability: 'ОГО',
  occupational_accident: 'Трудова зл.',
  professional_liability: 'Проф. отг.',
  trade_credit: 'Търг. кредит',
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Току-що'
  if (mins < 60)  return `преди ${mins} мин`
  if (hours < 24) return `преди ${hours} ч`
  if (days < 7)   return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<string>('all')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) setSubmissions(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function deleteSubmission(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
  }

  const filtered = useMemo(() => {
    let list = submissions
    if (search) list = list.filter((s) => s.clientName.toLowerCase().includes(search.toLowerCase()))
    if (classFilter !== 'all') list = list.filter((s) => (s.insuranceClass ?? 'property') === classFilter)
    return list
  }, [submissions, search, classFilter])

  // Stats per class
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach(s => {
      const c = s.insuranceClass ?? 'property'
      counts[c] = (counts[c] ?? 0) + 1
    })
    return counts
  }, [submissions])

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Запитвания</h1>
            <p className="mt-0.5 text-sm text-gray-500">{submissions.length} общо</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/new')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ново запитване
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Търси по клиент..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </label>

          <div className="flex flex-wrap gap-1.5">
            {CLASS_FILTER_KEYS.map((key) => {
              const count = key === 'all' ? submissions.length : (classCounts[key] ?? 0)
              const active = classFilter === key
              const cls = CLASS_LABELS[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setClassFilter(key)}
                  className={[
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {FILTER_LABELS[key]}
                  {count > 0 && (
                    <span className={[
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                    ].join(' ')}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── List ── */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="text-sm text-gray-400">
              {search || classFilter !== 'all' ? 'Няма намерени резултати' : 'Все още няма запитвания'}
            </p>
            {!search && classFilter === 'all' && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/new')}
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Ново запитване
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="divide-y divide-gray-50">
              {filtered.map((sub) => {
                const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                const initials = getInitials(sub.clientName)
                return (
                  <div key={sub.id} className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors">

                    {/* Avatar */}
                    <div
                      className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: cls.bg, color: cls.color }}
                    >
                      {initials}
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => router.push(`/review/${sub.id}`)}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {sub.clientName}
                        </button>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: cls.bg, color: cls.color }}
                        >
                          {cls.label}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                        {sub.selectedInsurers.slice(0, 5).map((key) => {
                          const ins = ALL_INSURERS[key]
                          if (!ins) return null
                          return <span key={key} className="text-[11px] text-gray-400">{ins.name}</span>
                        })}
                        {sub.selectedInsurers.length > 5 && (
                          <span className="text-[11px] text-gray-400">+{sub.selectedInsurers.length - 5}</span>
                        )}
                      </div>
                    </div>

                    {/* Date + actions */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <span className="hidden text-xs text-gray-400 sm:block" title={fmtDateFull(sub.createdAt)}>
                        {fmtDate(sub.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/review/${sub.id}`)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Преглед
                        </button>
                        <button
                          onClick={() => deleteSubmission(sub.id)}
                          className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Изтрий"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
