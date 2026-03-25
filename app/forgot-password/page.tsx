'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)

    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { setError(error.message); return }
      setSent(true)
    } catch {
      setError('Грешка при изпращане')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Забравена парола</h1>
          <p className="text-sm text-gray-500 mt-1">Ще ви изпратим линк за нулиране</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имейл</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="broker@firma.bg"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm"
            >
              {loading ? 'Изпращане...' : 'Изпрати линк'}
            </button>

            <div className="text-center pt-1">
              <Link href="/login" className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                &larr; Обратно към входа
              </Link>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Проверете пощата си</h2>
              <p className="text-sm text-gray-500 mt-1">
                Изпратихме линк за нулиране на <span className="font-medium text-gray-900">{email}</span>
              </p>
            </div>
            <Link href="/login" className="inline-block text-sm text-blue-600 hover:text-blue-800 transition-colors">
              Обратно към входа
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
