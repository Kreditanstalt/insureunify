'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { PLAN_LABELS } from '@/lib/planLimits'
import { getBrowserClient } from '@/lib/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const { profile, user, signOut, setProfile, plan, usage, trialDaysLeft, isTrialExpired } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Profile form state
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [brandColor, setBrandColor] = useState(profile?.brand_color ?? '#2563EB')

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
      .update({ company_name: companyName.trim(), phone: phone || null, address: address || null, brand_color: brandColor || null })
      .eq('id', user.id)
    updateError = e1
    if (e1) {
      // Fallback: try broker_accounts via broker_users
      const { data: bu } = await supabase.from('broker_users').select('account_id').eq('user_id', user.id).maybeSingle()
      if (bu?.account_id) {
        const { error: e2 } = await supabase
          .from('broker_accounts')
          .update({ company_name: companyName.trim(), phone: phone || null, address: address || null, brand_color: brandColor || null })
          .eq('id', bu.account_id)
        updateError = e2
      }
    }

    if (!updateError && profile) {
      setProfile({ ...profile, company_name: companyName.trim(), phone, address, brand_color: brandColor })
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
                <img src={profile.logo_url} alt="" width={56} height={56} className="h-14 w-14 rounded-xl object-cover border border-gray-200" loading="lazy" />
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
            {/* Brand color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цвят на бранда</label>
              <div className="flex items-center gap-3">
                <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="h-9 w-14 rounded-lg border border-gray-300 cursor-pointer" />
                <div className="flex gap-1.5">
                  {['#2563EB', '#0B3D91', '#C8102E', '#1B6B3A', '#6B21A8', '#92400e', '#0891b2'].map((c) => (
                    <button key={c} type="button" onClick={() => setBrandColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${brandColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
                <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)}
                  className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-mono text-gray-600" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Този цвят се използва в sidebar-а, бутоните и PDF документите</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
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
          <div className="p-5 space-y-5">
            {/* Current plan */}
            {plan && (() => {
              const pi = PLAN_LABELS[plan.plan_id] ?? PLAN_LABELS.trial
              const usageCount = usage?.submissions_count ?? 0
              const usageMax = plan.max_submissions_monthly
              const pct = usageMax ? Math.round((usageCount / usageMax) * 100) : 0
              return (
                <div className="rounded-xl border-2 p-4" style={{ borderColor: pi.color + '40' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: pi.bg, color: pi.color }}>
                      {pi.label}
                    </span>
                    {plan.plan_id === 'trial' && trialDaysLeft !== null && (
                      <span className={`text-xs font-medium ${isTrialExpired ? 'text-red-600' : trialDaysLeft <= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                        {isTrialExpired ? 'Изтекъл' : `${trialDaysLeft} ${trialDaysLeft === 1 ? 'ден' : 'дни'} остават`}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      До {plan.max_insurers_per_submission ?? '4'} застрахователя на заявка
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {usageMax ? `${usageMax} заявки / месец` : 'Неограничени заявки'}
                    </div>
                  </div>
                  {usageMax && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Използвани</span>
                        <span className="font-semibold text-gray-700">{usageCount} / {usageMax}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 rounded-full transition-all" style={{
                          width: `${Math.min(100, pct)}%`,
                          backgroundColor: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Plan options */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Налични планове</p>
              <div className="grid gap-3">
                {[
                  { id: 'trial', name: 'Пробен', desc: '14 дни безплатно', features: ['До 4 застрахователя', '10 заявки / месец'] },
                  { id: 'basic', name: 'Basic', desc: 'За малки брокери', features: ['До 6 застрахователя', '50 заявки / месец', 'Имейл поддръжка'] },
                  { id: 'pro', name: 'Pro', desc: 'За професионалисти', features: ['Неограничени застрахователи', 'Неограничени заявки', 'Приоритетна поддръжка', 'API достъп'] },
                ].map((p) => {
                  const isCurrent = plan?.plan_id === p.id
                  const pi = PLAN_LABELS[p.id] ?? PLAN_LABELS.trial
                  return (
                    <div key={p.id} className={`rounded-xl border p-4 ${isCurrent ? 'border-2 bg-gray-50' : 'border-gray-200'}`} style={isCurrent ? { borderColor: pi.color } : undefined}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{p.name}</span>
                          <span className="text-xs text-gray-500">{p.desc}</span>
                        </div>
                        {isCurrent ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Текущ</span>
                        ) : (
                          <a
                            href={`mailto:info@insureunify.online?subject=${encodeURIComponent(`Надграждане на план - ${profile?.company_name ?? ''}`)}&body=${encodeURIComponent(`Искам да надградя към план ${p.name}.\n\nФирма: ${profile?.company_name ?? ''}\nИмейл: ${profile?.email ?? ''}`)}`}
                            className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
                            style={{ backgroundColor: pi.bg, color: pi.color }}
                          >
                            Надградете
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {p.features.map((f) => (
                          <span key={f} className="flex items-center gap-1 text-xs text-gray-500">
                            <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
