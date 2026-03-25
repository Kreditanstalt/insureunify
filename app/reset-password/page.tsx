'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [initializing, setInitializing] = useState(true)

  // On mount, Supabase client auto-detects the recovery token from the URL hash
  // (#access_token=...&type=recovery) and establishes a session.
  useEffect(() => {
    const supabase = getBrowserClient()

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[ResetPassword] Auth event:', event)
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessionReady(true)
        setInitializing(false)
      }
    })

    // Also check if we already have a session (user may have been redirected with token already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      }
      setInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Паролата трябва да е минимум 8 символа'); return }
    if (password !== confirmPassword) { setError('Паролите не съвпадат'); return }

    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        console.error('[ResetPassword] Update error:', updateError)
        setError(updateError.message)
        return
      }
      setSuccess(true)
      // Redirect to dashboard after short delay
      setTimeout(() => { window.location.href = '/dashboard' }, 1500)
    } catch {
      setError('Грешка при обновяване на паролата')
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Нова парола</h1>
          <p className="text-sm text-gray-500 mt-1">Въведете новата си парола</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Паролата е сменена</h2>
              <p className="text-sm text-gray-500 mt-1">Пренасочване към началната страница...</p>
            </div>
          </div>
        ) : !sessionReady ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Линкът е невалиден или изтекъл</h2>
              <p className="text-sm text-gray-500 mt-1">Моля поискайте нов линк за нулиране на парола.</p>
            </div>
            <Link href="/forgot-password" className="inline-block text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
              Изпрати нов линк &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Нова парола</label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 8 символа"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Потвърди парола</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторете паролата"
                className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                  confirmPassword && confirmPassword !== password ? 'border-red-300' : 'border-gray-300'
                } text-gray-900`}
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
              {loading ? 'Обновяване...' : 'Запази нова парола'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
