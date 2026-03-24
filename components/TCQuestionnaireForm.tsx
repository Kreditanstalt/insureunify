'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import { TC_INSURERS, TC_INITIAL, TC_REQUIRED, type TCInsurerKey, type TCFormData } from '@/lib/tc-schema'
import { readRenewalData } from '@/lib/renewal'
import AutoFillUploader from './AutoFillUploader'
import { EikInput, CompanyNameInput, useEikLookup } from './EikLookup'
import StepperBar from './StepperBar'

const TC_STEPS = [
  { id: 'tc_basic',    label: 'Основни данни',    icon: '🏢' },
  { id: 'tc_turnover', label: 'Оборот и загуби',  icon: '📊' },
  { id: 'tc_markets',  label: 'Пазари',            icon: '🌍' },
  { id: 'tc_sales',    label: 'Структура',         icon: '📈' },
  { id: 'tc_payment',  label: 'Плащане',           icon: '💳' },
  { id: 'tc_buyers',   label: 'Купувачи',          icon: '👥' },
]

const TC_EIK_FIELD_MAP = {
  eik:            'tc_eik',
  company_name:   'tc_company_name',
  address:        'tc_address',
  email:          'tc_email',
  phone:          'tc_phone',
  activity:       'tc_activity',
  representative: 'tc_contact_person',
}

