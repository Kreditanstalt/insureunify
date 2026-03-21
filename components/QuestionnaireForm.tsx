'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { INSURERS, MASTER_SCHEMA, VALUE_FIELDS, FormData, InsurerKey, SchemaField } from '@/lib/schema'

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

// ─── Primitive components ────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-10 mb-5 pb-2 border-b border-gray-200">
      {children}
    </h2>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm'

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
      className={inputClass + (disabled ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
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
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[]
  value: string | number | undefined
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass + ' cursor-pointer'}
    >
      <option value="" disabled>
        {placeholder ?? '— изберете —'}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// Conditional visibility rules (field id → { depends on field + value })
const CONDITIONAL: Record<string, { field: string; value: string }> = {
  claims_details: { field: 'previous_claims', value: 'yes' },
  hazardous_desc: { field: 'hazardous_materials', value: 'yes' },
  deductible_details: { field: 'custom_deductible', value: 'yes' },
}

// ─── Schema-driven field renderer ────────────────────────────────────────────

function renderFieldInput(
  field: SchemaField,
  formData: FormData,
  set: (id: string, v: string) => void,
  setNum: (id: string, v: string) => void,
  total: number
) {
  if (field.computed) {
    return (
      <TextInput
        type="number"
        value={total > 0 ? total : ''}
        placeholder="0"
        disabled
      />
    )
  }

  if (field.type === 'select' && field.options) {
    // Use toggle buttons for ≤4 options, native select for ≥5
    if (field.options.length <= 4) {
      return (
        <ToggleGroup
          options={field.options}
          value={formData[field.id]}
          onChange={(v) => set(field.id, v)}
        />
      )
    }
    return (
      <SelectInput
        options={field.options}
        value={formData[field.id]}
        onChange={(v) => set(field.id, v)}
      />
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
      <TextInput
        type="number"
        value={formData[field.id]}
        onChange={(v) => setNum(field.id, v)}
        placeholder={field.placeholder ?? '0'}
      />
    )
  }

  if (field.type === 'date') {
    return (
      <TextInput
        type="date"
        value={formData[field.id]}
        onChange={(v) => set(field.id, v)}
      />
    )
  }

  // text
  return (
    <TextInput
      value={formData[field.id]}
      onChange={(v) => set(field.id, v)}
      placeholder={field.placeholder}
    />
  )
}

// Number fields that should pair side-by-side in a 2-col grid
const NUM_GRID_SECTION = 'property_values'

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

  const REQUIRED_IDS = MASTER_SCHEMA.flatMap((s) =>
    s.fields.filter((f) => f.required && !f.computed).map((f) => f.id)
  )

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
        id,
        clientName,
        selectedInsurers,
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
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </a>
          <span className="text-sm font-medium text-gray-700">Нов въпросник</span>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Нов въпросник</h1>
        <p className="text-gray-500 text-sm mb-8">
          Попълнете информацията и генерирайте формулярите за застрахователите
        </p>

        {/* Insurer selector */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
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
                    selected ? '' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                  style={selected ? { backgroundColor: ins.color + '18', borderColor: ins.color, color: ins.color } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selected ? ins.color : '#d1d5db' }}
                  />
                  <span style={selected ? { color: ins.color } : {}}>{ins.name}</span>
                  <span className="text-xs opacity-50">{ins.formCode}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Schema-driven sections */}
        {MASTER_SCHEMA.map((section) => {
          // Collect visible fields for this section
          const visibleFields = section.fields.filter((field) => {
            const cond = CONDITIONAL[field.id]
            if (cond) return formData[cond.field] === cond.value
            return true
          })

          // For the property_values section, group consecutive number fields into a grid
          if (section.id === NUM_GRID_SECTION) {
            const groups: Array<{ type: 'grid'; fields: SchemaField[] } | { type: 'single'; field: SchemaField }> = []
            let i = 0
            while (i < visibleFields.length) {
              const field = visibleFields[i]
              if (field.type === 'number' && !field.computed) {
                const pair: SchemaField[] = [field]
                if (i + 1 < visibleFields.length && visibleFields[i + 1].type === 'number' && !visibleFields[i + 1].computed) {
                  pair.push(visibleFields[i + 1])
                  i += 2
                } else {
                  i++
                }
                groups.push({ type: 'grid', fields: pair })
              } else {
                groups.push({ type: 'single', field })
                i++
              }
            }

            return (
              <div key={section.id}>
                <SectionTitle>{section.label}</SectionTitle>
                <div className="space-y-4">
                  {groups.map((g, gi) => {
                    if (g.type === 'grid') {
                      return (
                        <div key={gi} className={`grid gap-4 ${g.fields.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {g.fields.map((field) => (
                            <Field key={field.id} label={field.label} required={field.required}>
                              {renderFieldInput(field, formData, set, setNum, total)}
                            </Field>
                          ))}
                        </div>
                      )
                    }
                    return (
                      <Field key={g.field.id} label={g.field.label} required={g.field.required}>
                        {renderFieldInput(g.field, formData, set, setNum, total)}
                      </Field>
                    )
                  })}
                </div>
              </div>
            )
          }

          return (
            <div key={section.id}>
              <SectionTitle>{section.label}</SectionTitle>
              <div className="space-y-4">
                {visibleFields.map((field) => (
                  <Field key={field.id} label={field.label} required={field.required}>
                    {renderFieldInput(field, formData, set, setNum, total)}
                  </Field>
                ))}
              </div>
            </div>
          )
        })}

        {/* Submit */}
        <div className="mt-12">
          {!canSubmit && totalMissing > 0 && (
            <p className="text-xs text-amber-600 text-center mb-4">
              Попълнете всички задължителни полета (*) — остават {totalMissing}
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors shadow-sm shadow-blue-200"
          >
            {submitting
              ? 'Запазване…'
              : `Генерирай формуляри за ${selectedInsurers.length} застрахователя`}
          </button>
        </div>
      </div>
    </div>
  )
}
