'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { OA_SCHEMA, OA_INSURERS, OA_INSURER_KEYS, OAFormData, OAInsurerKey } from '@/lib/oa-schema'
import { readRenewalData, todayISO as renewalToday, addMonthsISO } from '@/lib/renewal'
import { EikInput, CompanyNameInput, useEikLookup } from './EikLookup'
import type { SchemaField } from '@/lib/schema'
import AutoFillUploader from './AutoFillUploader'
import StepperBar from './StepperBar'
import DraftRecoveryBanner from './DraftRecoveryBanner'
import DraftStatusIndicator from './DraftStatusIndicator'
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave'

const OA_STEPS = OA_SCHEMA.map((s) => ({ id: s.id, label: s.label, icon: s.icon }))

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
  field, formData, set, setNum, eikStatus, onEikChange, onCompanySelect, showError,
}: {
  field:           SchemaField
  formData:        OAFormData
  set:             (id: string, v: string) => void
  setNum:          (id: string, v: string) => void
  eikStatus:       import('./EikLookup').EikStatus
  onEikChange:     (v: string) => void
  onCompanySelect: Parameters<typeof CompanyNameInput>[0]['onSelect']
  showError?:      boolean
}) {
  const isEmpty = formData[field.id] === undefined || formData[field.id] === ''
  const hasError = showError && field.required && isEmpty
  const ic = hasError ? inputClass.replace('border-gray-300', 'border-red-400 bg-red-50/30') : inputClass
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
        <select value={String(val ?? '')} onChange={(e) => set(field.id, e.target.value)} className={ic + ' cursor-pointer'}>
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
        className={ic + ' resize-none'}
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
        className={ic}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        value={String(val ?? '')}
        onChange={(e) => set(field.id, e.target.value)}
        className={ic}
      />
    )
  }

  return (
    <input
      type="text"
      value={String(val ?? '')}
      onChange={(e) => set(field.id, e.target.value)}
      placeholder={field.placeholder}
      className={ic}
    />
  )
}

// ─── Section layout ───────────────────────────────────────────────────────────

