'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useToast } from '@/components/ToastProvider'
import { SubmissionsSkeleton } from '@/components/Skeletons'

interface Comparison {
  id: string
  submission_id?: string | null
  client_name: string
  insurance_class: string
  status: string
  created_at: string
  notes?: string
}

const LS_KEY = 'iu_comparisons'

function loadComparisons(): Comparison[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

function saveComparisons(list: Comparison[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

const CLASS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  property:               { label: 'Имущество',         color: '#166534', bg: '#dcfce7' },
  general_liability:      { label: 'ОГО',               color: '#991b1b', bg: '#fee2e2' },
  occupational_accident:  { label: 'Трудова злополука', color: '#1e3a8a', bg: '#dbeafe' },
  professional_liability: { label: 'Проф. отговорност', color: '#1E2D6B', bg: '#f3e8ff' },
  trade_credit:           { label: 'Търговски кредит',  color: '#92400e', bg: '#fef3c7' },
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Чернова', color: '#6b7280', bg: '#f3f4f6' },
  ready: { label: 'Готово', color: '#166534', bg: '#dcfce7' },
  sent:  { label: 'Изпратено', color: '#1e40af', bg: '#dbeafe' },
}

export default function ComparisonsPage() {
  const router = useRouter()
  const toast = useToast()
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setComparisons(loadComparisons())
    setLoading(false)
    fetch('/api/comparisons')
      .then((r) => r.json())
      .then((d) => {
        if (d.comparisons?.length) {
          setComparisons(d.comparisons)
          saveComparisons(d.comparisons)
        }
      })
      .catch((e) => console.error('Failed to fetch comparisons:', e))
  }, [])

  async function createNew() {
    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: '', insurance_class: 'property' }),
      })
      const data = await res.json()
      if (data.ok && data.comparison?.id) {
        const comp = {
          id: data.comparison.id,
          client_name: '',
          insurance_class: 'property',
          status: 'draft',
          created_at: data.comparison.created_at ?? new Date().toISOString(),
        }
        const updated = [comp, ...comparisons]
        setComparisons(updated)
        saveComparisons(updated)
        router.push(`/dashboard/comparisons/${comp.id}`)
      } else {
        // Fallback: create locally with uuid
        const comp = { id: uuidv4(), client_name: '', insurance_class: 'property', status: 'draft', created_at: new Date().toISOString() }
        const updated = [comp, ...comparisons]
        setComparisons(updated)
        saveComparisons(updated)
        router.push(`/dashboard/comparisons/${comp.id}`)
      }
    } catch {
      const comp = { id: uuidv4(), client_name: '', insurance_class: 'property', status: 'draft', created_at: new Date().toISOString() }
      setComparisons([comp, ...comparisons])
      saveComparisons([comp, ...comparisons])
      router.push(`/dashboard/comparisons/${comp.id}`)
    }
  }

  function deleteComparison(id: string) {
    if (!confirm('Изтриване на сравнението?')) return
    const updated = comparisons.filter((c) => c.id !== id)
    setComparisons(updated)
    saveComparisons(updated)
    fetch(`/api/comparisons?id=${id}`, { method: 'DELETE' }).catch((e) => console.error('Failed to delete comparison:', e))
    toast.success('Сравнението е изтрито')
  }

  function duplicateComparison(comp: Comparison) {
    const newComp: Comparison = {
      ...comp,
      id: uuidv4(),
      status: 'draft',
      created_at: new Date().toISOString(),
      client_name: comp.client_name ? `${comp.client_name} (копие)` : '',
    }
    const updated = [newComp, ...comparisons]
    setComparisons(updated)
    saveComparisons(updated)
    fetch('/api/comparisons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComp),
    }).catch((e) => console.error('Failed to duplicate comparison:', e))
    toast.success('Сравнението е копирано')
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Сравнения на оферти</h1>
          <p className="text-sm text-gray-500 mt-0.5">Сравнете получените оферти от застрахователите</p>
        </div>
        <button
          onClick={createNew}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Ново сравнение
        </button>
      </div>

      {loading ? (
        <SubmissionsSkeleton />
      ) : comparisons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Все още няма сравнения</h3>
          <p className="mb-5 text-xs text-gray-400">Създайте първото сравнение на оферти</p>
          <button onClick={createNew} className="mx-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ново сравнение
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-50">
          {comparisons.map((c) => {
            const cls = CLASS_LABELS[c.insurance_class] ?? CLASS_LABELS.property
            const st = STATUS_LABELS[c.status] ?? STATUS_LABELS.draft
            return (
              <div key={c.id} className="group px-5 py-4 hover:bg-gray-50/80 transition-colors flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {c.client_name || 'Без клиент'}
                    </span>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: cls.bg, color: cls.color }}>
                      {cls.label}
                    </span>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(c.created_at).toLocaleDateString('bg-BG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Action buttons — visible on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateComparison(c)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Копирай"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteComparison(c.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Изтрий"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/comparisons/${c.id}`)}
                    className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                  >
                    Отвори
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
