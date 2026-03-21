'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // If already has profile, skip onboarding
    const profile = localStorage.getItem('iu_profile')
    if (profile) router.replace('/dashboard')
  }, [router])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim()) return
    setSaving(true)
    const auth = JSON.parse(localStorage.getItem('iu_auth') ?? '{}')
    localStorage.setItem(
      'iu_profile',
      JSON.stringify({ companyName: companyName.trim(), email: auth.email ?? '' })
    )
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <svg
              className="w-7 h-7 text-white"
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
          <h1 className="text-2xl font-bold text-gray-900">Добре дошли!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Нека настроим вашия акаунт
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Название на брокерската компания
            </label>
            <input
              type="text"
              required
              autoFocus
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Брокер Иванов ЕООД"
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !companyName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          >
            {saving ? 'Запазване…' : 'Продължи →'}
          </button>
        </form>
      </div>
    </div>
  )
}
