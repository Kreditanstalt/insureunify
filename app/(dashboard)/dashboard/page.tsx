'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { INSURERS } from '@/lib/schema'
import { OA_INSURERS } from '@/lib/oa-schema'
import { TC_INSURERS } from '@/lib/tc-schema'
import { storeRenewalData, classToFormUrl } from '@/lib/renewal'
import { getAllDrafts, deleteDraft, CLASS_META, timeAgo } from '@/lib/drafts'
import type { Draft } from '@/lib/drafts'
import { useAuth } from '@/lib/useAuth'
import { PLAN_LABELS } from '@/lib/planLimits'

interface Submission {
  id:               string
  clientName:       string
  selectedInsurers: string[]
  insuranceClass?:  string
  formData?:        Record<string, unknown>
  createdAt:        string
}

const ALL_INSURERS: Record<string, { color: string; name: string }> = {
  ...INSURERS,
  ...OA_INSURERS,
  ...TC_INSURERS,
}

const CLASS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  property:               { label: 'Имущество',         color: '#166534', bg: '#dcfce7' },
  general_liability:      { label: 'ОГО',               color: '#991b1b', bg: '#fee2e2' },
  occupational_accident:  { label: 'Трудова злополука', color: '#1e3a8a', bg: '#dbeafe' },
  professional_liability: { label: 'Проф. отговорност', color: '#1E2D6B', bg: '#f3e8ff' },
  trade_credit:           { label: 'Търг. кредит',      color: '#92400e', bg: '#fef3c7' },
}

const QUICK_ACTIONS = [
  { icon: '🏢', label: 'Имущество',         href: '/dashboard/new/property',               accent: '#16a34a' },
  { icon: '⚖️', label: 'Проф. отговорност', href: '/dashboard/new/professional-liability',  accent: '#6B21A8' },
  { icon: '🛡️', label: 'ОГО',              href: '/dashboard/new/general-liability',       accent: '#dc2626' },
  { icon: '⚡', label: 'Трудова злополука', href: '/dashboard/new/occupational-accident',   accent: '#2563eb' },
  { icon: '💳', label: 'Търг. кредит',      href: '/dashboard/new/trade-credit',           accent: '#92400e' },
]

function fmtDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Току-що'
  if (mins < 60) return `преди ${mins} мин`
  if (hours < 24) return `преди ${hours} ч`
  if (days < 7) return `преди ${days} дни`
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Добро утро'
  if (h < 18) return 'Добър ден'
  return 'Добър вечер'
}

