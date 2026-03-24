'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Submission {
  id: string
  clientName: string
  selectedInsurers: string[]
  insuranceClass?: string
  createdAt: string
}

interface InsurerMeta {
  name: string
  color: string
  [key: string]: unknown
}

interface DashboardAnalyticsProps {
  submissions: Submission[]
  allInsurers: Record<string, InsurerMeta>
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CLASS_COLORS: Record<string, string> = {
  property:               '#16a34a',
  general_liability:      '#dc2626',
  occupational_accident:  '#2563eb',
  professional_liability: '#7c3aed',
  trade_credit:           '#d97706',
}

const CLASS_LABELS: Record<string, string> = {
  property:               'Имущество',
  general_liability:      'ОГО',
  occupational_accident:  'ТЗ',
  professional_liability: 'ПО',
  trade_credit:           'ТК',
}

const MONTH_NAMES = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек']

function fmtRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Току-що'
  const hours = Math.floor(diff / 3600000)
  if (mins < 60) return `преди ${mins} мин`
  if (hours < 24) return `преди ${hours}ч`
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'вчера'
  if (days < 7) return `преди ${days} дни`
  return new Date(iso).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit' })
}

// ─── Custom recharts label for bar values ────────────────────────────────────

function BarTopLabel(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value = 0 } = props
  if (!value) return null
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fill="#6b7280" fontSize={12} fontWeight={600}>
      {value}
    </text>
  )
}

// ─── Empty placeholder ───────────────────────────────────────────────────────

function EmptyChart({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <p className="text-sm text-gray-400">Все още няма достатъчно данни</p>
    </div>
  )
}

// Custom legend renderer for the donut chart
function DonutLegend(props: { payload?: Array<{ value: string; color: string; payload?: { percent?: number } }> }) {
  const { payload } = props
  if (!payload) return null
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.value} {entry.payload?.percent != null ? `(${(entry.payload.percent * 100).toFixed(0)}%)` : ''}
        </li>
      ))}
    </ul>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════════════════════

export default function DashboardAnalytics({ submissions, allInsurers }: DashboardAnalyticsProps) {
  // ── Chart 1: Monthly bar data ──────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const now = new Date()
    const months: { label: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ label: MONTH_NAMES[d.getMonth()], count: 0 })
    }
    submissions.forEach((s) => {
      const d = new Date(s.createdAt)
      for (let i = 5; i >= 0; i--) {
        const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
        if (d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()) {
          months[5 - i].count++
          break
        }
      }
    })
    return months
  }, [submissions])

  const hasMonthlyData = monthlyData.some((m) => m.count > 0)

  // ── Chart 2: Class donut data ──────────────────────────────────────────────
  const classData = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((s) => {
      const cls = s.insuranceClass ?? 'property'
      counts[cls] = (counts[cls] || 0) + 1
    })
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: CLASS_LABELS[key] ?? key,
        value,
        color: CLASS_COLORS[key] ?? '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value)
  }, [submissions])

  // ── Chart 3: Top insurers ──────────────────────────────────────────────────
  const insurerData = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((s) => {
      (s.selectedInsurers ?? []).forEach((key) => {
        counts[key] = (counts[key] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({
        name: allInsurers[key]?.name ?? key,
        count,
        color: allInsurers[key]?.color ?? '#94a3b8',
      }))
  }, [submissions, allInsurers])

  // ── Chart 4: Activity feed ─────────────────────────────────────────────────
  const activityItems = useMemo(() => {
    return submissions.slice(0, 10).map((s) => {
      const cls = s.insuranceClass ?? 'property'
      return {
        id: s.id,
        label: `Ново запитване — ${s.clientName} — ${CLASS_LABELS[cls] ?? cls}`,
        time: fmtRelative(s.createdAt),
        color: CLASS_COLORS[cls] ?? '#94a3b8',
      }
    })
  }, [submissions])

  if (submissions.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Статистики</h2>
      <div className="space-y-4">

        {/* ── Chart 1: Monthly submissions ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Запитвания по месеци</h3>
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 20, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value) => [value, 'Запитвания']}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} label={<BarTopLabel />} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* ── Charts 2 & 3: Side-by-side on desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Chart 2: Insurance class donut */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">По клас застраховка</h3>
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={classData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {classData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    formatter={(value, name) => [value, name]}
                  />
                  <Legend content={<DonutLegend />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart height={240} />
            )}
          </div>

          {/* Chart 3: Top insurers horizontal bar */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Най-избирани застрахователи</h3>
            {insurerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={insurerData} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: '#374151' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    cursor={{ fill: '#f9fafb' }}
                    formatter={(value) => [value, 'Избран пъти']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {insurerData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart height={240} />
            )}
          </div>
        </div>

        {/* ── Chart 4: Activity feed ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Последна активност</h3>
          {activityItems.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {activityItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{item.label}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart height={120} />
          )}
        </div>

      </div>
    </section>
  )
}
