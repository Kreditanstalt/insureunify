'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBrowserClient } from '@/lib/supabase'

function getStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { level: 1, label: 'Слаба', color: '#ef4444' }
  if (score <= 2) return { level: 2, label: 'Средна', color: '#f59e0b' }
  if (score <= 3) return { level: 3, label: 'Добра', color: '#3b82f6' }
  return { level: 4, label: 'Силна', color: '#22c55e' }
}

export default function RegisterPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const strength = getStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!companyName.trim()) { setError('Моля въведете името на фирмата'); return }
    if (password.length < 8) { setError('Паролата трябва да е минимум 8 символа'); return }
    if (password !== confirmPassword) { setError('Паролите не съвпадат'); return }

    setLoading(true)
    try {
      const supabase = getBrowserClient()

      // 1. Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { company_name: companyName.trim() },
        },
      })
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('Този имейл вече е регистриран')
        } else {
          setError(signUpError.message)
        }
        return
      }

      // 2. Create broker profile (try broker_profiles, fall back silently if table doesn't exist)
      if (data.user) {
        try {
          await supabase.from('broker_profiles').upsert({
            id: data.user.id,
            company_name: companyName.trim(),
            email,
          })
        } catch { /* table may not exist */ }
      }

      // Use full page navigation to ensure cookies are picked up
      window.location.href = '/dashboard'
    } catch {
      setError('Грешка при регистрация')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Създайте акаунт</h1>
          <p className="text-sm text-gray-500 mt-1">Започнете с 14 дни безплатен пробен период</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Фирма / Брокерска компания</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Имейл</label>
            <input
              type="email"
              required
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
              placeholder="Минимум 8 символа"
              className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: i <= strength.level ? strength.color : '#e5e7eb' }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
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
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm shadow-sm"
          >
            {loading ? 'Създаване...' : 'Създайте акаунт — 14 дни безплатно'}
          </button>

          <p className="text-center text-[11px] text-gray-400">Не се изисква кредитна карта</p>

          <div className="text-center pt-1">
            <Link href="/login" className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Имате акаунт? Влезте &rarr;
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