function getInitials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { profile: authProfile, user, loading: authLoading, plan, usage, trialDaysLeft, isTrialExpired } = useAuth()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])

  const profile = authProfile ? { companyName: authProfile.company_name, email: authProfile.email } : null

  useEffect(() => {
    if (authLoading) return
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (raw) setSubmissions(JSON.parse(raw))
    } catch { /* ignore */ }
    setDrafts(getAllDrafts())
    const params = user ? `?broker_id=${user.id}` : ''
    fetch(`/api/submissions${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.submissions?.length) {
          setSubmissions(d.submissions.map((s: Record<string, unknown>) => ({
            id: s.id, clientName: s.client_name ?? s.clientName,
            insuranceClass: s.insurance_class ?? s.insuranceClass,
            selectedInsurers: s.selected_insurers ?? s.selectedInsurers ?? [],
            formData: s.form_data ?? s.formData ?? {},
            createdAt: s.created_at ?? s.createdAt,
          })))
        }
      })
      .catch(() => {})
  }, [authLoading, user])

  function deleteSubmission(id: string) {
    const updated = submissions.filter((s) => s.id !== id)
    setSubmissions(updated)
    localStorage.setItem('iu_submissions', JSON.stringify(updated))
    fetch('/api/submissions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {})
  }

  function renewSubmission(sub: Submission) {
    storeRenewalData({ renewedFromId: sub.id, insuranceClass: sub.insuranceClass ?? 'property', selectedInsurers: sub.selectedInsurers, formData: sub.formData ?? {} })
    router.push(classToFormUrl(sub.insuranceClass ?? 'property'))
  }

  const stats = useMemo(() => {
    const total = submissions.length
    const now = new Date()
    const thisMonth = submissions.filter((s) => { const d = new Date(s.createdAt); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() }).length
    const uniqueClients = new Set(submissions.map((s) => s.clientName.trim().toLowerCase())).size
    return { total, thisMonth, uniqueClients }
  }, [submissions])

  const recent = useMemo(() => submissions.slice(0, 5), [submissions])

  // Top insurers for mini chart
  const topInsurers = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((s) => s.selectedInsurers.forEach((k) => { counts[k] = (counts[k] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([key, count]) => ({
      key, name: ALL_INSURERS[key]?.name ?? key, color: ALL_INSURERS[key]?.color ?? '#6b7280', count,
    }))
  }, [submissions])
  const topMax = Math.max(1, ...topInsurers.map((i) => i.count))

  if (authLoading) {
    return <div className="flex h-full items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>
  }

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5">

        {/* ── Two-column layout ── */}
        <div className="flex gap-5 items-start">

          {/* ── LEFT: Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Hero bar — compact */}
            <div className="flex items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {getGreeting()}{profile ? `, ${profile.companyName}` : ''}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {new Date().toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/new')}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                style={{ boxShadow: '0 1px 3px rgba(37,99,235,0.3)' }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ново запитване
              </button>
            </div>

            {/* Quick start cards */}
            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Ново запитване</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.href}
                    onClick={() => router.push(a.href)}
                    className="group flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-left transition-all hover:border-blue-300 hover:shadow-sm"
                  >
                    <span className="text-lg flex-shrink-0">{a.icon}</span>
                    <span className="text-[13px] font-semibold text-gray-800 leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Drafts — horizontal scroll */}
            {drafts.length > 0 && (
              <section>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Чернови
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 normal-case tracking-normal">{drafts.length}</span>
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {drafts.map((d) => {
                    const meta = CLASS_META[d.insuranceClass]
                    return (
                      <div
                        key={d.key}
                        className="group flex-shrink-0 w-[200px] rounded-xl border border-amber-200 bg-white p-3 transition-all hover:shadow-sm hover:border-amber-300 cursor-pointer"
                        onClick={() => router.push(meta.href)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{meta.icon}</span>
                          <span className="text-[11px] text-amber-600 font-medium">{meta.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{d.clientName || 'Без клиент'}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-gray-400">{timeAgo(d.savedAt)}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteDraft(d.insuranceClass, d.eik); setDrafts((p) => p.filter((x) => x.key !== d.key)) }}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Recent submissions — clean table */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  Последни запитвания
                  {stats.total > 0 && <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 normal-case tracking-normal">{stats.total}</span>}
                </p>
                {stats.total > 5 && (
                  <Link href="/dashboard/submissions" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    Всички запитвания &rarr;
                  </Link>
                )}
              </div>

              {recent.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
                  <p className="text-sm text-gray-400 mb-3">Все още няма запитвания</p>
                  <button onClick={() => router.push('/dashboard/new')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Създайте първото &rarr;</button>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  {/* Table header — desktop only */}
                  <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <span>Клиент</span>
                    <span className="w-28 text-center">Застрахователи</span>
                    <span className="w-20 text-right">Дата</span>
                    <span className="w-16" />
                  </div>
                  {recent.map((sub, idx) => {
                    const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                    return (
                      <div
                        key={sub.id}
                        className={`group px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-blue-50/40 cursor-pointer ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                        onClick={() => router.push(`/review/${sub.id}`)}
                      >
                        {/* Avatar + name + class */}
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: cls.bg, color: cls.color }}>
                            {getInitials(sub.clientName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{sub.clientName}</p>
                            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ backgroundColor: cls.bg, color: cls.color }}>{cls.label}</span>
                          </div>
                        </div>

                        {/* Insurers pills — desktop */}
                        <div className="hidden sm:flex items-center gap-1 w-28 justify-center">
                          {sub.selectedInsurers.slice(0, 3).map((key) => {
                            const ins = ALL_INSURERS[key]
                            if (!ins) return null
                            return <span key={key} className="h-5 w-5 rounded-full flex-shrink-0 border border-white" style={{ backgroundColor: ins.color }} title={ins.name} />
                          })}
                          {sub.selectedInsurers.length > 3 && <span className="text-[10px] text-gray-400 font-medium">+{sub.selectedInsurers.length - 3}</span>}
                        </div>

                        {/* Date — desktop */}
                        <span className="hidden sm:block text-xs text-gray-400 w-20 text-right">{fmtDate(sub.createdAt)}</span>

                        {/* Actions */}
                        <div className="flex items-center gap-1 w-16 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); renewSubmission(sub) }} className="p-1 text-gray-400 hover:text-emerald-600 rounded" title="Обнови">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); deleteSubmission(sub.id) }} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Изтрий">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        {/* Mobile: date below */}
                        <span className="sm:hidden text-[10px] text-gray-400 absolute right-4">{fmtDate(sub.createdAt)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="hidden lg:block w-[280px] flex-shrink-0 sticky top-5 space-y-4">

            {/* Plan & Usage */}
            {plan && (
              <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                {(() => {
                  const pi = PLAN_LABELS[plan.plan_id] ?? PLAN_LABELS.trial
                  const usageCount = usage?.submissions_count ?? 0
                  const max = plan.max_submissions_monthly
                  const pct = max ? Math.min(100, Math.round((usageCount / max) * 100)) : 0
                  return (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: pi.bg, color: pi.color }}>{pi.label}</span>
                        {plan.plan_id === 'trial' && trialDaysLeft !== null && trialDaysLeft > 0 && (
                          <span className={`text-[11px] font-medium ${trialDaysLeft <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>{trialDaysLeft} дни</span>
                        )}
                      </div>
                      {isTrialExpired && (
                        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3">
                          <p className="text-xs font-semibold text-red-700">Пробният период изтече</p>
                          <Link href="/dashboard/settings" className="text-[11px] text-red-600 font-medium hover:underline">Изберете план &rarr;</Link>
                        </div>
                      )}
                      {max && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                            <span>Заявки</span>
                            <span className="font-semibold text-gray-700">{usageCount} / {max}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-100">
                            <div className="h-1.5 rounded-full transition-all" style={{
                              width: `${pct}%`,
                              backgroundColor: pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#22c55e',
                            }} />
                          </div>
                        </div>
                      )}
                      {plan.plan_id === 'trial' && !isTrialExpired && (
                        <Link href="/dashboard/settings" className="block mt-3 text-[11px] font-medium text-blue-600 hover:text-blue-700">Надградете &rarr;</Link>
                      )}
                    </>
                  )
                })()}
              </div>
            )}

            {/* Quick Stats */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {[
                { value: stats.total, label: 'Общо запитвания' },
                { value: stats.uniqueClients, label: 'Клиенти' },
                { value: stats.thisMonth, label: 'Този месец' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className="text-lg font-bold text-gray-900 tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Top Insurers mini chart */}
            {topInsurers.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Топ застрахователи</p>
                <div className="space-y-2">
                  {topInsurers.map((ins) => (
                    <div key={ins.key}>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="text-gray-600 font-medium truncate">{ins.name}</span>
                        <span className="text-gray-400 tabular-nums">{ins.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full" style={{ width: `${(ins.count / topMax) * 100}%`, backgroundColor: ins.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            {submissions.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Последна активност</p>
                <div className="space-y-2.5">
                  {submissions.slice(0, 5).map((sub) => {
                    const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                    return (
                      <div key={sub.id} className="flex items-start gap-2">
                        <div className="mt-1 h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-gray-800 truncate">{sub.clientName}</p>
                          <p className="text-[10px] text-gray-400">{cls.label} · {fmtDate(sub.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {submissions.length > 5 && (
                  <Link href="/dashboard/submissions" className="block mt-3 text-[11px] font-medium text-blue-600 hover:text-blue-700">Виж всички &rarr;</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
