'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { INSURERS } from '@/lib/schema'
import { OA_INSURERS } from '@/lib/oa-schema'
import { storeRenewalData, classToFormUrl } from '@/lib/renewal'
import { fmtDate, fmtDateFull, getInitials, normalizeSubmission } from '@/lib/formatters'

interface Submission {
  id: string
  clientName: string
  selectedInsurers: string[]
  insuranceClass?: string
  formData?: Record<string, unknown>
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

export default function SubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<string>('all')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [comparisonSubmissionIds, setComparisonSubmissionIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load comparison submission IDs from localStorage first
    try {
      const comps = JSON.parse(localStorage.getItem('iu_comparisons') ?? '[]')
      const ids = new Set<string>(comps.map((c: { submission_id?: string }) => c.submission_id).filter(Boolean))
      setComparisonSubmissionIds(ids)
    } catch (e) { console.error('Failed to parse localStorage comparisons:', e) }
    // Also try Supabase
    fetch('/api/comparisons')
      .then((r) => r.json())
      .then((d) => {
        if (d.comparisons?.length) {
          const ids = new Set<string>((d.comparisons).map((c: { submission_id?: string }) => c.submission_id).filter(Boolean))
          setComparisonSubmissionIds(ids)
        }
      })
      .catch((e) => console.error('Failed to fetch comparisons:', e))

    // Try Supabase first, fall back to localStorage
    fetch('/api/submissions')
      .then((r) => r.json())
      .then((d) => {
        if (d.submissions?.length) {
          // Normalize snake_case from Supabase → camelCase
          const normalized = d.submissions.map((s: Record<string, unknown>) => normalizeSubmission(s))
          setSubmissions(normalized)
        }
      })
      .catch((e) => {
        console.error('Failed to fetch submissions:', e)
        try {
          const raw = localStorage.getItem('iu_submissions')
          if (raw) setSubmissions(JSON.parse(raw))
        } catch (parseErr) { console.error('Failed to parse localStorage submissions:', parseErr) }
      })
    // Also load from localStorage immediately as cache
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) setSubmissions(JSON.parse(raw))
    } catch (e) { console.error('Failed to parse localStorage submissions:', e) }
  }, [])

  function deleteSubmission(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
    fetch('/api/submissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(console.error)
  }

  function renewSubmission(sub: Submission) {
    const cls = sub.insuranceClass ?? 'property'
    storeRenewalData({
      renewedFromId: sub.id,
      insuranceClass: cls,
      selectedInsurers: sub.selectedInsurers,
      formData: sub.formData ?? {},
    })
    router.push(classToFormUrl(cls))
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(s => s.id)))
    }
  }

  async function bulkDelete() {
    if (!confirm(`Изтриване на ${selected.size} запитвания?`)) return
    const ids = Array.from(selected)
    // Delete from API (parallel)
    await Promise.all(ids.map(id =>
      fetch('/api/submissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch((e) => console.error('Failed to delete submission:', e))
    ))
    // Update state
    setSubmissions(prev => {
      const next = prev.filter(s => !selected.has(s.id))
      // Update localStorage cache
      try { localStorage.setItem('iu_submissions', JSON.stringify(next)) } catch (e) { console.error('Failed to update localStorage:', e) }
      return next
    })
    setSelected(new Set())
  }

  function bulkExport() {
    const data = submissions.filter(s => selected.has(s.id))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `insureunify_export_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
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
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-5 sm:space-y-6">

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
              {/* Select-all header */}
              <div className="px-4 sm:px-5 py-2 flex items-center gap-3 bg-gray-50/50 border-b border-gray-100">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={selectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-500">Избери всички</span>
              </div>
              {filtered.map((sub) => {
                const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                const initials = getInitials(sub.clientName)
                return (
                  <div key={sub.id} className="group px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50/80 transition-colors">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selected.has(sub.id)}
                        onChange={() => toggleSelect(sub.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
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
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                          >
                            {sub.clientName}
                          </button>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: cls.bg, color: cls.color }}
                          >
                            {cls.label}
                          </span>
                          {comparisonSubmissionIds.has(sub.id) && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600" title="Има сравнение на оферти">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-400 sm:hidden" title={fmtDateFull(sub.createdAt)}>
                            {fmtDate(sub.createdAt)}
                          </span>
                          {sub.selectedInsurers.slice(0, 5).map((key) => {
                            const ins = ALL_INSURERS[key]
                            if (!ins) return null
                            return <span key={key} className="hidden sm:inline text-[11px] text-gray-400">{ins.name}</span>
                          })}
                          {sub.selectedInsurers.length > 5 && (
                            <span className="hidden sm:inline text-[11px] text-gray-400">+{sub.selectedInsurers.length - 5}</span>
                          )}
                        </div>
                      </div>

                      {/* Date + actions (desktop) */}
                      <div className="flex-shrink-0 hidden sm:flex items-center gap-3">
                        <span className="text-xs text-gray-400" title={fmtDateFull(sub.createdAt)}>
                          {fmtDate(sub.createdAt)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => renewSubmission(sub)}
                            className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Подновяване"
                          >
                            Обнови
                          </button>
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

                    {/* Mobile action buttons */}
                    <div className="flex sm:hidden items-center gap-2 mt-2 ml-12">
                      <button
                        onClick={() => renewSubmission(sub)}
                        className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 active:bg-emerald-100 min-h-[36px]"
                      >
                        Обнови
                      </button>
                      <button
                        onClick={() => router.push(`/review/${sub.id}`)}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 active:bg-blue-100 min-h-[36px]"
                      >
                        Преглед
                      </button>
                      <button
                        onClick={() => deleteSubmission(sub.id)}
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

      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-xl bg-gray-900 px-5 py-3 shadow-xl text-white">
          <span className="text-sm font-medium">{selected.size} избрани</span>
          <button onClick={bulkExport} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors">Експорт</button>
          <button onClick={bulkDelete} className="rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium hover:bg-red-500 transition-colors">Изтрий</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-white transition-colors">Отказ</button>
        </div>
      )}
    </div>
  )
}
