'use client'

import { INSURERS, InsurerKey, MASTER_SCHEMA, FormData } from '@/lib/schema'
import { InsurerMappedData } from '@/lib/mappings'
import { PL_SCHEMA } from '@/lib/pl-schema'
import type { PLFormData } from '@/lib/pl-schema'
import type { PLInsurerMappedData } from '@/lib/pl-mappings'
import { DownloadPDFButton } from './DownloadPDFButton'

interface Props {
  mappedData: Record<InsurerKey, InsurerMappedData | PLInsurerMappedData>
  selectedInsurers: InsurerKey[]
  clientName: string
  formData: FormData | PLFormData
  insuranceClass?: string   // 'property' (default) | 'professional_liability'
}

export default function ReviewOutput({
  mappedData, selectedInsurers, clientName, formData, insuranceClass = 'property',
}: Props) {
  const schema = insuranceClass === 'professional_liability' ? PL_SCHEMA : MASTER_SCHEMA

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        Преглед на генерираните данни за{' '}
        <span className="text-gray-900 font-medium">{clientName}</span>
        {insuranceClass === 'professional_liability' && (
          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            Професионална отговорност
          </span>
        )}
      </div>

      {selectedInsurers.map((key) => {
        const insurer = INSURERS[key]
        const data = mappedData[key] ?? {}
        const fieldCount = Object.keys(data).length

        return (
          <div key={key} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: insurer.color + '10', borderBottom: `2px solid ${insurer.color}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: insurer.color }}
                >
                  {insurer.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{insurer.name}</div>
                  <div className="text-xs text-gray-500">{insurer.formCode}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{fieldCount} полета</span>
                <DownloadPDFButton
                  insurerKey={key}
                  formData={formData}
                  clientName={clientName}
                  insuranceClass={insuranceClass}
                />
              </div>
            </div>

            {/* Fields grouped by section */}
            <div className="divide-y divide-gray-100">
              {schema.map((section) => {
                const sectionFields = section.fields.filter((f) => (data as Record<string, { originalLabel: string; displayValue: string }>)[f.id])
                if (sectionFields.length === 0) return null

                return (
                  <div key={section.id} className="px-5 py-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {section.label}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sectionFields.map((field) => {
                        const mapped = (data as Record<string, { originalLabel: string; displayValue: string }>)[field.id]
                        if (!mapped) return null
                        return (
                          <div key={field.id} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                            <div className="text-xs text-gray-400 mb-0.5">{mapped.originalLabel}</div>
                            <div className="text-sm text-gray-900 font-medium">{mapped.displayValue}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
