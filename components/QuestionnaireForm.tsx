'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { INSURERS, MASTER_SCHEMA, VALUE_FIELDS, FormData, InsurerKey, SchemaField } from '@/lib/schema'
import { fmtDateBG } from '@/lib/utils'

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  formData: FormData
  createdAt: string
}

function computeTotal(data: FormData): number {
  return VALUE_FIELDS.reduce((sum, id) => {
    const v = Number(data[id] ?? 0)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)
}

// ─── EIK lookup types ────────────────────────────────────────────────────────

type EikStatus = 'idle' | 'loading' | 'found' | 'not_found'

// ─── Field lookup map ────────────────────────────────────────────────────────

const fieldById = new Map<string, SchemaField>()
for (const section of MASTER_SCHEMA) {
  for (const f of section.fields) fieldById.set(f.id, f)
}

// ─── Layout definition ───────────────────────────────────────────────────────
// Each section has ordered groups: 'full' = 12 cols, 'pair' = 6+6 cols

type Group =
  | { type: 'full'; id: string }
  | { type: 'pair'; ids: [string, string] }
  | { type: 'period' }

const LAYOUT: Record<string, Group[]> = {
  applicant: [
    { type: 'full',  id: 'company_name' },
    { type: 'pair',  ids: ['eik', 'phone'] },
    { type: 'pair',  ids: ['email', 'activity'] },
    { type: 'full',  id: 'address' },
    { type: 'pair',  ids: ['nkid_code', 'representative'] },
  ],
  insurance_object: [
    { type: 'full',  id: 'property_address' },
    { type: 'full',  id: 'object_activity' },
    { type: 'full',  id: 'beneficiary' },
    { type: 'period' },
  ],
  property_values: [
    { type: 'pair',  ids: ['currency', 'val_total'] },
    { type: 'pair',  ids: ['val_buildings', 'val_machinery'] },
    { type: 'pair',  ids: ['val_electronics', 'val_inventory'] },
    { type: 'pair',  ids: ['val_stock', 'val_vehicles_no_reg'] },
    { type: 'pair',  ids: ['val_other_dma', 'val_third_party'] },
    { type: 'pair',  ids: ['val_cash', 'valuation_basis'] },
    { type: 'full',  id: 'stock_basis' },
  ],
  building_info: [
    { type: 'full',  id: 'building_purpose' },
    { type: 'pair',  ids: ['construction_type', 'roof_type'] },
    { type: 'pair',  ids: ['construction_year', 'floors'] },
    { type: 'pair',  ids: ['area_sqm', 'sandwich_panels'] },
    { type: 'full',  id: 'last_renovation' },
    { type: 'pair',  ids: ['building_standalone', 'commissioned'] },
    { type: 'full',  id: 'energy_cert' },
    { type: 'pair',  ids: ['photovoltaic', 'lightning_protection'] },
  ],
  fire_safety: [
    { type: 'full',  id: 'fire_compliance' },
    { type: 'pair',  ids: ['fire_alarm', 'fire_extinguishers'] },
    { type: 'pair',  ids: ['sprinklers', 'hydrants'] },
    { type: 'pair',  ids: ['additional_water', 'detectors'] },
    { type: 'full',  id: 'fire_station_distance' },
    { type: 'full',  id: 'last_inspection' },
  ],
  security: [
    { type: 'full',  id: 'occupancy' },
    { type: 'pair',  ids: ['alarm_system', 'guard_type'] },
    { type: 'pair',  ids: ['cctv', 'fence'] },
    { type: 'full',  id: 'other_security' },
  ],
  risk_environment: [
    { type: 'full',  id: 'hazardous_materials' },
    { type: 'full',  id: 'hazardous_desc' },
    { type: 'pair',  ids: ['water_basin_distance', 'landslide_area'] },
    { type: 'pair',  ids: ['underground_equipment', 'stock_floor_distance'] },
    { type: 'pair',  ids: ['nearest_building_distance', 'stored_materials_type'] },
  ],
  claims_history: [
    { type: 'pair',  ids: ['previous_claims', 'existing_insurance'] },
    { type: 'full',  id: 'claims_details' },
    { type: 'pair',  ids: ['insurance_declined', 'insurance_cancelled'] },
    { type: 'full',  id: 'additional_info' },
  ],
  payment: [
    { type: 'pair',  ids: ['payment_type', 'custom_deductible'] },
    { type: 'full',  id: 'deductible_details' },
  ],
}

// ─── Conditional field visibility ────────────────────────────────────────────

const CONDITIONAL: Record<string, { field: string; value: string }> = {
  claims_details:   { field: 'previous_claims',    value: 'yes' },
  hazardous_desc:   { field: 'hazardous_materials', value: 'yes' },
  deductible_details: { field: 'custom_deductible', value: 'yes' },
}

function isVisible(id: string, formData: FormData): boolean {
  const cond = CONDITIONAL[id]
  return !cond || formData[cond.field] === cond.value
}

// ─── Primitive components ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-8 mb-3 pb-2 border-b border-gray-200">
      {children}
    </h2>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm'

function TextInput({
  value, onChange, placeholder, type = 'text', disabled,
}: {
  value: string | number | undefined
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      min={type === 'number' ? 0 : undefined}
      className={inputClass + (disabled ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
    />
  )
}

function ToggleGroup({
  options, value, onChange,
}: {
  options: { value: string; label: string }[]
  value: string | number | undefined
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors min-h-[34px] ${
            value === opt.value
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SelectInput({
  options, value, onChange,
}: {
  options: { value: string; label: string }[]
  value: string | number | undefined
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass + ' cursor-pointer'}
    >
      <option value="" disabled>— изберете —</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate + 'T00:00:00')
  d.setMonth(d.getMonth() + months)
  // Handle month overflow (e.g. Jan 31 + 1 month = Feb 28)
  return d.toISOString().split('T')[0]
}

// ─── Period selector ─────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '6 месеца',  months: 6 },
  { label: '1 година',  months: 12 },
  { label: '2 години',  months: 24 },
  { label: 'Друг',      months: 0 },
]

function PeriodSelector({
  formData, set,
}: {
  formData: FormData
  set: (id: string, v: string) => void
}) {
  const [selMonths, setSelMonths] = useState(12)
  const [isCustom, setIsCustom] = useState(false)
  const [customVal, setCustomVal] = useState('')
  const initialized = useRef(false)

  // Set defaults once on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const from = (formData.period_from as string) || todayISO()
    if (!formData.period_from) set('period_from', from)
    if (!formData.period_to)   set('period_to',   addMonths(from, 12))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function calcTo(from: string, months: number) {
    if (months > 0) set('period_to', addMonths(from, months))
  }

  function handleFromChange(v: string) {
    set('period_from', v)
    calcTo(v, isCustom ? parseInt(customVal) || 0 : selMonths)
  }

  function handleDuration(months: number) {
    if (months === 0) {
      setIsCustom(true)
    } else {
      setIsCustom(false)
      setSelMonths(months)
      calcTo((formData.period_from as string) || todayISO(), months)
    }
  }

  function handleCustomInput(v: string) {
    setCustomVal(v)
    const months = parseInt(v) || 0
    if (months > 0) calcTo((formData.period_from as string) || todayISO(), months)
  }

  const periodTo = formData.period_to as string | undefined

  return (
    <div className="space-y-3">
      {/* Row: start date + end date display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Начална дата" required>
          <input
            type="date"
            value={(formData.period_from as string) || todayISO()}
            onChange={(e) => handleFromChange(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Крайна дата">
          <div className={inputClass + ' bg-gray-50 text-gray-600 cursor-default select-none'}>
            {periodTo ? `до: ${fmtDateBG(periodTo)}` : '—'}
          </div>
        </Field>
      </div>

      {/* Duration quick-select */}
      <Field label="Срок на застраховката" required>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map(({ label, months }) => {
            const active = months === 0 ? isCustom : !isCustom && selMonths === months
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleDuration(months)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors min-h-[34px] ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        {isCustom && (
          <div className="mt-2 max-w-[160px]">
            <input
              type="number"
              min={1}
              max={120}
              value={customVal}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder="брой месеци"
              className={inputClass}
            />
          </div>
        )}
      </Field>
    </div>
  )
}

// ─── EIK input with lookup feedback ─────────────────────────────────────────

function EIKInput({
  value, onChange, status,
}: {
  value: string | number | undefined
  onChange: (v: string) => void
  status: EikStatus
}) {
  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="123456789"
          maxLength={13}
          className={
            inputClass +
            (status === 'found' ? ' border-green-400 pr-9' : '') +
            (status === 'not_found' ? ' border-amber-400 pr-9' : '') +
            (status === 'loading' ? ' pr-9' : '')
          }
        />
        {/* Right-side icon */}
        {status === 'loading' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {status === 'found' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'not_found' && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
        )}
      </div>
      {/* Status message */}
      {status === 'found' && (
        <p className="text-[12px] text-green-600 mt-1 flex items-center gap-1">
          <span>✓</span> Данните са заредени от Търговски регистър
        </p>
      )}
      {status === 'not_found' && (
        <p className="text-[12px] text-amber-600 mt-1">
          Не е намерен в ТР — попълнете ръчно
        </p>
      )}
      {status === 'loading' && (
        <p className="text-[12px] text-blue-500 mt-1">Търсене в Търговски регистър…</p>
      )}
    </div>
  )
}

// ─── Company name input with autocomplete search ──────────────────────────────

interface CompanyResult { uic: string; name: string; legalForm: string; status: string }

function CompanyNameInput({
  value, onChange, onSelect,
}: {
  value: string | number | undefined
  onChange: (v: string) => void
  onSelect: (result: { company_name: string; eik: string; address?: string; city?: string }) => void
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
        onSelect({ company_name: item.name, eik: item.uic, address: data.address, city: data.city })
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
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-sm">
          {searching ? (
            <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
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
              className="px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-medium text-gray-900">{c.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{c.uic} · {c.legalForm} · {c.status === 'N' ? 'Активна' : 'Неактивна'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Render single field input ───────────────────────────────────────────────

function FieldInput({
  field, formData, set, setNum, total, eikStatus, onEikChange, onCompanySelect,
}: {
  field: SchemaField
  formData: FormData
  set: (id: string, v: string) => void
  setNum: (id: string, v: string) => void
  total: number
  eikStatus?: EikStatus
  onEikChange?: (v: string) => void
  onCompanySelect?: (result: { company_name: string; eik: string; address?: string; city?: string }) => void
}) {
  // Special render for company_name field — autocomplete search
  if (field.id === 'company_name') {
    return (
      <CompanyNameInput
        value={formData.company_name}
        onChange={(v) => set('company_name', v)}
        onSelect={onCompanySelect ?? (() => {})}
      />
    )
  }
  // Special render for EIK field
  if (field.id === 'eik') {
    return (
      <EIKInput
        value={formData.eik}
        onChange={onEikChange ?? ((v) => set('eik', v))}
        status={eikStatus ?? 'idle'}
      />
    )
  }
  if (field.computed) {
    return <TextInput type="number" value={total > 0 ? total : ''} placeholder="0" disabled />
  }
  if (field.type === 'select' && field.options) {
    return field.options.length <= 4
      ? <ToggleGroup options={field.options} value={formData[field.id]} onChange={(v) => set(field.id, v)} />
      : <SelectInput options={field.options} value={formData[field.id]} onChange={(v) => set(field.id, v)} />
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
    return <TextInput type="number" value={formData[field.id]} onChange={(v) => setNum(field.id, v)} placeholder={field.placeholder ?? '0'} />
  }
  if (field.type === 'date') {
    return <TextInput type="date" value={formData[field.id]} onChange={(v) => set(field.id, v)} />
  }
  return <TextInput value={formData[field.id]} onChange={(v) => set(field.id, v)} placeholder={field.placeholder} />
}

// ─── Render a layout group ───────────────────────────────────────────────────

function RenderGroup({
  group, formData, set, setNum, total, eikStatus, onEikChange, onCompanySelect,
}: {
  group: Group
  formData: FormData
  set: (id: string, v: string) => void
  setNum: (id: string, v: string) => void
  total: number
  eikStatus: EikStatus
  onEikChange: (v: string) => void
  onCompanySelect: (result: { company_name: string; eik: string; address?: string; city?: string }) => void
}) {
  if (group.type === 'period') {
    return <PeriodSelector formData={formData} set={set} />
  }

  if (group.type === 'full') {
    if (!isVisible(group.id, formData)) return null
    const field = fieldById.get(group.id)
    if (!field) return null
    return (
      <Field label={field.label} required={field.required}>
        <FieldInput field={field} formData={formData} set={set} setNum={setNum} total={total} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
      </Field>
    )
  }

  // pair — hide if both are invisible
  const [idA, idB] = group.ids
  const visA = isVisible(idA, formData)
  const visB = isVisible(idB, formData)
  if (!visA && !visB) return null

  const fieldA = fieldById.get(idA)
  const fieldB = fieldById.get(idB)

  // If only one is visible, show it full-width
  if (!visA || !visB) {
    const field = visA ? fieldA : fieldB
    if (!field) return null
    return (
      <Field label={field.label} required={field.required}>
        <FieldInput field={field} formData={formData} set={set} setNum={setNum} total={total} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
      </Field>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fieldA && (
        <Field label={fieldA.label} required={fieldA.required}>
          <FieldInput field={fieldA} formData={formData} set={set} setNum={setNum} total={total} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
        </Field>
      )}
      {fieldB && (
        <Field label={fieldB.label} required={fieldB.required}>
          <FieldInput field={fieldB} formData={formData} set={set} setNum={setNum} total={total} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
        </Field>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function QuestionnaireForm() {
  const router = useRouter()
  const [selectedInsurers, setSelectedInsurers] = useState<InsurerKey[]>(['bulstrad', 'generali', 'instinct'])
  const [formData, setFormData] = useState<FormData>({})
  const [submitting, setSubmitting] = useState(false)
  const [eikStatus, setEikStatus] = useState<EikStatus>('idle')
  const abortRef = useRef<AbortController | null>(null)

  function set(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }
  function setNum(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value === '' ? undefined : Number(value) }))
  }
  function toggleInsurer(key: InsurerKey) {
    setSelectedInsurers((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const lookupEik = useCallback(async (eik: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setEikStatus('loading')
    try {
      const res = await fetch(`/api/eik?eik=${encodeURIComponent(eik)}`, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      if (res.ok) {
        const data = await res.json()
        if (data.company_name) {
          setFormData((prev) => ({
            ...prev,
            ...(data.company_name ? { company_name: data.company_name } : {}),
            ...(data.address      ? { address: data.address }           : {}),
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
    set('eik', v)
    const digits = v.replace(/\D/g, '')
    if (digits.length === 9 || digits.length === 13) {
      lookupEik(digits)
    } else {
      abortRef.current?.abort()
      setEikStatus('idle')
    }
  }

  function handleCompanySelect(result: { company_name: string; eik: string; address?: string; city?: string }) {
    set('company_name', result.company_name)
    set('eik', result.eik)
    if (result.address) set('address', result.address)
    setEikStatus('found')
  }

  const total = computeTotal(formData)

  const REQUIRED_IDS = MASTER_SCHEMA.flatMap((s) => s.fields.filter((f) => f.required && !f.computed).map((f) => f.id))
  const missing = REQUIRED_IDS.filter((id) => formData[id] === undefined || formData[id] === '')
  const totalMissing = missing.length + (total === 0 ? 1 : 0)
  const canSubmit = selectedInsurers.length > 0 && totalMissing === 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const id = uuidv4()
      const clientName = String(formData.company_name ?? 'Нов клиент')
      const submission: StoredSubmission = {
        id, clientName, selectedInsurers,
        formData: { ...formData, val_total: total },
        createdAt: new Date().toISOString(),
      }
      const existing = JSON.parse(localStorage.getItem('iu_submissions') ?? '[]') as StoredSubmission[]
      localStorage.setItem('iu_submissions', JSON.stringify([submission, ...existing]))
      router.push(`/review/${id}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-medium text-gray-700">Нов въпросник</span>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нов въпросник</h1>
        <p className="text-gray-500 text-sm mb-6">
          Попълнете информацията и генерирайте формулярите за застрахователите
        </p>

        {/* Insurer selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Застрахователи</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(INSURERS) as InsurerKey[]).map((key) => {
              const ins = INSURERS[key]
              const selected = selectedInsurers.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleInsurer(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selected ? '' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  style={selected ? { backgroundColor: ins.color + '18', borderColor: ins.color, color: ins.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected ? ins.color : '#d1d5db' }} />
                  <span style={selected ? { color: ins.color } : {}}>{ins.name}</span>
                  <span className="text-xs opacity-50">{ins.formCode}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* All sections rendered from LAYOUT config */}
        {MASTER_SCHEMA.map((section) => {
          const groups = LAYOUT[section.id]
          if (!groups) return null
          return (
            <div key={section.id}>
              <SectionTitle>{section.label}</SectionTitle>
              <div className="space-y-3">
                {groups.map((group, i) => (
                  <RenderGroup
                    key={i}
                    group={group}
                    formData={formData}
                    set={set}
                    setNum={setNum}
                    total={total}
                    eikStatus={eikStatus}
                    onEikChange={handleEikChange}
                    onCompanySelect={handleCompanySelect}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Submit */}
        <div className="mt-10">
          {!canSubmit && totalMissing > 0 && (
            <p className="text-xs text-amber-600 text-center mb-3">
              Попълнете всички задължителни полета (*) — остават {totalMissing}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors shadow-sm shadow-blue-200"
          >
            {submitting ? 'Запазване…' : `Генерирай формуляри за ${selectedInsurers.length} застрахователя`}
          </button>
        </div>
      </div>
    </div>
  )
}
