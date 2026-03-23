'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const CLASSES = [
  {
    id: 'property',
    icon: '🏢',
    label: 'Имущество',
    desc: 'Сгради, машини, стоки, оборудване',
    href: '/dashboard/new/property',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    id: 'professional_liability',
    icon: '⚖️',
    label: 'Проф. отговорност',
    desc: 'E&O · Аксиом, Булстрад, Евроинс',
    href: '/dashboard/new/professional-liability',
    bg: '#faf5ff',
    border: '#e9d5ff',
  },
  {
    id: 'general_liability',
    icon: '🔧',
    label: 'ОГО / Работодател',
    desc: 'Обща гражданска отговорност',
    href: '/dashboard/new/general-liability',
    bg: '#fff1f2',
    border: '#fecdd3',
  },
  {
    id: 'occupational_accident',
    icon: '⚡',
    label: 'Трудова злополука',
    desc: 'Алианц, Групама',
    href: '/dashboard/new/occupational-accident',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'health',
    icon: '🏥',
    label: 'Здравна',
    desc: 'Здравно осигуряване',
    href: null,
    bg: '#f9fafb',
    border: '#e5e7eb',
    soon: true,
  },
]

function ClassPicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get('client')

  function go(href: string | null) {
    if (!href) return
    router.push(clientId ? `${href}?client=${clientId}` : href)
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Ново запитване</h1>
      <p className="text-sm text-gray-500 mb-8">Изберете вид застраховка</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CLASSES.map((cls) => (
          <button
            key={cls.id}
            type="button"
            onClick={() => go(cls.href)}
            disabled={!!cls.soon}
            className={[
              'group flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all',
              cls.soon
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
            ].join(' ')}
            style={{ backgroundColor: cls.bg, borderColor: cls.border }}
          >
            <span className="mt-0.5 flex-shrink-0 text-3xl">{cls.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-gray-900">{cls.label}</p>
                {cls.soon && (
                  <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    скоро
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{cls.desc}</p>
            </div>
            {!cls.soon && (
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-gray-600"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function NewQuestionnairePage() {
  return (
    <Suspense>
      <ClassPicker />
    </Suspense>
  )
}
