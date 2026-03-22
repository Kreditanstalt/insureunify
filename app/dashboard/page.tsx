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

interface Profile {
  companyName: string
  email: string
}

const INSURANCE_CLASSES = [
  {
    id:          'property',
    label:       'Имуществено застраховане',
    description: 'Сгради, машини, стоки, оборудване',
    active:      true,
    href:        '/dashboard/new',
  },
  {
    id:          'general_liability',
    label:       'Обща гражданска отговорност',
    description: 'ОГО · Отговорност на работодателя',
    active:      true,
    href:        '/dashboard/new/general-liability',
  },
  {
    id:          'cargo',
    label:       'Товари / CMR',
    description: 'Транспортни рискове',
    active:      false,
    href:        '#',
  },
  {
    id:          'cyber',
    label:       'Кибер застраховка',
    description: 'Cyber & Data Breach',
    active:      false,
    href:        '#',
  },
  {
    id:          'professional',
    label:       'Професионална отговорност',
    description: 'E&O, D&O',
    active:      false,
    href:        '#',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedClass, setSelectedClass] = useState('property')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Auth check
    const auth = localStorage.getItem('iu_auth')
    if (!auth) {
      router.replace('/login')
      return
    }
    setAuthChecked(true)

    // Load profile
    const rawProfile = localStorage.getItem('iu_profile')
    if (!rawProfile) {
      router.replace('/onboarding')
      return
    }
    setProfile(JSON.parse(rawProfile))

    // Load submissions
    const raw = localStorage.getItem('iu_submissions')
    if (raw) {
      try {
        setSubmissions(JSON.parse(raw))
      } catch {
        /* ignore */
      }
    }
  }, [router])

  function handleDelete(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
  }

  function handleLogout() {
    localStorage.removeItem('iu_auth')
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">InsureUnify</span>
          </div>

          <div className="flex items-center gap-3">
            {profile && (
              <span className="hidden sm:block text-sm text-gray-600">
                Здравейте,{' '}
                <span className="font-medium text-gray-900">{profile.companyName}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const cls = INSURANCE_CLASSES.find((c) => c.id === selectedClass)
                router.push(cls?.href ?? '/dashboard/new')
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Нов въпросник
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5"
              title="Изход"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Insurance class selector */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Клас застраховане
          </h2>
          <div className="flex flex-wrap gap-2">
            {INSURANCE_CLASSES.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => {
                  if (!cls.active) return
                  setSelectedClass(cls.id)
                  if (cls.href && cls.href !== '#') router.push(cls.href)
                }}
                disabled={!cls.active}
                title={!cls.active ? 'Очаквайте скоро' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-colors ${
                  cls.active
                    ? selectedClass === cls.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700'
                    : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="font-medium">{cls.label}</span>
                {!cls.active && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-md">
                    скоро
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions list */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Въпросници</h1>
          <span className="text-sm text-gray-400">{submissions.length} записа</span>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Все още няма въпросници
            </h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Създайте първия си унифициран въпросник и генерирайте документи за 3
              застрахователя наведнъж.
            </p>
            <Link
              href="/dashboard/new"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Създай първия въпросник
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 mb-2 truncate">
                      {sub.clientName}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-1.5">
                        {sub.selectedInsurers.map((key) => (
                          <span
                            key={key}
                            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: INSURERS[key].color }}
                          >
                            {INSURERS[key].name}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString('bg-BG', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => router.push(`/review/${sub.id}`)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors font-medium"
                    >
                      Преглед
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-xs px-3 py-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
