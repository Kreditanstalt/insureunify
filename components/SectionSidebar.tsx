'use client'

import { MASTER_SCHEMA, FormData, SchemaSection } from '@/lib/schema'

interface Props {
  currentIndex: number
  formData: FormData
  onNavigate: (index: number) => void
}

function sectionProgress(section: SchemaSection, formData: FormData): number {
  const required = section.fields.filter((f) => f.required)
  if (required.length === 0) {
    const filled = section.fields.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
    return section.fields.length > 0 ? Math.round((filled / section.fields.length) * 100) : 0
  }
  const filled = required.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
  return Math.round((filled / required.length) * 100)
}

function overallProgress(formData: FormData): number {
  const allRequired = MASTER_SCHEMA.flatMap((s) => s.fields.filter((f) => f.required))
  if (allRequired.length === 0) return 0
  const filled = allRequired.filter((f) => formData[f.id] !== undefined && formData[f.id] !== '').length
  return Math.round((filled / allRequired.length) * 100)
}

export default function SectionSidebar({ currentIndex, formData, onNavigate }: Props) {
  const overall = overallProgress(formData)

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-1">
      {/* Overall progress */}
      <div className="mb-4 px-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Общ напредък</span>
          <span>{overall}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${overall}%` }}
          />
        </div>
      </div>

      {MASTER_SCHEMA.map((section, index) => {
        const progress = sectionProgress(section, formData)
        const isCurrent = index === currentIndex
        const isCompleted = progress === 100

        return (
          <button
            key={section.id}
            onClick={() => onNavigate(index)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
              isCurrent
                ? 'bg-blue-600/20 text-blue-300 border border-blue-600/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {/* Status indicator */}
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
              {isCompleted ? (
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : isCurrent ? (
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{section.shortLabel}</div>
              {progress > 0 && progress < 100 && (
                <div className="h-0.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </aside>
  )
}
