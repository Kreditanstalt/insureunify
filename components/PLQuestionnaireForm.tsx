'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { INSURERS } from '@/lib/schema'
import { PL_SCHEMA, PL_INSURERS, PL_INSURER_KEYS, PLFormData, PLInsurerKey } from '@/lib/pl-schema'
import type { SchemaField } from '@/lib/schema'
import { readRenewalData, todayISO as renewalToday, addMonthsISO } from '@/lib/renewal'
import AutoFillUploader from './AutoFillUploader'
import StepperBar from './StepperBar'
import DraftRecoveryBanner from './DraftRecoveryBanner'
import DraftStatusIndicator from './DraftStatusIndicator'
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave'

const PL_STEPS = PL_SCHEMA.map((s) => ({ id: s.id, label: s.shortLabel ?? s.label, icon: s.icon }))

// ─── Shared StoredSubmission type ─────────────────────────────────────────────

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: PLInsurerKey[]
  formData: PLFormData
  insuranceClass: string
  createdAt: string
}

// ─── EIK Status ───────────────────────────────────────────────────────────────
type EikStatus = 'idle' | 'loading' | 'found' | 'not_found'

// ─── Primitive input styles ───────────────────────────────────────────────────
const inputClass =
  'w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 text-sm ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors'

// ─── Company name autocomplete ───────────────────────────────────────────────
interface CompanyResult { uic: string; name: string; legalForm: string; status: string }

