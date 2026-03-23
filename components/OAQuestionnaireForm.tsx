'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { OA_SCHEMA, OA_INSURERS, OA_INSURER_KEYS, OAFormData, OAInsurerKey } from '@/lib/oa-schema'
import { EikInput, CompanyNameInput, useEikLookup } from './EikLookup'
import type { SchemaField } from '@/lib/schema'
import AutoFillUploader from './AutoFillUploader'

// ─── EIK field map ────────────────────────────────────────────────────────────

const OA_EIK_FIELD_MAP = {
  eik:            'oa_eik',
  company_name:   'oa_company_name',
  address:        'oa_address',
  email:          'oa_email',
  phone:          'oa_phone',
  activity:       'oa_activity',
  nkid_code:      'oa_activity_code',
  representative: 'oa_representative',
}

// ─── Stored submission type ───────────────────────────────────────────────────

interface StoredSubmission {
  id:               string
  clientName:       string
  selectedInsurers: OAInsurerKey[]
  formData:         OAFormData
  insuranceClass:   string
  createdAt:        string
}

// ─── Primitive input styles ───────────────────────────────────────────────────

const inputClass =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow shadow-sm'

// ─── Primitive UI ─────────────────────────────────────────────────────────────

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
      {text}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-8 mb-3 pb-2 border-b border-gray-200">
      <span>{icon}</span> {label}
    </h3>
  )
}

