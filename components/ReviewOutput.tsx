'use client'

import Image from 'next/image'
import { INSURERS, InsurerKey, MASTER_SCHEMA, FormData } from '@/lib/schema'
import { GL_SCHEMA, GL_INSURERS, GLInsurerKey, GLFormData } from '@/lib/gl-schema'
import { OA_SCHEMA, OA_INSURERS, OAInsurerKey, OAFormData } from '@/lib/oa-schema'
import { InsurerMappedData } from '@/lib/mappings'
import { GLInsurerMappedData } from '@/lib/gl-mappings'
import { OAInsurerMappedData } from '@/lib/oa-mappings'
import { PL_SCHEMA } from '@/lib/pl-schema'
import type { PLFormData } from '@/lib/pl-schema'
import type { PLInsurerMappedData } from '@/lib/pl-mappings'
import { DownloadPDFButton } from './DownloadPDFButton'

// ─── Property insurance review ────────────────────────────────────────────────

interface PropertyProps {
  mappedData:       Record<InsurerKey, InsurerMappedData>
  selectedInsurers: InsurerKey[]
  clientName:       string
  formData:         FormData
  insuranceClass?:  'property'
}

// ─── GL review ────────────────────────────────────────────────────────────────

interface GLProps {
  mappedData:       Record<GLInsurerKey, GLInsurerMappedData>
  selectedInsurers: GLInsurerKey[]
  clientName:       string
  formData:         GLFormData
  insuranceClass:   'general_liability'
}

// ─── OA review ────────────────────────────────────────────────────────────────

interface OAProps {
  mappedData:       Record<OAInsurerKey, OAInsurerMappedData>
  selectedInsurers: OAInsurerKey[]
  clientName:       string
  formData:         OAFormData
  insuranceClass:   'occupational_accident'
}

// ─── PL review ────────────────────────────────────────────────────────────────

interface PLProps {
  mappedData:       Record<InsurerKey, InsurerMappedData | PLInsurerMappedData>
  selectedInsurers: InsurerKey[]
  clientName:       string
  formData:         PLFormData
  insuranceClass:   'professional_liability'
}

type Props = PropertyProps | GLProps | OAProps | PLProps

// ─── Shared insurer card header ───────────────────────────────────────────────

function InsurerHeader({
  color, logo, name, formCode, fieldCount, downloadButton,
}: {
  color:          string
  logo?:          string
  name:           string
  formCode:       string
  fieldCount:     number
  downloadButton: React.ReactNode
}) {
  return (
    <div
      className="px-5 py-4 flex items-center justify-between"
      style={{ backgroundColor: color + '10', borderBottom: `2px solid ${color}` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: color + '15', border: `1px solid ${color}40` }}
        >
          {logo ? (
            <Image src={logo} alt={name} width={48} height={40} className="object-contain w-full h-full" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: color }}>
              {name[0]}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{formCode}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400">{fieldCount} полета</span>
        {downloadButton}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReviewOutput({ mappedData, selectedInsurers, clientName, formData, insuranceClass = 'property' }: Props) {
  const isGL = insuranceClass === 'general_liability'
  const isOA = insuranceClass === 'occupational_accident'
  const isPL = insuranceClass === 'professional_liability'

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        Преглед на генерираните данни за{' '}
        <span className="text-gray-900 font-medium">{clientName}</span>
        {isPL && (
          <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
            Професионална отговорност
          </span>
        )}
      </div>

      {(selectedInsurers as string[]).map((key) => {
        const insurer = isOA
          ? OA_INSURERS[key as OAInsurerKey]
          : isGL
            ? GL_INSURERS[key as GLInsurerKey]
            : INSURERS[key as InsurerKey]
        const data     = (mappedData as Record<string, unknown>)[key] as Record<string, { originalLabel: string; displayValue: string }> ?? {}
        const schema   = isOA ? OA_SCHEMA : isGL ? GL_SCHEMA : isPL ? PL_SCHEMA : MASTER_SCHEMA
        const fieldCount = Object.keys(data).length

        return (
          <div key={key} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <InsurerHeader
              color={insurer.color}
              logo={insurer.logo}
              name={insurer.name}
              formCode={insurer.formCode}
              fieldCount={fieldCount}
              downloadButton={
                isOA ? (
                  <DownloadPDFButton
                    insurerKey={key as OAInsurerKey}
                    formData={formData as OAFormData}
                    clientName={clientName}
                    insuranceClass="occupational_accident"
                  />
                ) : isGL ? (
                  <DownloadPDFButton
                    insurerKey={key as GLInsurerKey}
                    formData={formData as GLFormData}
                    clientName={clientName}
                    insuranceClass="general_liability"
                  />
                ) : isPL ? (
                  <DownloadPDFButton
                    insurerKey={key as InsurerKey}
                    formData={formData as PLFormData}
                    clientName={clientName}
                    insuranceClass="professional_liability"
                  />
                ) : (
                  <DownloadPDFButton
                    insurerKey={key as InsurerKey}
                    formData={formData as FormData}
                    clientName={clientName}
                  />
                )
              }
            />

            {/* Fields grouped by section */}
            <div className="divide-y divide-gray-100">
              {schema.map((section) => {
                const sectionFields = section.fields.filter((f) => data[f.id])
                if (sectionFields.length === 0) return null
                return (
                  <div key={section.id} className="px-5 py-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {section.label}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sectionFields.map((field) => {
                        const mapped = data[field.id]
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