function CompanyNameInput({
  value, onChange, onSelect,
}: {
  value: string | number | undefined
  onChange: (v: string) => void
  onSelect: (d: {
    company_name: string; eik: string; address?: string; email?: string;
    phone?: string; activity?: string;
  }) => void
}) {
  const [results, setResults] = useState<CompanyResult[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const doSearch = async (q: string) => {
    if (!q || q.length < 3) { setResults([]); setOpen(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/eik/search?name=${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results ?? [])
        setOpen((data.results ?? []).length > 0)
      }
    } catch { /* ignore */ }
    setSearching(false)
  }

  const handleChange = (v: string) => {
    onChange(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(v), 350)
  }

  const handleSelect = async (item: CompanyResult) => {
    onChange(item.name)
    setOpen(false)
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(item.uic)}`)
      if (res.ok) {
        const data = await res.json()
        onSelect({
          company_name: item.name, eik: item.uic,
          address: data.address, email: data.email,
          phone: data.phone, activity: data.activity,
        })
        return
      }
    } catch { /* ignore */ }
    onSelect({ company_name: item.name, eik: item.uic })
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Наименование на фирмата"
          className={inputClass + ' pr-9'}
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
          {searching ? (
            <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          )}
        </div>
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((c) => (
            <li
              key={c.uic}
              onMouseDown={() => handleSelect(c)}
              className="px-4 py-2.5 text-sm text-gray-800 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-0"
            >
              <div className="font-medium truncate">{c.name}</div>
              <div className="text-xs text-gray-400">{c.legalForm} · ЕИК {c.uic}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── EIK input with status indicator ─────────────────────────────────────────
function EikInput({
  value, onChange, status,
}: { value: string | number | undefined; onChange: (v: string) => void; status: EikStatus }) {
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="123456789"
          className={`${inputClass} pr-9 ${status === 'not_found' ? 'border-amber-400' : status === 'found' ? 'border-green-400' : ''}`}
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          {status === 'loading' && (
            <svg className="w-4 h-4 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {status === 'found' && (
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      {status === 'found' && <p className="text-[12px] text-green-600 mt-1">✓ Данните са заредени от Търговски регистър</p>}
      {status === 'not_found' && <p className="text-[12px] text-amber-600 mt-1">Не е намерен в ТР — попълнете ръчно</p>}
      {status === 'loading' && <p className="text-[12px] text-purple-500 mt-1">Търсене в Търговски регистър…</p>}
    </div>
  )
}

// ─── Toggle group (Yes/No and short option lists) ─────────────────────────────
function ToggleGroup({ options, value, onChange }: {
  options: { value: string; label: string }[]
  value: string | number | undefined
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
            String(value) === opt.value
              ? 'bg-purple-600 border-purple-600 text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Generic field label wrapper ──────────────────────────────────────────────
function FieldLabel({ label, required, children, mappingBadges }: {
  label: string
  required?: boolean
  children: React.ReactNode
  mappingBadges?: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {mappingBadges}
      </div>
      {children}
    </div>
  )
}

// ─── Mapping badges for a field ───────────────────────────────────────────────
function MappingBadges({ field, selectedInsurers }: { field: SchemaField; selectedInsurers: PLInsurerKey[] }) {
  const [tooltip, setTooltip] = useState<PLInsurerKey | null>(null)
  return (
    <div className="flex gap-1 relative">
      {selectedInsurers.map((key) => {
        const insurer = INSURERS[key]
        const mapped = Boolean(field.mapping[key])
        return (
          <div key={key} className="relative">
            <button
              type="button"
              onMouseEnter={() => setTooltip(key)}
              onMouseLeave={() => setTooltip(null)}
              className={`w-5 h-5 rounded text-white text-[10px] font-bold flex items-center justify-center transition-opacity ${mapped ? 'opacity-90' : 'opacity-20'}`}
              style={{ backgroundColor: mapped ? insurer.color : '#9ca3af' }}
            >
              {insurer.name[0]}
            </button>
            {tooltip === key && (
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
                style={{ backgroundColor: mapped ? insurer.color : '#374151' }}
              >
                {mapped ? `${insurer.name}: "${field.mapping[key]}"` : `${insurer.name}: не се използва`}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Render a single PL field ─────────────────────────────────────────────────
function PLFieldInput({
  field, formData, set, setNum,
  eikStatus, onEikChange, onCompanySelect,
  insuredEikStatus, onInsuredEikChange, onInsuredCompanySelect,
}: {
  field: SchemaField
  formData: PLFormData
  set: (id: string, v: string) => void
  setNum: (id: string, v: string) => void
  eikStatus: EikStatus
  onEikChange: (v: string) => void
  onCompanySelect: (d: {
    company_name: string; eik: string; address?: string; email?: string;
    phone?: string; activity?: string;
  }) => void
  insuredEikStatus: EikStatus
  onInsuredEikChange: (v: string) => void
  onInsuredCompanySelect: (d: {
    company_name: string; eik: string; address?: string; email?: string;
    phone?: string; activity?: string;
  }) => void
}) {
  if (field.id === 'pl_company_name') {
    return (
      <CompanyNameInput
        value={formData[field.id]}
        onChange={(v) => set(field.id, v)}
        onSelect={onCompanySelect}
      />
    )
  }
  if (field.id === 'pl_eik') {
    return (
      <EikInput
        value={formData[field.id]}
        onChange={onEikChange}
        status={eikStatus}
      />
    )
  }
  if (field.id === 'pl_insured_name') {
    return (
      <CompanyNameInput
        value={formData[field.id]}
        onChange={(v) => set(field.id, v)}
        onSelect={onInsuredCompanySelect}
      />
    )
  }
  if (field.id === 'pl_insured_eik') {
    return (
      <EikInput
        value={formData[field.id]}
        onChange={onInsuredEikChange}
        status={insuredEikStatus}
      />
    )
  }
  if (field.type === 'select' && field.options) {
    return field.options.length <= 3
      ? <ToggleGroup options={field.options} value={formData[field.id]} onChange={(v) => set(field.id, v)} />
      : (
        <select
          value={String(formData[field.id] ?? '')}
          onChange={(e) => set(field.id, e.target.value)}
          className={inputClass}
        >
          <option value="">— Изберете —</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        value={String(formData[field.id] ?? '')}
        onChange={(e) => set(field.id, e.target.value)}
        placeholder={field.placeholder}
        rows={3}
        className={inputClass + ' resize-none'}
      />
    )
  }
  if (field.type === 'number') {
    return (
      <input
        type="number"
        value={formData[field.id] ?? ''}
        onChange={(e) => setNum(field.id, e.target.value)}
        placeholder={field.placeholder ?? '0'}
        className={inputClass}
      />
    )
  }
  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={String(formData[field.id] ?? '')}
        onChange={(e) => set(field.id, e.target.value)}
        className={inputClass}
      />
    )
  }
  return (
    <input
      type="text"
      value={String(formData[field.id] ?? '')}
      onChange={(e) => set(field.id, e.target.value)}
      placeholder={field.placeholder}
      className={inputClass}
    />
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function PLSidebar({ currentIndex, formData, onNavigate }: {
  currentIndex: number
  formData: PLFormData
  onNavigate: (i: number) => void
}) {
  const overall = (() => {
    const req = PL_SCHEMA.flatMap((s) => s.fields.filter((f) => f.required))
    if (!req.length) return 0
    const filled = req.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
    return Math.round((filled / req.length) * 100)
  })()

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-1">
      <div className="mb-4 px-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Напредък</span><span>{overall}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${overall}%` }} />
        </div>
      </div>
      {PL_SCHEMA.map((section, idx) => {
        const req = section.fields.filter((f) => f.required)
        const filled = req.length
          ? req.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
          : section.fields.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
        const total = req.length || section.fields.length
        const progress = Math.round((filled / total) * 100)
        const isCurrent = idx === currentIndex

        return (
          <button
            key={section.id}
            onClick={() => onNavigate(idx)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              isCurrent
                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                : idx < currentIndex && progress < 100
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{section.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{section.shortLabel}</div>
              {progress > 0 && progress < 100 && (
                <div className="h-0.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div className={`h-full rounded-full ${idx < currentIndex && progress < 100 ? 'bg-red-400' : 'bg-purple-500'}`} style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            {progress === 100 ? (
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : idx < currentIndex && progress < 100 ? (
              <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-[10px] font-bold">!</span>
            ) : null}
          </button>
        )
      })}
    </aside>
  )
}

// ─── Main PLQuestionnaireForm component ───────────────────────────────────────

export default function PLQuestionnaireForm() {
  const router = useRouter()
  const [selectedInsurers, setSelectedInsurers] = useState<PLInsurerKey[]>(['axiom', 'bulstrad', 'euroins', 'ozk'])
  const [formData, setFormData] = useState<PLFormData>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [eikStatus, setEikStatus] = useState<EikStatus>('idle')
  const abortRef = useRef<AbortController | null>(null)
  const [insuredEikStatus, setInsuredEikStatus] = useState<EikStatus>('idle')
  const insuredAbortRef = useRef<AbortController | null>(null)
  const [prefillBanner, setPrefillBanner] = useState<string | null>(null)
  const [renewedFromId, setRenewedFromId] = useState<string | null>(null)

  const draft = useDraftAutoSave({
    insuranceClass: 'professional_liability',
    formData: formData as Record<string, unknown>,
    selectedInsurers,
    currentSection,
    eikField: 'pl_eik',
    clientNameField: 'pl_company_name',
  })

  // Apply renewal data on mount
  useEffect(() => {
    const renewal = readRenewalData()
    if (!renewal || renewal.insuranceClass !== 'professional_liability') return
    const fd = renewal.formData as PLFormData
    const today = renewalToday()
    fd.pl_period_from = today
    fd.pl_period_to = addMonthsISO(today, 12)
    setFormData(fd)
    setSelectedInsurers(renewal.selectedInsurers as PLInsurerKey[])
    setRenewedFromId(renewal.renewedFromId)
    setPrefillBanner(String(fd.pl_company_name ?? ''))
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iu_client_prefill')
      if (!raw) return
      localStorage.removeItem('iu_client_prefill')
      const p = JSON.parse(raw)
      setFormData((prev) => ({
        ...prev,
        pl_company_name:   p.company_name    ?? prev.pl_company_name,
        pl_eik:            p.eik             ?? prev.pl_eik,
        pl_address:        p.address         ?? prev.pl_address,
        pl_phone:          p.phone           ?? prev.pl_phone,
        pl_email:          p.email           ?? prev.pl_email,
        pl_activity:       p.activity        ?? prev.pl_activity,
        pl_employees_count: p.employees_count ? String(p.employees_count) : prev.pl_employees_count,
      }))
      setPrefillBanner(p.company_name ?? null)
    } catch { /* ignore */ }
  }, [])

  function set(id: string, v: string) {
    setFormData((prev) => ({ ...prev, [id]: v === '' ? undefined : v }))
  }
  function setNum(id: string, v: string) {
    setFormData((prev) => ({ ...prev, [id]: v === '' ? undefined : Number(v) }))
  }

  function handleAutoFill(extracted: Record<string, string | null>) {
    setFormData((prev) => {
      const next = { ...prev }
      const s = (id: string, val: string | null | undefined) => { if (val) next[id] = val }
      s('pl_company_name',   extracted.company_name)
      s('pl_eik',            extracted.eik)
      s('pl_address',        extracted.address)
      s('pl_phone',          extracted.phone)
      s('pl_email',          extracted.email)
      s('pl_activity',       extracted.activity)
      s('pl_employees_count', extracted.employees_count)
      s('pl_annual_revenue', extracted.annual_revenue)
      return next
    })
  }

  const lookupEik = useCallback(async (eik: string) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setEikStatus('loading')
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(eik)}`, { signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      if (res.ok) {
        const data = await res.json()
        if (data.company_name) {
          setFormData((prev) => ({
            ...prev,
            ...(data.company_name   ? { pl_company_name: data.company_name  } : {}),
            ...(data.address        ? { pl_address:       data.address       } : {}),
            ...(data.email          ? { pl_email:         data.email         } : {}),
            ...(data.phone          ? { pl_phone:         data.phone         } : {}),
            ...(data.activity       ? { pl_activity:      data.activity      } : {}),
          }))
          setEikStatus('found')
          return
        }
      }
      setEikStatus('not_found')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setEikStatus('not_found')
    }
  }, [])

  function handleEikChange(v: string) {
    set('pl_eik', v)
    const digits = v.replace(/\D/g, '')
    if (digits.length === 9 || digits.length === 13) {
      lookupEik(digits)
    } else {
      abortRef.current?.abort()
      setEikStatus('idle')
    }
  }

  function handleCompanySelect(d: {
    company_name: string; eik: string; address?: string; email?: string;
    phone?: string; activity?: string;
  }) {
    set('pl_company_name', d.company_name)
    if (d.eik) {
      set('pl_eik', d.eik)
      lookupEik(d.eik)
    }
  }

  const lookupInsuredEik = useCallback(async (eik: string) => {
    insuredAbortRef.current?.abort()
    const ctrl = new AbortController()
    insuredAbortRef.current = ctrl
    setInsuredEikStatus('loading')
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(eik)}`, { signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      if (res.ok) {
        const data = await res.json()
        if (data.company_name) {
          setFormData((prev) => ({
            ...prev,
            ...(data.company_name ? { pl_insured_name:    data.company_name } : {}),
            ...(data.address      ? { pl_insured_address: data.address      } : {}),
          }))
          setInsuredEikStatus('found')
          return
        }
      }
      setInsuredEikStatus('not_found')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setInsuredEikStatus('not_found')
    }
  }, [])

  function handleInsuredEikChange(v: string) {
    set('pl_insured_eik', v)
    const digits = v.replace(/\D/g, '')
    if (digits.length === 9 || digits.length === 13) {
      lookupInsuredEik(digits)
    } else {
      insuredAbortRef.current?.abort()
      setInsuredEikStatus('idle')
    }
  }

  function handleInsuredCompanySelect(d: {
    company_name: string; eik: string; address?: string; email?: string;
    phone?: string; activity?: string;
  }) {
    set('pl_insured_name', d.company_name)
    if (d.eik) {
      set('pl_insured_eik', d.eik)
      lookupInsuredEik(d.eik)
    }
  }

  const showFieldError = (fieldId: string) => {
    const sectionIdx = PL_SCHEMA.findIndex((s) => s.fields.some((f) => f.id === fieldId))
    return sectionIdx < currentSection && (formData[fieldId] === undefined || formData[fieldId] === '')
  }

  const REQUIRED_IDS = PL_SCHEMA.flatMap((s) => s.fields.filter((f) => f.required).map((f) => f.id))
  const missing = REQUIRED_IDS.filter((id) => formData[id] === undefined || formData[id] === '')
  const canSubmit = selectedInsurers.length > 0 && missing.length === 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const id = uuidv4()
      const clientName = String(formData.pl_company_name ?? 'Нов клиент')
      const submission: StoredSubmission & { renewedFromId?: string } = {
        id, clientName,
        selectedInsurers,
        formData,
        insuranceClass: 'professional_liability',
        createdAt: new Date().toISOString(),
      }
      if (renewedFromId) submission.renewedFromId = renewedFromId
      // Save to localStorage (cache)
      const existing = JSON.parse(localStorage.getItem('iu_submissions') ?? '[]') as StoredSubmission[]
      localStorage.setItem('iu_submissions', JSON.stringify([submission, ...existing]))
      // Save to Supabase (async, non-blocking)
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      }).catch(console.error)
      draft.clearDraft()
      router.push(`/review/${id}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const section = PL_SCHEMA[currentSection]

  const completedSectionsPL = PL_SCHEMA
    .filter((s) => s.fields.filter((f) => f.required).every((f) => formData[f.id] !== undefined && formData[f.id] !== ''))
    .map((s) => s.id)

  const errorSectionsPL = PL_SCHEMA
    .slice(0, currentSection)
    .filter((s) => s.fields.filter((f) => f.required).some((f) => !formData[f.id] && formData[f.id] !== 0))
    .map((s) => s.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нов въпросник ПО</h1>
        <p className="text-gray-500 text-sm mb-4">Професионална отговорност</p>
        <DraftStatusIndicator status={draft.saveStatus} />
        <div className="mb-4" />

        {draft.pendingDraft && (
          <DraftRecoveryBanner
            draft={draft.pendingDraft}
            onRestore={() => {
              const restored = draft.restoreDraft()
              setFormData(restored.formData as PLFormData)
              setSelectedInsurers(restored.selectedInsurers as PLInsurerKey[])
              setCurrentSection(restored.currentSection)
            }}
            onDismiss={() => draft.dismissDraft()}
          />
        )}

        {/* Stepper */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
          <StepperBar
            steps={PL_STEPS}
            activeId={section.id}
            completedIds={completedSectionsPL}
            errorIds={errorSectionsPL}
            onNavigate={(id) => setCurrentSection(PL_SCHEMA.findIndex((s) => s.id === id))}
          />
        </div>

        {/* Prefill banner */}
        {prefillBanner && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm mb-4">
            <span className="flex items-center gap-2 text-blue-800">
              <svg className="h-4 w-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Данните са заредени от клиентски профил на <strong>{prefillBanner}</strong>. Може да ги редактирате.
            </span>
            <button onClick={() => setPrefillBanner(null)} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <AutoFillUploader onFill={handleAutoFill} className="mb-4" />

        {/* Insurer selector — step 0 only */}
        {currentSection === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Застрахователи</p>
            <div className="flex flex-wrap gap-2">
              {PL_INSURER_KEYS.map((key) => {
                const ins = PL_INSURERS[key]
                const isSelected = selectedInsurers.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedInsurers((prev) =>
                      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
                    )}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      isSelected ? 'text-white' : 'bg-white text-gray-700 border-gray-200'
                    }`}
                    style={isSelected ? { backgroundColor: ins.color, borderColor: ins.color } : undefined}
                  >
                    <div className={`w-7 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white'}`}>
                      <Image src={ins.logo} alt={ins.name} width={28} height={24} className="object-contain w-full h-full" />
                    </div>
                    {ins.name}
                    {isSelected && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
            {selectedInsurers.length === 0 && (
              <p className="text-xs text-red-400 mt-2">Моля, изберете поне един застраховател.</p>
            )}
          </div>
        )}

        {/* Current section fields */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
            <span className="text-lg">{section.icon}</span>
            <h2 className="text-sm font-semibold text-gray-900">{section.label}</h2>
          </div>
          <div className="p-5 space-y-4">
            {section.fields.map((field) => (
              <FieldLabel
                key={field.id}
                label={field.label}
                required={field.required}
                mappingBadges={<MappingBadges field={field} selectedInsurers={selectedInsurers} />}
              >
                <PLFieldInput
                  field={field}
                  formData={formData}
                  set={set}
                  setNum={setNum}
                  eikStatus={eikStatus}
                  onEikChange={handleEikChange}
                  onCompanySelect={handleCompanySelect}
                  insuredEikStatus={insuredEikStatus}
                  onInsuredEikChange={handleInsuredEikChange}
                  onInsuredCompanySelect={handleInsuredCompanySelect}
                />
              </FieldLabel>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3 sm:relative fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:bottom-auto bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 p-4 sm:p-0 z-30">
          <button
            type="button"
            onClick={() => { draft.saveNow(); setCurrentSection((i) => Math.max(0, i - 1)) }}
            disabled={currentSection === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>
          <span className="text-xs text-gray-400">{currentSection + 1} / {PL_SCHEMA.length}</span>
          {currentSection < PL_SCHEMA.length - 1 ? (
            <button
              type="button"
              onClick={() => { draft.saveNow(); setCurrentSection((i) => Math.min(PL_SCHEMA.length - 1, i + 1)) }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              Напред
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-purple-200 transition-colors hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Запазване…' : 'Генерирай документи'}
            </button>
          )}
        </div>
        {!canSubmit && missing.length > 0 && currentSection === PL_SCHEMA.length - 1 && (
          <p className="text-xs text-amber-600 text-center mt-3">Остават {missing.length} задължителни полета</p>
        )}
      </div>
    </div>
  )
}
