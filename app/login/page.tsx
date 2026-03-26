'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)

    try {
      const supabase = getBrowserClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        console.error('[Login] Auth error:', authError.message, authError.status)

        if (authError.message.includes('Invalid login credentials')) {
          setError('Грешен имейл или парола')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Моля потвърдете имейла си първо')
        } else {
          setError(authError.message)
        }
        return
      }

      if (!data.session) {
        console.error('[Login] No session returned after successful auth')
        setError('Не беше създадена сесия. Моля опитайте отново.')
        return
      }

      // Force a full page navigation to let middleware pick up the new cookie
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('[Login] Unexpected error:', err)
      setError('Грешка при свързване със сървъра')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">InsureUnify</h1>
          <p className="text-sm text-gray-500 mt-1">Единна застрахователна платформа</p>
        </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Парола</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          >
            {loading ? 'Влизане...' : 'Влез в системата'}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link href="/forgot-password" className="text-gray-500 hover:text-blue-600 transition-colors">
              Забравена парола?
            </Link>
            <Link href="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Нямате акаунт? Регистрирайте се &rarr;
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
