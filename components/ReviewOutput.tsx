'use client'

import { INSURERS, InsurerKey, MASTER_SCHEMA } from '@/lib/schema'
import { InsurerMappedData } from '@/lib/mappings'

interface Props {
  mappedData: Record<InsurerKey, InsurerMappedData>
  selectedInsurers: InsurerKey[]
  clientName: string
}

export default function ReviewOutput({ mappedData, selectedInsurers, clientName }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400">
        Преглед на генерираните данни за <span className="text-white font-medium">{clientName}</span>
      </div>

      {selectedInsurers.map((key) => {
        const insurer = INSURERS[key]
        const data = mappedData[key] ?? {}
        const fieldCount = Object.keys(data).length

        return (
          <div key={key} className="rounded-xl border border-gray-700 overflow-hidden">
            {/* Header */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ backgroundColor: insurer.color + '22', borderBottom: `2px solid ${insurer.color}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: insurer.color }}
                >
                  {insurer.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{insurer.name}</div>
                  <div className="text-xs text-gray-400">{insurer.formCode}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400">{fieldCount} полета</div>
            </div>

            {/* Fields grouped by section */}
            <div className="divide-y divide-gray-800">
              {MASTER_SCHEMA.map((section) => {
                const sectionFields = section.fields.filter((f) => data[f.id])
                if (sectionFields.length === 0) return null

                return (
                  <div key={section.id} className="px-5 py-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {section.icon} {section.label}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sectionFields.map((field) => {
                        const mapped = data[field.id]
                        if (!mapped) return null
                        return (
                          <div key={field.id} className="bg-gray-800/50 rounded-lg px-3 py-2.5">
                            <div className="text-xs text-gray-500 mb-0.5">{mapped.originalLabel}</div>
                            <div className="text-sm text-white font-medium">{mapped.displayValue}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-900/50 flex justify-end">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-colors"
                onClick={() => alert('PDF генерирането ще бъде имплементирано с @react-pdf/renderer')}
              >
                Изтегли PDF →
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
