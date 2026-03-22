'use client'

import { useState } from 'react'
import type { InsurerKey, FormData } from '@/lib/schema'
import { INSURERS } from '@/lib/schema'
import type { PLFormData } from '@/lib/pl-schema'

interface Props {
  insurerKey: InsurerKey
  formData: FormData | PLFormData
  clientName: string
  insuranceClass?: string   // 'property' (default) | 'professional_liability'
}

const PROPERTY_FILE_NAMES: Partial<Record<InsurerKey, (c: string) => string>> = {
  bulstrad: (c) => `Bulstrad_Imushestvo_${c}.pdf`,
  generali: (c) => `Generali_IMSB_${c}.pdf`,
  instinct: (c) => `Instinct_AllRisks_${c}.pdf`,
}

const PL_FILE_NAMES: Partial<Record<InsurerKey, (c: string) => string>> = {
  axiom:    (c) => `Axiom_PO_${c}.pdf`,
  bulstrad: (c) => `Bulstrad_PO_${c}.pdf`,
  euroins:  (c) => `Euroins_PO_${c}.pdf`,
}

export function DownloadPDFButton({ insurerKey, formData, clientName, insuranceClass = 'property' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const React = (await import('react')).default

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let element: any

      if (insuranceClass === 'professional_liability') {
        const plData = formData as PLFormData
        if (insurerKey === 'axiom') {
          const { AxiomPLPDF } = await import('./pdf/AxiomPLPDF')
          element = React.createElement(AxiomPLPDF, { formData: plData, clientName })
        } else if (insurerKey === 'bulstrad') {
          const { BulstradPLPDF } = await import('./pdf/BulstradPLPDF')
          element = React.createElement(BulstradPLPDF, { formData: plData, clientName })
        } else if (insurerKey === 'euroins') {
          const { EuroinsPLPDF } = await import('./pdf/EuroinsPLPDF')
          element = React.createElement(EuroinsPLPDF, { formData: plData, clientName })
        } else {
          alert(`PDF за ${INSURERS[insurerKey].name} (ПО) не е наличен.`)
          setLoading(false)
          return
        }
      } else {
        // Property insurance (default)
        const propData = formData as FormData
        if (insurerKey === 'bulstrad') {
          const { BulstradPDF } = await import('./pdf/BulstradPDF')
          element = React.createElement(BulstradPDF, { formData: propData, clientName })
        } else if (insurerKey === 'generali') {
          const { GeneraliPDF } = await import('./pdf/GeneraliPDF')
          element = React.createElement(GeneraliPDF, { formData: propData, clientName })
        } else {
          const { InstinctPDF } = await import('./pdf/InstinctPDF')
          element = React.createElement(InstinctPDF, { formData: propData, clientName })
        }
      }

      const blob = await pdf(element).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fileNames = insuranceClass === 'professional_liability' ? PL_FILE_NAMES : PROPERTY_FILE_NAMES
      a.download = (fileNames[insurerKey] ?? ((c: string) => `${insurerKey}_${c}.pdf`))(clientName.replace(/\s+/g, '_'))
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('Грешка при генериране на PDF. Моля, опитайте отново.')
    } finally {
      setLoading(false)
    }
  }

  const color = INSURERS[insurerKey].color

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      style={{ borderColor: loading ? undefined : color + '66' }}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Генериране…
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Изтегли PDF
        </>
      )}
    </button>
  )
}