function Field({
  label, id, value, onChange, placeholder, required, type = 'text', hint, showError,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void
  placeholder?: string; required?: boolean; type?: string; hint?: string; showError?: boolean
}) {
  const hasError = showError && required && (!value || value === '')
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-all focus:ring-2 placeholder-gray-300 ${
          hasError
            ? 'border-red-400 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 bg-white focus:border-blue-400 focus:ring-blue-50'
        }`}
      />
      {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">
        <span className="text-base">{icon}</span>{title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function YearRow({
  year, turnover, losses, lossesCount, maxLoss,
  onYear, onTurnover, onLosses, onLossesCount, onMaxLoss,
}: {
  year: string; turnover: string; losses: string; lossesCount: string; maxLoss: string
  onYear: (v: string) => void; onTurnover: (v: string) => void
  onLosses: (v: string) => void; onLossesCount: (v: string) => void; onMaxLoss: (v: string) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-2 items-end">
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Година</label>
        <input value={year} onChange={(e) => onYear(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Оборот (хил. EUR)</label>
        <input value={turnover} onChange={(e) => onTurnover(e.target.value)} type="number" placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Щети (хил. EUR)</label>
        <input value={losses} onChange={(e) => onLosses(e.target.value)} type="number" placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Брой загуби</label>
        <input value={lossesCount} onChange={(e) => onLossesCount(e.target.value)} type="number" placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-gray-500 mb-1">Макс. щета (хил. EUR)</label>
        <input value={maxLoss} onChange={(e) => onMaxLoss(e.target.value)} type="number" placeholder="0"
          className="w-full rounded-lg border border-gray-200 px-2 py-2 text-sm text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
      </div>
    </div>
  )
}

function BuyerRow({
  n, name, country, id, limit, turnover,
  onName, onCountry, onId, onLimit, onTurnover,
}: {
  n: number; name: string; country: string; id: string; limit: string; turnover: string
  onName: (v: string) => void; onCountry: (v: string) => void; onId: (v: string) => void
  onLimit: (v: string) => void; onTurnover: (v: string) => void
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Купувач {n}</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-gray-500 mb-1">Наименование</label>
          <input value={name} onChange={(e) => onName(e.target.value)} placeholder="Фирма ООД"
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Държава</label>
          <input value={country} onChange={(e) => onCountry(e.target.value)} placeholder="България"
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">ЕИК / VAT</label>
          <input value={id} onChange={(e) => onId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Лимит ('000 EUR)</label>
          <input value={limit} onChange={(e) => onLimit(e.target.value)} type="number"
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Оборот ('000 EUR)</label>
          <input value={turnover} onChange={(e) => onTurnover(e.target.value)} type="number"
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        </div>
      </div>
    </div>
  )
}

export default function TCQuestionnaireForm() {
  const router = useRouter()
  const [form, setForm] = useState<TCFormData>(TC_INITIAL)
  const [selectedInsurers, setSelectedInsurers] = useState<TCInsurerKey[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [prefillBanner, setPrefillBanner] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [renewedFromId, setRenewedFromId] = useState<string | null>(null)

  // Apply renewal data on mount (TC has no period fields)
  useEffect(() => {
    const renewal = readRenewalData()
    if (!renewal || renewal.insuranceClass !== 'trade_credit') return
    setForm(renewal.formData as unknown as TCFormData)
    setSelectedInsurers(renewal.selectedInsurers as TCInsurerKey[])
    setRenewedFromId(renewal.renewedFromId)
    setPrefillBanner(String((renewal.formData as unknown as TCFormData).tc_company_name ?? ''))
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('iu_client_prefill')
      if (!raw) return
      localStorage.removeItem('iu_client_prefill')
      const p = JSON.parse(raw)
      setForm((prev) => ({
        ...prev,
        tc_company_name:   p.company_name   ?? prev.tc_company_name,
        tc_eik:            p.eik            ?? prev.tc_eik,
        tc_address:        p.address        ?? prev.tc_address,
        tc_contact_person: p.representative ?? prev.tc_contact_person,
        tc_phone:          p.phone          ?? prev.tc_phone,
        tc_email:          p.email          ?? prev.tc_email,
        tc_activity:       p.activity       ?? prev.tc_activity,
      }))
      setPrefillBanner(p.company_name ?? null)
    } catch { /* ignore */ }
  }, [])

  const handleAutoFill = useCallback((extracted: Record<string, string | null>) => {
    setForm((prev) => ({
      ...prev,
      tc_company_name:   extracted.company_name   ?? prev.tc_company_name,
      tc_eik:            extracted.eik            ?? prev.tc_eik,
      tc_address:        extracted.address        ?? prev.tc_address,
      tc_contact_person: extracted.representative ?? prev.tc_contact_person,
      tc_phone:          extracted.phone          ?? prev.tc_phone,
      tc_email:          extracted.email          ?? prev.tc_email,
      tc_activity:       extracted.activity       ?? prev.tc_activity,
    }))
  }, [])

  const setFormGeneric = useCallback((updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
    setForm((prev) => updater(prev as unknown as Record<string, unknown>) as unknown as TCFormData)
  }, [])

  const { eikStatus, handleEikChange, handleCompanySelect } = useEikLookup(setFormGeneric, TC_EIK_FIELD_MAP)

  function f(field: keyof TCFormData) {
    return (v: string) => setForm((prev) => ({ ...prev, [field]: v }))
  }

  function toggleInsurer(key: TCInsurerKey) {
    setSelectedInsurers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const missing = TC_REQUIRED.filter((k) => !form[k]?.toString().trim())
  const canSubmit = selectedInsurers.length > 0 && missing.length === 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const id = uuidv4()
      const submission: Record<string, unknown> = {
        id,
        clientName: form.tc_company_name || 'Нов клиент',
        selectedInsurers,
        insuranceClass: 'trade_credit',
        formData: { ...form },
        createdAt: new Date().toISOString(),
      }
      if (renewedFromId) submission.renewedFromId = renewedFromId
      const existing = JSON.parse(localStorage.getItem('iu_submissions') ?? '[]')
      localStorage.setItem('iu_submissions', JSON.stringify([submission, ...existing]))
      fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      }).catch(console.error)
      router.push(`/review/${id}`)
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Търговски кредит</h1>
          <p className="text-sm text-gray-500 mt-1">Застраховка на търговски вземания · Атрадиус, Алианц Трейд</p>
        </div>

        {/* Stepper */}
        {(() => {
          // Mark steps that user has passed as error if they have missing required TC fields
          const tcRequired: Record<string, string[]> = {
            tc_basic:    ['tc_company_name','tc_eik','tc_contact_person','tc_phone','tc_activity'],
            tc_turnover: ['tc_expected_insurable_turnover'],
            tc_markets:  [],
            tc_sales:    [],
            tc_payment:  [],
            tc_buyers:   [],
          }
          const errorSteps = TC_STEPS
            .slice(0, currentStep)
            .filter((s) => (tcRequired[s.id] ?? []).some((f) => !form[f as keyof typeof form]))
            .map((s) => s.id)
          return (
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
              <StepperBar
                steps={TC_STEPS}
                activeId={TC_STEPS[currentStep].id}
                completedIds={TC_STEPS.slice(0, currentStep).filter((s) => !(errorSteps.includes(s.id))).map((s) => s.id)}
                errorIds={errorSteps}
                onNavigate={(id) => setCurrentStep(TC_STEPS.findIndex((s) => s.id === id))}
              />
            </div>
          )
        })()}

        {/* Prefill banner */}
        {prefillBanner && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-emerald-800">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Данни заредени от профил на <strong>{prefillBanner}</strong>
            </span>
            <button onClick={() => setPrefillBanner(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Застрахователи — always visible */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Застрахователи</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TC_INSURERS) as TCInsurerKey[]).map((key) => {
              const ins = TC_INSURERS[key]
              const selected = selectedInsurers.includes(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleInsurer(key)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border-2 transition-all ${
                    selected ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={selected ? { backgroundColor: ins.color, borderColor: ins.color } : {}}
                >
                  <div className={`w-7 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center ${selected ? 'bg-white/20' : 'bg-white'}`}>
                    <Image src={ins.logo} alt={ins.name} width={28} height={24} className="object-contain w-full h-full" />
                  </div>
                  {ins.name}
                  {selected && (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          {selectedInsurers.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">Изберете поне един застраховател</p>
          )}
        </div>

        {/* AutoFill — step 0 only */}
        {currentStep === 0 && <AutoFillUploader onFill={handleAutoFill} />}

        {/* Step 0: Основни данни */}
        {currentStep === 0 && (
        <Section title="Основни данни" icon="🏢">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Наименование на дружеството<span className="text-red-400 ml-0.5">*</span>
              </label>
              <CompanyNameInput
                value={form.tc_company_name}
                onChange={f('tc_company_name')}
                onSelect={handleCompanySelect}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                ЕИК / National ID<span className="text-red-400 ml-0.5">*</span>
              </label>
              <EikInput
                value={form.tc_eik}
                onChange={handleEikChange}
                status={eikStatus}
              />
            </div>
            <Field label="Адрес" id="tc_address" value={form.tc_address} onChange={f('tc_address')} />
            <Field label="Лице за контакт" id="tc_contact_person" required showError={currentStep > 0}
              value={form.tc_contact_person} onChange={f('tc_contact_person')} />
            <Field label="Длъжност" id="tc_position" value={form.tc_position} onChange={f('tc_position')} />
            <Field label="Телефон" id="tc_phone" required showError={currentStep > 0} value={form.tc_phone} onChange={f('tc_phone')} />
            <Field label="Ел. поща" id="tc_email" value={form.tc_email} onChange={f('tc_email')} type="email" />
            <div className="sm:col-span-2">
              <Field label="Описание на дейността / Trade sector"
                id="tc_activity" value={form.tc_activity} onChange={f('tc_activity')} />
            </div>
            <Field label="Икономическа Група / Group" id="tc_group"
              value={form.tc_group} onChange={f('tc_group')} placeholder="ако е приложимо" />
            <Field label="Текущ застраховател" id="tc_current_insurer"
              value={form.tc_current_insurer} onChange={f('tc_current_insurer')} placeholder="ако има" />
            <Field label="Изтичане на текущата застраховка" id="tc_current_expiry"
              value={form.tc_current_expiry} onChange={f('tc_current_expiry')} type="date" />
          </div>
        </Section>
        )}

        {/* Step 1: Оборот и загуби */}
        {currentStep === 1 && (
        <Section title="Търговски оборот и загуби (хил. EUR с ДДС)" icon="📊">
          <p className="text-xs text-gray-400 -mt-2 mb-3">Попълнете данните за последните 3 финансови години</p>
          <div className="space-y-3">
            <YearRow
              year={form.tc_year1} turnover={form.tc_turnover_year1}
              losses={form.tc_losses_year1} lossesCount={form.tc_losses_count_year1} maxLoss={form.tc_max_loss_year1}
              onYear={f('tc_year1')} onTurnover={f('tc_turnover_year1')}
              onLosses={f('tc_losses_year1')} onLossesCount={f('tc_losses_count_year1')} onMaxLoss={f('tc_max_loss_year1')}
            />
            <YearRow
              year={form.tc_year2} turnover={form.tc_turnover_year2}
              losses={form.tc_losses_year2} lossesCount={form.tc_losses_count_year2} maxLoss={form.tc_max_loss_year2}
              onYear={f('tc_year2')} onTurnover={f('tc_turnover_year2')}
              onLosses={f('tc_losses_year2')} onLossesCount={f('tc_losses_count_year2')} onMaxLoss={f('tc_max_loss_year2')}
            />
            <YearRow
              year={form.tc_year3} turnover={form.tc_turnover_year3}
              losses={form.tc_losses_year3} lossesCount={form.tc_losses_count_year3} maxLoss={form.tc_max_loss_year3}
              onYear={f('tc_year3')} onTurnover={f('tc_turnover_year3')}
              onLosses={f('tc_losses_year3')} onLossesCount={f('tc_losses_count_year3')} onMaxLoss={f('tc_max_loss_year3')}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <Field label="Прогнозен оборот (хил. EUR)" id="tc_expected_turnover"
              value={form.tc_expected_turnover} onChange={f('tc_expected_turnover')} type="number" />
            <Field label="Застрах. оборот (хил. EUR)" id="tc_expected_insurable_turnover" required showError={currentStep > 1}
              value={form.tc_expected_insurable_turnover} onChange={f('tc_expected_insurable_turnover')}
              type="number" hint="Застрахователен оборот" />
            <Field label="Вътрешен пазар (хил. EUR)" id="tc_expected_domestic"
              value={form.tc_expected_domestic} onChange={f('tc_expected_domestic')} type="number" />
            <Field label="Експорт (хил. EUR)" id="tc_expected_export"
              value={form.tc_expected_export} onChange={f('tc_expected_export')} type="number" />
          </div>
        </Section>
        )}

        {/* Step 2: Пазари */}
        {currentStep === 2 && (
        <Section title="Разпределение по пазари" icon="🌍">
          <div className="space-y-3">
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="grid grid-cols-2 gap-3">
                <Field label={`Държава ${n}`}
                  id={`tc_market${n}_country`}
                  value={form[`tc_market${n}_country` as keyof TCFormData]}
                  onChange={f(`tc_market${n}_country` as keyof TCFormData)}
                  placeholder={n === 1 ? 'България' : ''} />
                <Field label={`Оборот ${n} (хил. EUR)`}
                  id={`tc_market${n}_turnover`}
                  value={form[`tc_market${n}_turnover` as keyof TCFormData]}
                  onChange={f(`tc_market${n}_turnover` as keyof TCFormData)}
                  type="number" />
              </div>
            ))}
          </div>
        </Section>
        )}

        {/* Step 3: Структура */}
        {currentStep === 3 && (
        <Section title="Структура на продажбите" icon="📈">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="% публичен сектор" id="tc_public_sector_pct"
              value={form.tc_public_sector_pct} onChange={f('tc_public_sector_pct')} type="number" placeholder="0" />
            <Field label="% вътрешногрупови" id="tc_intercompany_pct"
              value={form.tc_intercompany_pct} onChange={f('tc_intercompany_pct')} type="number" placeholder="0" />
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">Търговски сектори на купувачите:</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Сектор 1" id="tc_buyer_sector1"
                value={form.tc_buyer_sector1} onChange={f('tc_buyer_sector1')} placeholder="напр. Търговия" />
              <Field label="% от оборота" id="tc_buyer_sector1_pct"
                value={form.tc_buyer_sector1_pct} onChange={f('tc_buyer_sector1_pct')} type="number" />
              <Field label="Сектор 2" id="tc_buyer_sector2"
                value={form.tc_buyer_sector2} onChange={f('tc_buyer_sector2')} placeholder="напр. Производство" />
              <Field label="% от оборота" id="tc_buyer_sector2_pct"
                value={form.tc_buyer_sector2_pct} onChange={f('tc_buyer_sector2_pct')} type="number" />
            </div>
          </div>
        </Section>
        )}

        {/* Step 4: Плащане */}
        {currentStep === 4 && (
        <Section title="Условия на плащане" icon="💳">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="% аванси" id="tc_cash_advance_pct"
              value={form.tc_cash_advance_pct} onChange={f('tc_cash_advance_pct')} type="number" placeholder="0" />
            <Field label="Стандартен срок (дни)" id="tc_standard_terms"
              value={form.tc_standard_terms} onChange={f('tc_standard_terms')} type="number" placeholder="30" />
            <Field label="Максимален срок (дни)" id="tc_max_terms"
              value={form.tc_max_terms} onChange={f('tc_max_terms')} type="number" placeholder="60" />
            <Field label="DSO (дни)" id="tc_dso"
              value={form.tc_dso} onChange={f('tc_dso')} type="number" placeholder="45"
              hint="Среден период на събиране" />
          </div>
        </Section>
        )}

        {/* Step 5: Купувачи */}
        {currentStep === 5 && (
        <Section title="Основни купувачи за застраховане (Топ 5)" icon="👥">
          <p className="text-xs text-gray-400 -mt-2">Атрадиус ще провери безплатно до 10 купувача</p>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <BuyerRow key={n} n={n}
                name={form[`tc_buyer${n}_name` as keyof TCFormData]}
                country={form[`tc_buyer${n}_country` as keyof TCFormData]}
                id={form[`tc_buyer${n}_id` as keyof TCFormData]}
                limit={form[`tc_buyer${n}_limit` as keyof TCFormData]}
                turnover={form[`tc_buyer${n}_turnover` as keyof TCFormData]}
                onName={f(`tc_buyer${n}_name` as keyof TCFormData)}
                onCountry={f(`tc_buyer${n}_country` as keyof TCFormData)}
                onId={f(`tc_buyer${n}_id` as keyof TCFormData)}
                onLimit={f(`tc_buyer${n}_limit` as keyof TCFormData)}
                onTurnover={f(`tc_buyer${n}_turnover` as keyof TCFormData)}
              />
            ))}
          </div>
        </Section>
        )}

        {/* Navigation */}
        <div className="mt-2 flex items-center justify-between gap-3 sm:relative fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:bottom-auto bg-white sm:bg-transparent border-t sm:border-t-0 border-gray-200 p-4 sm:p-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Назад
          </button>
          <span className="text-xs text-gray-400">{currentStep + 1} / {TC_STEPS.length}</span>
          {currentStep < TC_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((p) => Math.min(TC_STEPS.length - 1, p + 1))}
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
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Запазване…</>
              ) : (
                <>Генерирай формуляри за {selectedInsurers.length} застрахователя</>
              )}
            </button>
          )}
        </div>
        {!canSubmit && currentStep === TC_STEPS.length - 1 && (
          <p className="text-xs text-amber-600 text-center mt-2">
            {missing.length > 0 ? `Остават ${missing.length} задължителни полета` : 'Изберете застраховател'}
          </p>
        )}

      </div>
    </div>
  )
}
