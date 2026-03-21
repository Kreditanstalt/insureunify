'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { INSURERS, InsurerKey } from '@/lib/schema'

interface Submission {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('iu_submissions')
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
  }, [])

  function handleDelete(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg">InsureUnify</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">Имуществено застраховане</span>
            <Link
              href="/dashboard/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Нов въпросник
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Въпросници</h1>
          <span className="text-sm text-gray-500">{submissions.length} записа</span>
        </div>

        {submissions.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Все още няма въпросници</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Създайте първия си унифициран въпросник и генерирайте документи за 3 застрахователя наведнъж.
            </p>
            <Link
              href="/dashboard/new"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Създай първия въпросник
            </Link>
          </div>
        ) : (
          /* Submissions list */
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white mb-1 truncate">{sub.clientName}</div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Insurer badges */}
                      <div className="flex gap-1.5">
                        {sub.selectedInsurers.map((key) => (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: INSURERS[key].color + 'cc' }}
                          >
                            {INSURERS[key].name}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(sub.createdAt).toLocaleDateString('bg-BG', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/review/${sub.id}`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                    >
                      Преглед
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Изтрий
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
