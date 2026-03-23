'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getClient, updateClient, storePrefill, type ClientProfile } from '@/lib/clients'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: string[]
  insuranceClass?: string
  createdAt: string
  status?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CLASS_LABELS: Record<string, { label: string; color: string }> = {
  property:               { label: 'Имущество',         color: '#166534' },
  general_liability:      { label: 'ОГО / Работодател', color: '#991b1b' },
  occupational_accident:  { label: 'Трудова злополука', color: '#1e3a8a' },
  professional_liability: { label: 'Проф. отговорност', color: '#581c87' },
  trade_credit:           { label: 'Търговски кредит',  color: '#92400e' },
}

const ALL_INSURERS: Record<string, { name: string; color: string }> = {
  bulstrad: { name: 'Булстрад', color: '#0B3D91' },
  generali: { name: 'Дженерали', color: '#C8102E' },
  instinct: { name: 'Инстинкт', color: '#1B6B3A' },
  axiom:    { name: 'Аксиом',   color: '#6B21A8' },
  euroins:  { name: 'Евроинс',  color: '#1E40AF' },
  allianz:  { name: 'Алианц',   color: '#003781' },
  groupama: { name: 'Групама',  color: '#00A94F' },
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Чернова',  color: '#92400e', bg: '#fef3c7' },
  completed: { label: 'Завършено', color: '#065f46', bg: '#d1fae5' },
  sent:      { label: 'Изпратено', color: '#1e40af', bg: '#dbeafe' },
}

function fmtDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtNum(n?: number): string {
  if (n == null) return ''
  return n.toLocaleString('bg-BG')
}

// ─── Inline editable field ────────────────────────────────────────────────────

function InlineField({
  label,
  value,
  onSave,
  type = 'text',
  placeholder = '—',
}: {
  label: string
  value?: string | number
  onSave: (v: string) => void
  type?: 'text' | 'number' | 'email' | 'url' | 'textarea'
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? ''))
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(String(value ?? '')) }, [value])

  const startEdit = () => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 0) }

  const commit = useCallback(() => {
    setEditing(false)
    if (draft !== String(value ?? '')) onSave(draft)
  }, [draft, value, onSave])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') commit()
    if (e.key === 'Escape') { setDraft(String(value ?? '')); setEditing(false) }
  }

  const displayValue = value != null && value !== '' ? String(value) : null

  const inputClass =
    'w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50'

  return (
    <div>
      <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {editing ? (
        type === 'textarea' ? (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={type}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKey}
            className={inputClass}
          />
        )
      ) : (
        <button
          onClick={startEdit}
          className="group flex w-full items-start gap-1 rounded-lg px-1 py-1 text-left text-sm transition-colors hover:bg-gray-50"
        >
          <span className={displayValue ? 'text-gray-900' : 'italic text-gray-300'}>
            {displayValue ?? placeholder}
          </span>
          <svg className="ml-auto mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
      )}
    </div>
  )
}

// ─── Tag manager ──────────────────────────────────────────────────────────────

function TagManager({ tags, onUpdate }: { tags: string[]; onUpdate: (tags: string[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [newTag, setNewTag] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const TAG_COLORS = ['#2563eb', '#7c3aed', '#065f46', '#9a3412', '#0f766e', '#4338ca']

  const startAdd = () => { setAdding(true); setTimeout(() => inputRef.current?.focus(), 0) }

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tags.includes(t)) onUpdate([...tags, t])
    setNewTag('')
    setAdding(false)
  }

  const removeTag = (tag: string) => onUpdate(tags.filter((t) => t !== tag))

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }}
        >
          {tag}
          <button onClick={() => removeTag(tag)} className="opacity-70 hover:opacity-100 transition-opacity">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      {adding ? (
        <input
          ref={inputRef}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onBlur={addTag}
          onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setAdding(false) }}
          placeholder="Нов таг…"
          className="rounded-full border border-blue-300 px-2.5 py-0.5 text-xs outline-none focus:border-blue-500 w-24"
        />
      ) : (
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-gray-300 px-2.5 py-0.5 text-xs text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добави
        </button>
      )}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">
        <span className="text-base">{icon}</span>
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// ─── EIK Lookup ──────────────────────────────────────────────────────────────

