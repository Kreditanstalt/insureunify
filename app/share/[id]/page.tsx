'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Offer {
  id: string
  insurer_name: string
  extracted_data: Record<string, unknown>
  is_recommended: boolean
}

interface Comparison {
  id: string
  client_name: string
  insurance_class: string
  status: string
}

const FIELDS = [
  { key: 'premium_annual', label: 'Годишна премия' },
  { key: 'insured_sum', label: 'Застрахователна сума' },
  { key: 'deductible', label: 'Самоучастие' },
  { key: 'payment_terms', label: 'Начин на плащане' },
  { key: 'territory', label: 'Територия' },
  { key: 'valid_until', label: 'Валидна до' },
]

export default function SharePage() {
  const { id } = useParams<{ id: string }>()
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/comparisons/share?token=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setComparison(data.comparison)
          setOffers(data.offers ?? [])
        } else {
          setError(data.error === 'Link expired' ? 'Линкът е изтекъл' : 'Сравнението не е намерено')
        }
      })
      .catch(() => setError('Грешка при зареждане'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !comparison) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">{error ?? 'Не е намерено'}</h1>
          <p className="text-sm text-gray-500">Моля свържете се с вашия застрахователен брокер.</p>
        </div>
      </div>
    )
  }

  const recommended = offers.find((o) => o.is_recommended)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">InsureUnify</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Сравнение на оферти — {comparison.client_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{offers.length} оферти</p>
          </div>
          {recommended && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2">
              <span className="text-sm font-semibold text-emerald-700">Препоръчана: {recommended.insurer_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {offers.length > 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">&nbsp;</th>
                  {offers.map((o) => (
                    <th key={o.id} className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[180px] ${o.is_recommended ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                      {o.insurer_name}
                      {o.is_recommended && <span className="block text-[10px] font-bold mt-0.5">⭐ ПРЕПОРЪЧАНА</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {FIELDS.map((field) => (
                  <tr key={field.key} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{field.label}</td>
                    {offers.map((o) => {
                      const val = o.extracted_data?.[field.key]
                      return (
                        <td key={o.id} className={`px-4 py-2.5 text-sm text-center ${o.is_recommended ? 'bg-emerald-50/50' : ''}`}>
                          {val != null ? String(val) : <span className="text-gray-300">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Coverages */}
                {(() => {
                  const allCov = Array.from(new Set(offers.flatMap((o) => (o.extracted_data?.coverages as string[] | undefined) ?? [])))
                  if (allCov.length === 0) return null
                  return (
                    <>
                      <tr className="bg-gray-50/80">
                        <td colSpan={offers.length + 1} className="px-4 py-2 text-xs font-bold text-gray-600">Покрития</td>
                      </tr>
                      {allCov.map((cov, i) => (
                        <tr key={`cov-${i}`}>
                          <td className="px-4 py-1.5 text-[11px] text-gray-600">{cov}</td>
                          {offers.map((o) => (
                            <td key={o.id} className={`px-4 py-1.5 text-center ${o.is_recommended ? 'bg-emerald-50/50' : ''}`}>
                              {(o.extracted_data?.coverages as string[] | undefined)?.some((c) => c.toLowerCase().includes(cov.toLowerCase())) ? (
                                <svg className="h-4 w-4 mx-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )
                })()}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">Няма добавени оферти</div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">Генерирано с InsureUnify · insureunify.vercel.app</p>
      </div>
    </div>
  )
}
