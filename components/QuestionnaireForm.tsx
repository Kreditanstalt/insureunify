'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { INSURERS, FormData, InsurerKey } from '@/lib/schema'

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  formData: FormData
  createdAt: string
}

const VALUE_FIELDS = ['val_buildings', 'val_machinery', 'val_electronics', 'val_inventory', 'val_stock']

function computeTotal(data: FormData): number {
  return VALUE_FIELDS.reduce((sum, id) => {
    const v = Number(data[id] ?? 0)
    return sum + (isNaN(v) ? 0 : v)
  }, 0)
}

// ─── Primitive components ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-10 mb-5 pb-2 border-b border-gray-800">
      {children}
    </h2>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white ' +
  'placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors'

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
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
      className={inputClass + (disabled ? ' opacity-60 cursor-not-allowed bg-gray-900' : '')}
    />
  )
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string | number | undefined
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[40px] ${
            value === opt.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function QuestionnaireForm() {
  const router = useRouter()
  const [selectedInsurers, setSelectedInsurers] = useState<InsurerKey[]>([
    'bulstrad',
    'generali',
    'instinct',
  ])
  const [formData, setFormData] = useState<FormData>({})
  const [submitting, setSubmitting] = useState(false)

  function set(id: string, value: string) {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  function setNum(id: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [id]: value === '' ? undefined : Number(value),
    }))
  }

  function toggleInsurer(key: InsurerKey) {
    setSelectedInsurers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const total = computeTotal(formData)

  const REQUIRED = [
    'company_name',
    'eik',
    'address',
    'phone',
    'email',
    'activity',
    'property_address',
    'currency',
    'construction_type',
    'roof_type',
    'construction_year',
    'floors',
    'fire_alarm',
    'fire_extinguishers',
    'fire_station_distance',
    'alarm_system',
    'previous_claims',
  ]

  const missing = REQUIRED.filter(
    (id) => formData[id] === undefined || formData[id] === ''
  )
  const totalMissing = missing.length + (total === 0 ? 1 : 0)
  const canSubmit = selectedInsurers.length > 0 && totalMissing === 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const id = uuidv4()
      const clientName = String(formData.company_name ?? 'Нов клиент')
      const submission: StoredSubmission = {
        id,
        clientName,
        selectedInsurers,
        formData: { ...formData, val_total: total },
        createdAt: new Date().toISOString(),
      }
      const existing = JSON.parse(
        localStorage.getItem('iu_submissions') ?? '[]'
      ) as StoredSubmission[]
      localStorage.setItem('iu_submissions', JSON.stringify([submission, ...existing]))
      router.push(`/review/${id}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <h1 className="text-2xl font-bold text-white mb-1">Нов въпросник</h1>
        <p className="text-gray-500 text-sm mb-8">
          Попълнете информацията и генерирайте формулярите за застрахователите
        </p>

        {/* ── Застрахователи ─────────────────────────────────────── */}
        <div className="bg-gray-900 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Застрахователи
          </p>
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
                    selected
                      ? 'text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-gray-300'
                  }`}
                  style={
                    selected
                      ? {
                          backgroundColor: ins.color + '22',
                          borderColor: ins.color,
                        }
                      : {}
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selected ? ins.color : '#4b5563' }}
                  />
                  {ins.name}
                  <span className="text-xs opacity-50">{ins.formCode}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Фирма ──────────────────────────────────────────────── */}
        <SectionTitle>Фирма</SectionTitle>
        <div className="space-y-4">
          <Field label="Наименование" required>
            <TextInput
              value={formData.company_name}
              onChange={(v) => set('company_name', v)}
              placeholder="Фирма ЕООД / Иван Иванов"
            />
          </Field>
          <Field label="ЕИК / ЕГН" required>
            <TextInput
              value={formData.eik}
              onChange={(v) => set('eik', v)}
              placeholder="123456789"
            />
          </Field>
          <Field label="Адрес на управление" required>
            <TextInput
              value={formData.address}
              onChange={(v) => set('address', v)}
              placeholder="гр. София, ул. ..."
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Телефон" required>
              <TextInput
                value={formData.phone}
                onChange={(v) => set('phone', v)}
                placeholder="+359 88 888 8888"
              />
            </Field>
            <Field label="Ел. поща" required>
              <TextInput
                value={formData.email}
                onChange={(v) => set('email', v)}
                placeholder="office@firma.bg"
              />
            </Field>
          </div>
          <Field label="Основна дейност" required>
            <TextInput
              value={formData.activity}
              onChange={(v) => set('activity', v)}
              placeholder="Търговия / Производство / Услуги"
            />
          </Field>
        </div>

        {/* ── Застраховано имущество ─────────────────────────────── */}
        <SectionTitle>Застраховано имущество</SectionTitle>
        <div className="space-y-4">
          <Field label="Адрес на имуществото" required>
            <TextInput
              value={formData.property_address}
              onChange={(v) => set('property_address', v)}
              placeholder="гр. ..., ул. ..."
            />
          </Field>
        </div>

        {/* ── Застрахователни суми ──────────────────────────────── */}
        <SectionTitle>Застрахователни суми</SectionTitle>
        <div className="space-y-4">
          <Field label="Валута" required>
            <ToggleGroup
              options={[
                { value: 'BGN', label: 'BGN (лв.)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'USD', label: 'USD ($)' },
              ]}
              value={formData.currency}
              onChange={(v) => set('currency', v)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Сгради">
              <TextInput
                type="number"
                value={formData.val_buildings}
                onChange={(v) => setNum('val_buildings', v)}
                placeholder="0"
              />
            </Field>
            <Field label="Машини и оборудване">
              <TextInput
                type="number"
                value={formData.val_machinery}
                onChange={(v) => setNum('val_machinery', v)}
                placeholder="0"
              />
            </Field>
            <Field label="Електронно оборудване">
              <TextInput
                type="number"
                value={formData.val_electronics}
                onChange={(v) => setNum('val_electronics', v)}
                placeholder="0"
              />
            </Field>
            <Field label="Стоки и материали">
              <TextInput
                type="number"
                value={formData.val_stock}
                onChange={(v) => setNum('val_stock', v)}
                placeholder="0"
              />
            </Field>
          </div>
          <Field label="ОБЩО (изчислява се автоматично)" required>
            <TextInput
              type="number"
              value={total > 0 ? total : ''}
              placeholder="0"
              disabled
            />
          </Field>
        </div>

        {/* ── Данни за сградата ─────────────────────────────────── */}
        <SectionTitle>Данни за сградата</SectionTitle>
        <div className="space-y-4">
          <Field label="Носеща конструкция" required>
            <ToggleGroup
              options={[
                { value: 'reinforced_concrete', label: 'ЖБ' },
                { value: 'metal', label: 'Метална' },
                { value: 'brick', label: 'Тухлена' },
                { value: 'wooden', label: 'Дървена' },
                { value: 'other', label: 'Друга' },
              ]}
              value={formData.construction_type}
              onChange={(v) => set('construction_type', v)}
            />
          </Field>
          <Field label="Вид покрив" required>
            <ToggleGroup
              options={[
                { value: 'reinforced_concrete', label: 'ЖБ плоча' },
                { value: 'tiles', label: 'Керемиди' },
                { value: 'metal', label: 'Метален' },
                { value: 'other', label: 'Друг' },
              ]}
              value={formData.roof_type}
              onChange={(v) => set('roof_type', v)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Година на построяване" required>
              <TextInput
                value={formData.construction_year}
                onChange={(v) => set('construction_year', v)}
                placeholder="2005"
              />
            </Field>
            <Field label="Брой етажи" required>
              <TextInput
                value={formData.floors}
                onChange={(v) => set('floors', v)}
                placeholder="2"
              />
            </Field>
          </div>
        </div>

        {/* ── Пожарна безопасност ───────────────────────────────── */}
        <SectionTitle>Пожарна безопасност</SectionTitle>
        <div className="space-y-4">
          <Field label="Пожароизвестителна система" required>
            <ToggleGroup
              options={[
                { value: 'automatic', label: 'Автоматична' },
                { value: 'manual', label: 'Ръчна' },
                { value: 'none', label: 'Няма' },
              ]}
              value={formData.fire_alarm}
              onChange={(v) => set('fire_alarm', v)}
            />
          </Field>
          <Field label="Пожарогасители" required>
            <ToggleGroup
              options={[
                { value: 'yes', label: 'Да' },
                { value: 'no', label: 'Не' },
              ]}
              value={formData.fire_extinguishers}
              onChange={(v) => set('fire_extinguishers', v)}
            />
          </Field>
          <Field label="Разстояние до пожарна служба" required>
            <ToggleGroup
              options={[
                { value: 'lt_1', label: 'до 1 км' },
                { value: '1_3', label: '1–3 км' },
                { value: '3_5', label: '3–5 км' },
                { value: '5_10', label: '5–10 км' },
                { value: 'gt_10', label: 'над 10 км' },
              ]}
              value={formData.fire_station_distance}
              onChange={(v) => set('fire_station_distance', v)}
            />
          </Field>
        </div>

        {/* ── Охрана ────────────────────────────────────────────── */}
        <SectionTitle>Охрана</SectionTitle>
        <div className="space-y-4">
          <Field label="Алармена система / СОТ" required>
            <ToggleGroup
              options={[
                { value: 'sot', label: 'СОТ' },
                { value: 'local', label: 'Локална' },
                { value: 'none', label: 'Няма' },
              ]}
              value={formData.alarm_system}
              onChange={(v) => set('alarm_system', v)}
            />
          </Field>
        </div>

        {/* ── Щети ──────────────────────────────────────────────── */}
        <SectionTitle>Щети (последните 5 години)</SectionTitle>
        <div className="space-y-4">
          <Field label="Имало ли е щети?" required>
            <ToggleGroup
              options={[
                { value: 'yes', label: 'Да' },
                { value: 'no', label: 'Не' },
              ]}
              value={formData.previous_claims}
              onChange={(v) => set('previous_claims', v)}
            />
          </Field>
          {formData.previous_claims === 'yes' && (
            <Field label="Описание на щетите">
              <textarea
                value={String(formData.claims_details ?? '')}
                onChange={(e) => set('claims_details', e.target.value)}
                placeholder="Дата, вид, размер на щетата..."
                rows={3}
                className={inputClass + ' resize-none'}
              />
            </Field>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────── */}
        <div className="mt-12">
          {!canSubmit && totalMissing > 0 && (
            <p className="text-xs text-amber-500 text-center mb-4">
              Попълнете всички задължителни полета (*) — остават {totalMissing}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
          >
            {submitting
              ? 'Запазване...'
              : `Генерирай формуляри за ${selectedInsurers.length} застрахователя`}
          </button>
        </div>
      </div>
    </div>
  )
}
