'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { getBrowserClient } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const { profile, user, signOut, setProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Profile form state
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')

  // Password form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  // Sync form state when profile loads
  useState(() => {
    if (profile) {
      setCompanyName(profile.company_name)
      setPhone(profile.phone ?? '')
      setAddress(profile.address ?? '')
    }
  })

  async function saveProfile() {
    if (!user || !companyName.trim()) return
    setSaving(true)
    const supabase = getBrowserClient()
    // Try broker_profiles first, then broker_accounts
    let updateError = null
    const { error: e1 } = await supabase
      .from('broker_profiles')
      .update({ company_name: companyName.trim(), phone: phone || null, address: address || null })
      .eq('id', user.id)
    updateError = e1
    if (e1) {
      // Fallback: try broker_accounts via broker_users
      const { data: bu } = await supabase.from('broker_users').select('account_id').eq('user_id', user.id).maybeSingle()
      if (bu?.account_id) {
        const { error: e2 } = await supabase
          .from('broker_accounts')
          .update({ company_name: companyName.trim(), phone: phone || null, address: address || null })
          .eq('id', bu.account_id)
        updateError = e2
      }
    }

    if (!updateError && profile) {
      setProfile({ ...profile, company_name: companyName.trim(), phone, address })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingLogo(true)

    const supabase = getBrowserClient()
    const ext = file.name.split('.').pop()
    const path = `${user.id}/logo.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('broker-logos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('broker-logos')
        .getPublicUrl(path)

      const logoUrl = urlData.publicUrl
      await supabase
        .from('broker_profiles')
        .update({ logo_url: logoUrl })
        .eq('id', user.id)

      if (profile) {
        setProfile({ ...profile, logo_url: logoUrl })
      }
    }
    setUploadingLogo(false)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function changePassword() {
    setPasswordError(null)
    if (newPassword.length < 8) { setPasswordError('Минимум 8 символа'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Паролите не съвпадат'); return }

    const supabase = getBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPasswordError(error.message); return }
    setNewPassword('')
    setConfirmPassword('')
    setPasswordSaved(true)
    setTimeout(() => setPasswordSaved(false), 3000)
  }

  // Trial info
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : null
  const plan = profile?.subscription_plan ?? 'trial'

  const inputClass = 'w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
          <p className="text-sm text-gray-500 mt-1">Управление на профила и акаунта</p>
        </div>

        {/* ── Profile ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Профил</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
                  {profile.company_name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? 'Качване...' : 'Смени логото'}
                </button>
                <p className="text-[11px] text-gray-400 mt-1">JPG, PNG, max 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Фирма</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
              <input type="email" value={profile.email} disabled className={inputClass + ' bg-gray-50 text-gray-500 cursor-not-allowed'} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359..." className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="гр. София, ул..." className={inputClass} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Запазване...' : 'Запази промените'}
              </button>
              {saved && <span className="text-sm text-emerald-600 font-medium">Запазено</span>}
            </div>
          </div>
        </section>

        {/* ── Subscription ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Абонамент</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                plan === 'trial' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {plan === 'trial' ? 'Пробен период' : plan === 'pro' ? 'Pro' : plan}
              </span>
              {trialDaysLeft !== null && plan === 'trial' && (
                <span className="text-sm text-gray-500">
                  {trialDaysLeft > 0 ? `${trialDaysLeft} дни остават` : 'Изтекъл'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              За upgrade на плана, свържете се с нас.
            </p>
            <a
              href="mailto:support@insureunify.bg?subject=Upgrade план"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Свържете се за upgrade
            </a>
          </div>
        </section>

        {/* ── Security ── */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Сигурност</h2>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Нова парола</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Минимум 8 символа" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Потвърди парола</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторете паролата" className={inputClass} />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            <div className="flex items-center gap-3">
              <button
                onClick={changePassword}
                disabled={!newPassword}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Смени паролата
              </button>
              {passwordSaved && <span className="text-sm text-emerald-600 font-medium">Паролата е сменена</span>}
            </div>
          </div>
        </section>

        {/* ── Logout ── */}
        <section className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Изход от акаунта</p>
              <p className="text-xs text-gray-500 mt-0.5">Ще бъдете пренасочени към страницата за вход</p>
            </div>
            <button
              onClick={signOut}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Изход
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
