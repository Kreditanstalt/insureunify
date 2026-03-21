'use client'

import { useState } from 'react'
import type { InsurerKey } from '@/lib/schema'
import { INSURERS } from '@/lib/schema'
import type { InsurerMappedData } from '@/lib/mappings'

interface Props {
  insurerKey: InsurerKey
  mappedData: InsurerMappedData
  clientName: string
}

export function DownloadPDFButton({ insurerKey, mappedData, clientName }: Props) {
  const [loading, setLoading] = useState(false)
  const insurer = INSURERS[insurerKey]

  async function handleDownload() {
    if (loading) return
    setLoading(true)
    try {
      // Dynamic import avoids SSR issues with @react-pdf/renderer
      const [{ pdf }, React, { InsurerDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('react'),
        import('./pdf/InsurerPDF'),
      ])

      const element = React.default.createElement(InsurerDocument, {
        insurerKey,
        mappedData,
        clientName,
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(element as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${clientName.replace(/\s+/g, '_')}_${insurer.name}_${insurer.formCode}.pdf`
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

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <>
          <svg
            className="w-3 h-3 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Генериране…
        </>
      ) : (
        <>
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Изтегли PDF
        </>
      )}
    </button>
  )
}
