'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { INSURERS } from '@/lib/schema'
import { OA_INSURERS } from '@/lib/oa-schema'
import { storeRenewalData, classToFormUrl } from '@/lib/renewal'
import { getAllDrafts, deleteDraft, CLASS_META, timeAgo } from '@/lib/drafts'
import type { Draft } from '@/lib/drafts'

interface Submission {
  id:               string
  clientName:       string
  selectedInsurers: string[]
  insuranceClass?:  string
  formData?:        Record<string, unknown>
  createdAt:        string
}

interface Profile {
  companyName: string
  email:       string
}

const ALL_INSURERS: Record<string, { color: string; name: string }> = {
  ...INSURERS,
  ...OA_INSURERS,
}

const CLASS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  property:               { label: 'Имущество',         color: '#166534', bg: '#dcfce7' },
  general_liability:      { label: 'ОГО / Работодател', color: '#991b1b', bg: '#fee2e2' },
  occupational_accident:  { label: 'Трудова злополука', color: '#1e3a8a', bg: '#dbeafe' },
  professional_liability: { label: 'Проф. отговорност', color: '#1E2D6B', bg: '#f3e8ff' },
  trade_credit:           { label: 'Търговски кредит',  color: '#92400e', bg: '#fef3c7' },
}

const QUICK_ACTIONS = [
  { icon: '🏢', label: 'Имущество',         desc: 'Сгради, машини, стоки',  href: '/dashboard/new/property',               accent: '#16a34a', light: '#f0fdf4' },
  { icon: '⚖️', label: 'Проф. отговорност', desc: 'E&O · Аксиом, Булстрад', href: '/dashboard/new/professional-liability',  accent: '#6B21A8', light: '#faf5ff' },
  { icon: '🔧', label: 'ОГО / Работодател', desc: 'Обща гражданска',        href: '/dashboard/new/general-liability',       accent: '#dc2626', light: '#fff1f2' },
  { icon: '⚡', label: 'Трудова злополука', desc: 'Алианц, Групама',        href: '/dashboard/new/occupational-accident',   accent: '#2563eb', light: '#eff6ff' },
  { icon: '💳', label: 'Търговски кредит',  desc: 'Атрадиус, Алианц Трейд', href: '/dashboard/new/trade-credit',           accent: '#92400e', light: '#fef3c7' },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Току-що'
  if (mins < 60)  return `преди ${mins} мин`
  if (hours < 24) return `преди ${hours} ч`
  if (days < 7)   return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateFull(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Добро утро'
  if (h < 18) return 'Добър ден'
  return 'Добър вечер'
}

function fmtToday() {
  return new Date().toLocaleDateString('bg-BG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

export default function DashboardPage() {
  const router = useRouter()
  const [profile,     setProfile]     = useState<Profile | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [search,      setSearch]      = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrated, setMigrated] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])

  useEffect(() => {
    const auth = localStorage.getItem('iu_auth')
    if (!auth) { router.replace('/login'); return }
    const rawProfile = localStorage.getItem('iu_profile')
    if (!rawProfile) { router.replace('/onboarding'); return }
    setProfile(JSON.parse(rawProfile))
    setAuthChecked(true)

    // Load from localStorage immediately (cache)
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) setSubmissions(JSON.parse(raw))
    } catch { /* ignore */ }

    // Load drafts
    setDrafts(getAllDrafts())

    // Then fetch from Supabase
    fetch('/api/submissions')
      .then((r) => r.json())
      .then((d) => {
        if (d.submissions?.length) {
          const normalized = d.submissions.map((s: Record<string, unknown>) => ({
            id:               s.id,
            clientName:       s.client_name ?? s.clientName,
            insuranceClass:   s.insurance_class ?? s.insuranceClass,
            selectedInsurers: s.selected_insurers ?? s.selectedInsurers ?? [],
            formData:         s.form_data ?? s.formData ?? {},
            createdAt:        s.created_at ?? s.createdAt,
          }))
          setSubmissions(normalized)
        }
      })
      .catch(() => {/* offline — localStorage is fine */})

    // Auto-migrate localStorage data to Supabase once
    const migrationDone = localStorage.getItem('iu_migrated_to_supabase')
    if (!migrationDone) {
      setMigrating(true)
      const subs = JSON.parse(localStorage.getItem('iu_submissions') ?? '[]')
      const clients = JSON.parse(localStorage.getItem('iu_clients') ?? '[]')
      const migrateBatch = async () => {
        try {
          // Migrate submissions
          await Promise.all(subs.map((s: Record<string, unknown>) =>
            fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
          ))
          // Migrate clients
          await Promise.all(clients.map((c: Record<string, unknown>) =>
            fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c) })
          ))
          localStorage.setItem('iu_migrated_to_supabase', '1')
          setMigrated(true)
        } catch { /* ignore */ } finally { setMigrating(false) }
      }
      if (subs.length > 0 || clients.length > 0) migrateBatch()
      else { localStorage.setItem('iu_migrated_to_supabase', '1'); setMigrating(false) }
    }
  }, [router])

  function deleteSubmission(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
    fetch('/api/submissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(console.error)
  }

  function renewSubmission(sub: Submission) {
    const cls = sub.insuranceClass ?? 'property'
    storeRenewalData({
      renewedFromId: sub.id,
      insuranceClass: cls,
      selectedInsurers: sub.selectedInsurers,
      formData: sub.formData ?? {},
    })
    router.push(classToFormUrl(cls))
  }

  const stats = useMemo(() => {
    const total = submissions.length
    const now = new Date()
    const thisMonth = submissions.filter((s) => {
      const d = new Date(s.createdAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
    const uniqueClients = new Set(submissions.map((s) => s.clientName.trim().toLowerCase())).size
    return { total, thisMonth, uniqueClients }
  }, [submissions])

  const filtered = useMemo(
    () => search
      ? submissions.filter((s) => s.clientName.toLowerCase().includes(search.toLowerCase()))
      : submissions.slice(0, 10),
    [submissions, search],
  )

  if (!authChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-5 sm:space-y-7">

        {/* Migration banner */}
        {migrating && (
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
            <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
            Синхронизиране на данни с облака…
          </div>
        )}
        {migrated && !migrating && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
            <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Данните са успешно синхронизирани с облака.
          </div>
        )}

        {/* ── Hero header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-7 py-7 text-white shadow-lg shadow-blue-200">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-4 top-10 h-28 w-28 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1 capitalize">{fmtToday()}</p>
              <h1 className="text-2xl font-bold leading-tight">
                {getGreeting()}{profile ? `, ${profile.companyName}` : ''}
              </h1>
              <p className="mt-1.5 text-blue-200 text-sm">
                {stats.total === 0
                  ? 'Добре дошли в InsureUnify — готови ли сте за първото запитване?'
                  : `${stats.total} запитвания · ${stats.uniqueClients} клиенти`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard/new')}
              className="flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/25 hover:scale-[1.02] active:scale-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ново запитване
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            value={stats.total}
            label="Общо запитвания"
            sublabel={stats.thisMonth > 0 ? `+${stats.thisMonth} този месец` : 'Все още няма'}
            color="#2563eb"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            value={stats.thisMonth}
            label="Този месец"
            sublabel={new Date().toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' })}
            color="#7c3aed"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            }
          />
          <StatCard
            value={stats.uniqueClients}
            label="Клиенти"
            sublabel="Уникални"
            color="#059669"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
        </div>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Бързо запитване</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.href}
                type="button"
                onClick={() => router.push(action.href)}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ background: `radial-gradient(circle at top left, ${action.light}, transparent 70%)` }}
                />
                <div className="relative">
                  <div
                    className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: action.light }}
                  >
                    {action.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{action.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400 leading-snug">{action.desc}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-medium" style={{ color: action.accent }}>
                    Започни
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Drafts ── */}
        {drafts.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Чернови
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600 normal-case tracking-normal">
                {drafts.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {drafts.map((d) => {
                const meta = CLASS_META[d.insuranceClass]
                return (
                  <div key={d.key} className="group relative rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-amber-300">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg flex-shrink-0">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {d.clientName || 'Без клиент'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{meta.label}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{timeAgo(d.savedAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          deleteDraft(d.insuranceClass, d.eik)
                          setDrafts((prev) => prev.filter((x) => x.key !== d.key))
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex-shrink-0"
                        title="Изтрий черновата"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(meta.href)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                      Продължи
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Recent submissions ── */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Последни запитвания
              {submissions.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 normal-case tracking-normal">
                  {submissions.length}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Търси..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-36 border-none bg-transparent text-sm text-gray-900 outline-none placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-300 hover:text-gray-500">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </label>
              {submissions.length > 0 && (
                <button
                  onClick={() => router.push('/dashboard/submissions')}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  Всички →
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState hasSearch={!!search} onNew={() => router.push('/dashboard/new')} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="divide-y divide-gray-50">
                {filtered.map((sub) => {
                  const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                  const initials = getInitials(sub.clientName)
                  return (
                    <div key={sub.id} className="group px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-gray-50/80 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className="flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: cls.bg, color: cls.color }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => router.push(`/review/${sub.id}`)}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                            >
                              {sub.clientName}
                            </button>
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: cls.bg, color: cls.color }}
                            >
                              {cls.label}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-400 sm:hidden" title={fmtDateFull(sub.createdAt)}>
                              {fmtDate(sub.createdAt)}
                            </span>
                            {sub.selectedInsurers.slice(0, 4).map((key) => {
                              const ins = ALL_INSURERS[key]
                              if (!ins) return null
                              return <span key={key} className="hidden sm:inline text-[11px] text-gray-400">{ins.name}</span>
                            })}
                            {sub.selectedInsurers.length > 4 && (
                              <span className="hidden sm:inline text-[11px] text-gray-400">+{sub.selectedInsurers.length - 4}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <span className="hidden text-xs text-gray-400 sm:block" title={fmtDateFull(sub.createdAt)}>
                            {fmtDate(sub.createdAt)}
                          </span>
                          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => renewSubmission(sub)}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Подновяване"
                            >
                              Обнови
                            </button>
                            <button
                              onClick={() => router.push(`/review/${sub.id}`)}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              Преглед
                            </button>
                            <button
                              onClick={() => deleteSubmission(sub.id)}
                              className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Изтрий"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Mobile action buttons */}
                      <div className="flex sm:hidden items-center gap-2 mt-2 ml-12">
                        <button
                          onClick={() => renewSubmission(sub)}
                          className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 active:bg-emerald-100 min-h-[36px]"
                        >
                          Обнови
                        </button>
                        <button
                          onClick={() => router.push(`/review/${sub.id}`)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 active:bg-blue-100 min-h-[36px]"
                        >
                          Преглед
                        </button>
                        <button
                          onClick={() => deleteSubmission(sub.id)}
                          className="rounded-lg p-1.5 text-gray-400 active:bg-red-50 active:text-red-500 ml-auto min-h-[36px]"
                          title="Изтрий"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {submissions.length > 10 && !search && (
                <div className="border-t border-gray-100 px-5 py-3 text-center">
                  <button
                    onClick={() => router.push('/dashboard/submissions')}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Виж всички {submissions.length} запитвания →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function StatCard({
  value, label, sublabel, color, icon,
}: {
  value: number
  label: string
  sublabel: string
  color: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
          <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
          <p className="text-xs text-gray-400">{sublabel}</p>
        </div>
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ hasSearch, onNew }: { hasSearch: boolean; onNew: () => void }) {
  if (hasSearch) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
        <p className="text-sm text-gray-400">Няма намерени резултати</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Все още няма запитвания</h3>
      <p className="mb-5 text-xs text-gray-400">Създайте първото запитване за клиент</p>
      <button
        type="button"
        onClick={onNew}
        className="mx-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Ново запитване
      </button>
    </div>
  )
}