function ToggleGroup({ options, value, onChange }: {
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
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200'
              : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-400 hover:text-emerald-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Mapping badge (shows which insurers have this field) ─────────────────────

function MappingBadges({ field }: { field: SchemaField }) {
  const present = OA_INSURER_KEYS.filter((k) => field.mapping[k])
  if (present.length === OA_INSURER_KEYS.length) return null
  return (
    <div className="flex gap-1 mt-1">
      {present.map((k) => (
        <span
          key={k}
          className="text-[10px] px-1.5 py-0.5 rounded text-white font-medium"
          style={{ backgroundColor: OA_INSURERS[k].color }}
        >
          {OA_INSURERS[k].name}
        </span>
      ))}
    </div>
  )
}

// ─── Field renderer ───────────────────────────────────────────────────────────

function FieldInput({
  field, formData, set, setNum, eikStatus, onEikChange, onCompanySelect,
}: {
  field:           SchemaField
  formData:        OAFormData
  set:             (id: string, v: string) => void
  setNum:          (id: string, v: string) => void
  eikStatus:       import('./EikLookup').EikStatus
  onEikChange:     (v: string) => void
  onCompanySelect: Parameters<typeof CompanyNameInput>[0]['onSelect']
}) {
  if (field.id === 'oa_company_name') {
    return (
      <CompanyNameInput
        value={formData.oa_company_name}
        onChange={(v) => set('oa_company_name', v)}
        onSelect={onCompanySelect}
      />
    )
  }

  if (field.id === 'oa_eik') {
    return (
      <EikInput
        value={formData.oa_eik}
        onChange={onEikChange}
        status={eikStatus}
      />
    )
  }

  const val = formData[field.id]

  if (field.type === 'select' && field.options) {
    return field.options.length <= 4
      ? <ToggleGroup options={field.options} value={val} onChange={(v) => set(field.id, v)} />
      : (
        <select value={String(val ?? '')} onChange={(e) => set(field.id, e.target.value)} className={inputClass + ' cursor-pointer'}>
          <option value="" disabled>— изберете —</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        value={String(val ?? '')}
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
        min={0}
        value={val ?? ''}
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
        value={String(val ?? '')}
        onChange={(e) => set(field.id, e.target.value)}
        className={inputClass}
      />
    )
  }

  return (
    <input
      type="text"
      value={String(val ?? '')}
      onChange={(e) => set(field.id, e.target.value)}
      placeholder={field.placeholder}
      className={inputClass}
    />
  )
}

// ─── Section layout ───────────────────────────────────────────────────────────

function RenderSection({
  section, formData, set, setNum, eikStatus, onEikChange, onCompanySelect,
}: {
  section:         typeof OA_SCHEMA[number]
  formData:        OAFormData
  set:             (id: string, v: string) => void
  setNum:          (id: string, v: string) => void
  eikStatus:       import('./EikLookup').EikStatus
  onEikChange:     (v: string) => void
  onCompanySelect: Parameters<typeof CompanyNameInput>[0]['onSelect']
}) {
  const pairs: SchemaField[][] = []
  let i = 0
  while (i < section.fields.length) {
    const f = section.fields[i]
    const isWide = f.type === 'textarea' || (f.type === 'select' && (f.options?.length ?? 0) > 4)
    if (isWide || i + 1 >= section.fields.length) {
      pairs.push([f])
      i++
    } else {
      pairs.push([f, section.fields[i + 1]])
      i += 2
    }
  }

  return (
    <>
      <SectionTitle icon={section.icon} label={section.label} />
      <div className="space-y-3">
        {pairs.map((group, gi) =>
          group.length === 1 ? (
            <div key={gi}>
              <Label text={group[0].label} required={group[0].required} />
              <FieldInput field={group[0]} formData={formData} set={set} setNum={setNum} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
              {group[0].helpText && <p className="text-[11px] text-blue-600 mt-1">{group[0].helpText}</p>}
              <MappingBadges field={group[0]} />
            </div>
          ) : (
            <div key={gi} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.map((f) => (
                <div key={f.id}>
                  <Label text={f.label} required={f.required} />
                  <FieldInput field={f} formData={formData} set={set} setNum={setNum} eikStatus={eikStatus} onEikChange={onEikChange} onCompanySelect={onCompanySelect} />
                  {f.helpText && <p className="text-[11px] text-blue-600 mt-1">{f.helpText}</p>}
                  <MappingBadges field={f} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OAQuestionnaireForm() {
  const router = useRouter()
  const [selectedInsurers, setSelectedInsurers] = useState<OAInsurerKey[]>(['allianz', 'groupama'])
  const [formData, setFormData] = useState<OAFormData>({})
  const [submitting, setSubmitting] = useState(false)
  const [prefillBanner, setPrefillBanner] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iu_client_prefill')
      if (!raw) return
      localStorage.removeItem('iu_client_prefill')
      const p = JSON.parse(raw)
      setFormData((prev) => ({
        ...prev,
        oa_company_name:  p.company_name    ?? prev.oa_company_name,
        oa_eik:           p.eik             ?? prev.oa_eik,
        oa_address:       p.address         ?? prev.oa_address,
        oa_phone:         p.phone           ?? prev.oa_phone,
        oa_activity:      p.activity        ?? prev.oa_activity,
        oa_activity_code: p.nkid_code       ?? prev.oa_activity_code,
        oa_employees_count: p.employees_count ? String(p.employees_count) : prev.oa_employees_count,
        oa_annual_wage_fund: p.annual_wage_fund ? String(p.annual_wage_fund) : prev.oa_annual_wage_fund,
      }))
      setPrefillBanner(p.company_name ?? null)
    } catch { /* ignore */ }
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setFormDataGeneric = useCallback((updater: (prev: any) => any) => {
    setFormData(updater)
  }, [])

  const { eikStatus, handleEikChange, handleCompanySelect } = useEikLookup(
    setFormDataGeneric,
    OA_EIK_FIELD_MAP,
  )

  function set(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }
  function setNum(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value === '' ? undefined : Number(value) }))
  }

  function handleAutoFill(extracted: Record<string, string | null>) {
    setFormData((prev) => {
      const next = { ...prev }
      const s = (id: string, v: string | null | undefined) => { if (v) next[id] = v }
      s('oa_company_name',  extracted.company_name)
      s('oa_eik',           extracted.eik)
      s('oa_address',       extracted.address)
      s('oa_phone',         extracted.phone)
      s('oa_activity',      extracted.activity)
      s('oa_activity_code', extracted.nkid_code)
      s('oa_representative', extracted.representative)
      s('oa_persons_count', extracted.employees_count)
      return next
    })
  }

  function toggleInsurer(key: OAInsurerKey) {
    setSelectedInsurers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const REQUIRED_IDS = OA_SCHEMA.flatMap((s) =>
    s.fields.filter((f) => f.required).map((f) => f.id)
  )
  const missing   = REQUIRED_IDS.filter((id) => !formData[id] && formData[id] !== 0)
  const canSubmit = selectedInsurers.length > 0 && missing.length === 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const id         = uuidv4()
      const clientName = String(formData.oa_company_name ?? 'Нов клиент')
      const submission: StoredSubmission = {
        id, clientName, selectedInsurers,
        formData,
        insuranceClass: 'occupational_accident',
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
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нов въпросник Трудова злополука</h1>
        <p className="text-gray-500 text-sm mb-6">
          Задължителна и доброволна застраховка злополука на работници и служители
        </p>

        {prefillBanner && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-emerald-800">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Данни заредени от профил на <strong>{prefillBanner}</strong>
            </span>
            <button onClick={() => setPrefillBanner(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        <AutoFillUploader onFill={handleAutoFill} className="mb-4" />

        {/* Insurer selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Застрахователи
          </p>
          <div className="flex flex-wrap gap-2">
            {OA_INSURER_KEYS.map((key) => {
              const ins      = OA_INSURERS[key]
              const selected = selectedInsurers.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleInsurer(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    selected ? 'text-white' : 'bg-white text-gray-700 border-gray-200'
                  }`}
                  style={selected ? { backgroundColor: ins.color, borderColor: ins.color } : undefined}
                >
                  <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                    <Image src={ins.logo} alt={ins.name} width={20} height={20} className="object-contain w-full h-full" />
                  </div>
                  {ins.name}
                  {selected && (
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

        {/* Form sections */}
        {OA_SCHEMA.map((section) => (
          <RenderSection
            key={section.id}
            section={section}
            formData={formData}
            set={set}
            setNum={setNum}
            eikStatus={eikStatus}
            onEikChange={handleEikChange}
            onCompanySelect={handleCompanySelect}
          />
        ))}

        {/* Submit */}
        <div className="mt-10">
          {!canSubmit && missing.length > 0 && (
            <p className="text-xs text-amber-600 text-center mb-3">
              Попълнете всички задължителни полета (*) — остават {missing.length}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors shadow-sm shadow-emerald-200"
          >
            {submitting
              ? 'Запазване…'
              : `Генерирай за ${selectedInsurers.length} застрахователя`}
          </button>
        </div>
      </div>
    </div>
  )
}