function RenderSection({
  section, formData, set, setNum, eikStatus, onEikChange, onCompanySelect, showError,
}: {
  section:         typeof OA_SCHEMA[number]
  formData:        OAFormData
  set:             (id: string, v: string) => void
  setNum:          (id: string, v: string) => void
  eikStatus:       import('./EikLookup').EikStatus
  onEikChange:     (v: string) => void
  onCompanySelect: Parameters<typeof CompanyNameInput>[0]['onSelect']
  showError?:      boolean
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
  const [selectedInsurers, setSelectedInsurers] = useState<OAInsurerKey[]>(['allianz', 'groupama', 'ozk'])
  const [formData, setFormData] = useState<OAFormData>({})
  const [submitting, setSubmitting] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [prefillBanner, setPrefillBanner] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [renewedFromId, setRenewedFromId] = useState<string | null>(null)

  const draft = useDraftAutoSave({
    insuranceClass: 'occupational_accident',
    formData: formData as Record<string, unknown>,
    selectedInsurers,
    currentSection,
    eikField: 'oa_eik',
    clientNameField: 'oa_company_name',
  })

  // Apply renewal data on mount
  useEffect(() => {
    const renewal = readRenewalData()
    if (!renewal || renewal.insuranceClass !== 'occupational_accident') return
    const fd = renewal.formData as OAFormData
    const today = renewalToday()
    fd.oa_period_from = today
    fd.oa_period_to = addMonthsISO(today, 12)
    setFormData(fd)
    setSelectedInsurers(renewal.selectedInsurers as OAInsurerKey[])
    setRenewedFromId(renewal.renewedFromId)
    setPrefillBanner(String(fd.oa_company_name ?? ''))
  }, [])

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
    setAttemptedSubmit(true)
    if (!canSubmit || submitting) {
      const firstErrorSection = OA_SCHEMA.findIndex((s) =>
        s.fields.some((f) => f.required && (!formData[f.id] && formData[f.id] !== 0))
      )
      if (firstErrorSection >= 0) setCurrentSection(firstErrorSection)
      return
    }
    setSubmitting(true)
    try {
      const id         = uuidv4()
      const clientName = String(formData.oa_company_name ?? 'Нов клиент')
      const submission: StoredSubmission & { renewedFromId?: string } = {
        id, clientName, selectedInsurers,
        formData,
        insuranceClass: 'occupational_accident',
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

  const errorSectionsOA = OA_SCHEMA
    .filter((s, i) => (attemptedSubmit || i < currentSection) && s.fields.filter((f) => f.required).some((f) => !formData[f.id] && formData[f.id] !== 0))
    .map((s) => s.id)
  const showFieldErrorsOA = currentSection > 0 || attemptedSubmit

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нов въпросник Трудова злополука</h1>
        <p className="text-gray-500 text-sm">
          Задължителна и доброволна застраховка злополука на работници и служители
        </p>
        <DraftStatusIndicator status={draft.saveStatus} />
        <div className="mb-4" />

        {draft.pendingDraft && (
          <DraftRecoveryBanner
            draft={draft.pendingDraft}
            onRestore={() => {
              const restored = draft.restoreDraft()
              setFormData(restored.formData as OAFormData)
              setSelectedInsurers(restored.selectedInsurers as OAInsurerKey[])
              setCurrentSection(restored.currentSection)
            }}
            onDismiss={() => draft.dismissDraft()}
          />
        )}

        {/* Stepper */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
          <StepperBar
            steps={OA_STEPS}
            activeId={OA_SCHEMA[currentSection].id}
            completedIds={OA_SCHEMA
              .filter((s) => s.fields.filter((f) => f.required).every((f) => formData[f.id] !== undefined && formData[f.id] !== ''))
              .map((s) => s.id)}
            errorIds={errorSectionsOA}
            onNavigate={(id) => setCurrentSection(OA_SCHEMA.findIndex((s) => s.id === id))}
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
                  <div className={`w-7 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center ${selected ? 'bg-white/20' : 'bg-white'}`}>
                    <Image src={ins.logo} alt={ins.name} width={28} height={24} className="object-contain w-full h-full" />
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

        {/* Current section */}
        <RenderSection
          key={OA_SCHEMA[currentSection].id}
          section={OA_SCHEMA[currentSection]}
          formData={formData}
          set={set}
          setNum={setNum}
          eikStatus={eikStatus}
          onEikChange={handleEikChange}
          onCompanySelect={handleCompanySelect}
          showError={showFieldErrorsOA}
        />

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3 sm:relative fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:bottom-auto bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 p-4 sm:p-0 z-30">
          <button
            type="button"
            onClick={() => { draft.saveNow(); setCurrentSection((p) => Math.max(0, p - 1)) }}
            disabled={currentSection === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>
          <span className="text-xs text-gray-400">{currentSection + 1} / {OA_SCHEMA.length}</span>
          {currentSection < OA_SCHEMA.length - 1 ? (
            <button
              type="button"
              onClick={() => { draft.saveNow(); setCurrentSection((p) => Math.min(OA_SCHEMA.length - 1, p + 1)) }}
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
              disabled={submitting}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                !canSubmit && attemptedSubmit
                  ? 'bg-red-500 shadow-red-200 hover:bg-red-600'
                  : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {submitting ? 'Запазване…' : `Генерирай за ${selectedInsurers.length} застрахователя`}
            </button>
          )}
        </div>
        {!canSubmit && attemptedSubmit && missing.length > 0 && (
          <p className="text-xs text-red-600 text-center mt-3">Остават {missing.length} задължителни {missing.length === 1 ? 'поле' : 'полета'}</p>
        )}
      </div>
    </div>
  )
}
