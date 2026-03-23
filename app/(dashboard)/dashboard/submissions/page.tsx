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

const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  property:               { label: 'Имущество',         color: '#1B6B3A' },
  general_liability:      { label: 'ОГО / Работодател', color: '#C8102E' },
  occupational_accident:  { label: 'Трудова злополука', color: '#0B3D91' },
  professional_liability: { label: 'Проф. отговорност', color: '#6B21A8' },
}

const CLASS_FILTER_KEYS = ['all', 'property', 'general_liability', 'occupational_accident', 'professional_liability'] as const

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Запитвания</h1>
          <p className="mt-1 text-sm text-gray-500">{submissions.length} общо</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/new')}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ново запитване
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            type="text"
            placeholder="Търси по клиент..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 border-none bg-transparent text-gray-900 outline-none placeholder-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </label>

        {/* Class filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {CLASS_FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setClassFilter(key)}
              className={[
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                classFilter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300',
              ].join(' ')}
            >
              {key === 'all' ? 'Всички' : (CLASS_LABELS[key]?.label ?? key)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table / Empty ── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <p className="text-sm text-gray-500">
            {search || classFilter !== 'all' ? 'Няма намерени резултати' : 'Все още няма запитвания'}
          </p>
          {!search && classFilter === 'all' && (
            <button
              type="button"
              onClick={() => router.push('/dashboard/new')}
              className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Ново запитване
            </button>
          )}
        </div>
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
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => router.push(`/review/${sub.id}`)}
                        className="font-semibold text-gray-900 hover:text-blue-600 text-left transition-colors"
                      >
                        {sub.clientName}
                      </button>
                      <div className="mt-0.5 sm:hidden">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: cls.color }}
                        >
                          {cls.label}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: cls.color }}
                      >
                        {cls.label}
                      </span>
                    </td>
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
                    <td className="hidden px-5 py-3.5 text-xs text-gray-400 lg:table-cell">
                      {fmtDate(sub.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/review/${sub.id}`)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          Преглед
                        </button>
                        <button
                          onClick={() => deleteSubmission(sub.id)}
                          className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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
    </div>
  )
}
