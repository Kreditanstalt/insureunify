'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { MASTER_SCHEMA, FormData, InsurerKey } from '@/lib/schema'
import InsurerSelector from './InsurerSelector'
import SectionSidebar from './SectionSidebar'
import FieldRenderer from './FieldRenderer'

const TOTAL_STEPS = MASTER_SCHEMA.length + 1 // +1 for insurer selection

interface StoredSubmission {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  formData: FormData
  createdAt: string
}

export default function QuestionnaireForm() {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = insurer select, 1..9 = sections
  const [selectedInsurers, setSelectedInsurers] = useState<InsurerKey[]>(['bulstrad', 'generali', 'instinct'])
  const [formData, setFormData] = useState<FormData>({})
  const [submitting, setSubmitting] = useState(false)

  const sectionIndex = step - 1 // -1 when on insurer select step
  const currentSection = sectionIndex >= 0 ? MASTER_SCHEMA[sectionIndex] : null
  const isLastSection = sectionIndex === MASTER_SCHEMA.length - 1

  function handleFieldChange(fieldId: string, value: string) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  function canProceed(): boolean {
    if (step === 0) return selectedInsurers.length > 0
    if (!currentSection) return false
    return currentSection.fields
      .filter((f) => f.required)
      .every((f) => formData[f.id] !== undefined && formData[f.id] !== '')
  }

  function handleNext() {
    if (!canProceed()) return
    if (isLastSection) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handlePrev() {
    setStep((s) => Math.max(0, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const id = uuidv4()
      const clientName = String(formData.company_name ?? 'Нов клиент')

      const submission: StoredSubmission = {
        id,
        clientName,
        selectedInsurers,
        formData,
        createdAt: new Date().toISOString(),
      }

      // Persist to localStorage (Supabase persistence happens in /api/submissions)
      const existing = JSON.parse(localStorage.getItem('iu_submissions') ?? '[]') as StoredSubmission[]
      localStorage.setItem('iu_submissions', JSON.stringify([submission, ...existing]))

      router.push(`/review/${id}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {step > 0 && (
            <SectionSidebar
              currentIndex={sectionIndex}
              formData={formData}
              onNavigate={(idx) => setStep(idx + 1)}
            />
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Step 0: Insurer selection */}
            {step === 0 && (
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Нов въпросник</h1>
                <p className="text-gray-400 mb-8">Стъпка 1 от {TOTAL_STEPS}: Избор на застрахователи</p>
                <InsurerSelector selected={selectedInsurers} onChange={setSelectedInsurers} />
              </div>
            )}

            {/* Steps 1-9: Sections */}
            {currentSection && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">{currentSection.icon}</span>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">
                      Стъпка {step} от {TOTAL_STEPS}
                    </div>
                    <h2 className="text-xl font-bold text-white">{currentSection.label}</h2>
                  </div>
                </div>

                <div className="space-y-5">
                  {currentSection.fields.map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      value={formData[field.id]}
                      selectedInsurers={selectedInsurers}
                      onChange={(val) => handleFieldChange(field.id, val)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
              >
                ← Назад
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {step} / {TOTAL_STEPS}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                >
                  {submitting ? (
                    'Запазване...'
                  ) : isLastSection ? (
                    'Изпрати →'
                  ) : (
                    'Напред →'
                  )}
                </button>
              </div>
            </div>

            {/* Required fields hint */}
            {currentSection && !canProceed() && (
              <p className="text-xs text-amber-500 mt-3 text-center">
                Попълнете всички задължителни полета (*)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