function EikLookupRow({ eik, onData }: { eik?: string; onData: (d: Record<string, string>) => void }) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle')

  async function lookup() {
    if (!eik || eik.length < 9) return
    setLoading(true)
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(eik)}`)
      if (res.ok) {
        const data = await res.json()
        onData(data)
        setStatus('found')
      } else {
        setStatus('not_found')
      }
    } catch {
      setStatus('not_found')
    }
    setLoading(false)
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        onClick={lookup}
        disabled={loading || !eik || eik.length < 9}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="h-3.5 w-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        Зареди от ТР
      </button>
      {status === 'found' && <span className="text-xs text-emerald-600 font-medium">✓ Данните са заредени</span>}
      {status === 'not_found' && <span className="text-xs text-red-500">Не е намерен</span>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [submissions, setSubmissions] = useState<StoredSubmission[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    const c = getClient(id)
    if (!c) { setNotFound(true); return }
    setClient(c)

    // Load related submissions
    try {
      const raw = localStorage.getItem('iu_submissions')
      if (!raw) return
      const all: StoredSubmission[] = JSON.parse(raw)
      const related = all.filter((s) => {
        const nameMatch = s.clientName.toLowerCase() === c.company_name.toLowerCase()
        const fd = (s as { formData?: Record<string, unknown> }).formData ?? {}
        const cls = s.insuranceClass ?? 'property'
        const eik =
          cls === 'general_liability'     ? fd.gl_eik :
          cls === 'occupational_accident' ? fd.oa_eik :
          cls === 'professional_liability'? (fd.pl_eik ?? fd.pl_insured_eik) :
          fd.eik
        const eikMatch = c.eik && eik && String(eik) === c.eik
        return nameMatch || eikMatch
      })
      setSubmissions(related.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    } catch { /* ignore */ }
  }, [id])

  const save = useCallback((patch: Partial<ClientProfile>) => {
    if (!id) return
    const updated = updateClient(id, patch)
    if (updated) {
      setClient(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }, [id])

  function handleEikData(data: Record<string, string>) {
    const patch: Partial<ClientProfile> = {}
    if (data.company_name && !client?.company_name) patch.company_name = data.company_name
    if (data.address) patch.address = data.address
    if (data.email && !client?.email) patch.email = data.email
    if (data.phone && !client?.phone) patch.phone = data.phone
    if (data.activity && !client?.activity) patch.activity = data.activity
    if (data.nkid_code && !client?.nkid_code) patch.nkid_code = data.nkid_code
    if (data.representative && !client?.representative) patch.representative = data.representative
    if (Object.keys(patch).length > 0) save(patch)
  }

  function handleNewQuestionnaire() {
    if (!client) return
    storePrefill({
      clientId:          client.id,
      company_name:      client.company_name,
      eik:               client.eik,
      address:           client.address,
      city:              client.city,
      phone:             client.phone,
      email:             client.email,
      activity:          client.activity,
      nkid_code:         client.nkid_code,
      representative:    client.representative,
      employees_count:   client.employees_count,
      annual_wage_fund:  client.annual_wage_fund,
      annual_revenue:    client.annual_revenue,
      property_address:  client.property_address,
      construction_type: client.construction_type,
      roof_type:         client.roof_type,
      construction_year: client.construction_year,
      floors:            client.floors,
      area_sqm:          client.area_sqm,
      fire_alarm:        client.fire_alarm,
      sprinklers:        client.sprinklers,
      security_system:   client.security_system,
    })
    router.push(`/dashboard/new?client=${client.id}`)
  }

  if (notFound) return (
    <div className="px-6 py-16 text-center">
      <p className="text-gray-500">Клиентът не е намерен.</p>
      <button onClick={() => router.push('/dashboard/clients')} className="mt-4 text-sm text-blue-600 hover:underline">
        ← Към клиентите
      </button>
    </div>
  )
  if (!client) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  )

  const createdDate = fmtDate(client.created_at)
  const lastDate = fmtDate(client.last_submission_at)

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">

      {/* ── Breadcrumb ── */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-400">
        <button onClick={() => router.push('/dashboard/clients')} className="hover:text-gray-700 transition-colors">
          Клиенти
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.company_name}</span>
      </nav>

      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.company_name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {(client.submissions_count ?? 0)} запитвания
            {client.last_submission_at && <> · Последно: {lastDate}</>}
            {' · '}Клиент от: {createdDate}
          </p>
          {/* Tags */}
          <div className="mt-2">
            <TagManager
              tags={client.tags ?? []}
              onUpdate={(tags) => save({ tags })}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Запазено
            </span>
          )}
          <button
            onClick={handleNewQuestionnaire}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ново запитване
          </button>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Client data (60%) */}
        <div className="lg:col-span-3 space-y-5">

          {/* Основни данни */}
          <Section title="Основни данни" icon="🏢">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InlineField label="Наименование" value={client.company_name}
                onSave={(v) => save({ company_name: v })} />
              <div>
                <InlineField label="ЕИК / БУЛСТАТ" value={client.eik}
                  onSave={(v) => save({ eik: v })} placeholder="—" />
                <EikLookupRow eik={client.eik} onData={handleEikData} />
              </div>
              <InlineField label="Телефон" value={client.phone}
                onSave={(v) => save({ phone: v })} type="text" />
              <InlineField label="Мобилен" value={client.mobile}
                onSave={(v) => save({ mobile: v })} />
              <InlineField label="Ел. поща" value={client.email}
                onSave={(v) => save({ email: v })} type="email" />
              <InlineField label="Уеб сайт" value={client.website}
                onSave={(v) => save({ website: v })} type="url" />
              <div className="sm:col-span-2">
                <InlineField label="Адрес на управление" value={client.address}
                  onSave={(v) => save({ address: v })} />
              </div>
              <InlineField label="Град" value={client.city}
                onSave={(v) => save({ city: v })} />
              <InlineField label="Пощенски код" value={client.postal_code}
                onSave={(v) => save({ postal_code: v })} />
            </div>
          </Section>

          {/* Фирмени данни */}
          <Section title="Фирмени данни" icon="📋">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <InlineField label="Основна дейност" value={client.activity}
                  onSave={(v) => save({ activity: v })} />
              </div>
              <InlineField label="Код по НКИД" value={client.nkid_code}
                onSave={(v) => save({ nkid_code: v })} />
              <InlineField label="Правна форма" value={client.legal_form}
                onSave={(v) => save({ legal_form: v })} placeholder="ООД, ЕООД, АД…" />
              <InlineField label="Година на основаване" value={client.year_founded}
                onSave={(v) => save({ year_founded: v })} />
              <InlineField label="Представляван от" value={client.representative}
                onSave={(v) => save({ representative: v })} />
              <InlineField label="ЕГН на представител" value={client.representative_egn}
                onSave={(v) => save({ representative_egn: v })} />
            </div>
          </Section>

          {/* Финансови данни */}
          <Section title="Финансови данни" icon="💰">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InlineField label="Годишен оборот (лв.)" value={fmtNum(client.annual_revenue) || undefined}
                onSave={(v) => save({ annual_revenue: v ? Number(v.replace(/\s/g, '')) : undefined })}
                type="number" />
              <InlineField label="Брой служители" value={client.employees_count}
                onSave={(v) => save({ employees_count: v ? Number(v) : undefined })}
                type="number" />
              <InlineField label="Фонд заплати (лв.)" value={fmtNum(client.annual_wage_fund) || undefined}
                onSave={(v) => save({ annual_wage_fund: v ? Number(v.replace(/\s/g, '')) : undefined })}
                type="number" />
            </div>
          </Section>

          {/* Имуществени данни */}
          <Section title="Имуществени данни" icon="🏗️">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <InlineField label="Адрес на обекта" value={client.property_address}
                  onSave={(v) => save({ property_address: v })} />
              </div>
              <InlineField label="Вид сграда" value={client.building_type}
                onSave={(v) => save({ building_type: v })} />
              <InlineField label="Конструкция" value={client.construction_type}
                onSave={(v) => save({ construction_type: v })} placeholder="стоманобетон, тухла…" />
              <InlineField label="Вид покрив" value={client.roof_type}
                onSave={(v) => save({ roof_type: v })} />
              <InlineField label="Год. на строеж" value={client.construction_year}
                onSave={(v) => save({ construction_year: v })} type="number" />
              <InlineField label="Етажи" value={client.floors}
                onSave={(v) => save({ floors: v })} type="number" />
              <InlineField label="Площ (кв.м.)" value={client.area_sqm}
                onSave={(v) => save({ area_sqm: v ? Number(v) : undefined })} type="number" />
            </div>
          </Section>

          {/* Охрана */}
          <Section title="Охрана и безопасност" icon="🔒">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InlineField label="Пожарна сигнализация" value={client.fire_alarm}
                onSave={(v) => save({ fire_alarm: v })} placeholder="да / не" />
              <InlineField label="Спринклери" value={client.sprinklers}
                onSave={(v) => save({ sprinklers: v })} placeholder="да / не" />
              <InlineField label="Охранителна система" value={client.security_system}
                onSave={(v) => save({ security_system: v })} />
            </div>
          </Section>

          {/* Бележки */}
          <Section title="Бележки" icon="📝">
            <InlineField label="Свободен текст" value={client.notes}
              onSave={(v) => save({ notes: v })} type="textarea" placeholder="Добавете бележки…" />
          </Section>
        </div>

        {/* RIGHT: Submission history (40%) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">История на запитванията</h3>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                {submissions.length}
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400">Няма запитвания</p>
                <button
                  onClick={handleNewQuestionnaire}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  + Ново запитване
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {submissions.map((sub) => {
                  const cls = CLASS_LABELS[sub.insuranceClass ?? 'property'] ?? CLASS_LABELS.property
                  const st = STATUS_LABELS[sub.status ?? 'draft'] ?? STATUS_LABELS.draft
                  return (
                    <button
                      key={sub.id}
                      onClick={() => router.push(`/review/${sub.id}`)}
                      className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: cls.color }}
                        >
                          {cls.label}
                        </span>
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ color: st.color, backgroundColor: st.bg }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1 flex-wrap">
                          {sub.selectedInsurers.slice(0, 4).map((key) => {
                            const ins = ALL_INSURERS[key]
                            if (!ins) return null
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
                                style={{ backgroundColor: ins.color }}
                              >
                                {ins.name}
                              </span>
                            )
                          })}
                        </div>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">
                          {fmtDate(sub.createdAt)}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={handleNewQuestionnaire}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ново запитване за този клиент
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
