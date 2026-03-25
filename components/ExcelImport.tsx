'use client'

import { useRef, useState } from 'react'
import { useToast } from './ToastProvider'

interface Props {
  onImported?: (count: number) => void
}

export default function ExcelImport({ onImported }: Props) {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  async function handleFile(file: File) {
    setUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/clients/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.ok) {
        setResult({ imported: data.imported, skipped: data.skipped, total: data.total })
        toast.success(`${data.imported} клиенти импортирани успешно`)
        onImported?.(data.imported)
      } else {
        toast.error(data.error ?? 'Грешка при импорт')
      }
    } catch {
      toast.error('Грешка при качване')
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {result ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span><span className="font-semibold">{result.imported}</span> от {result.total} клиенти импортирани</span>
            {result.skipped > 0 && <span className="text-emerald-600">({result.skipped} пропуснати — без име)</span>}
          </div>
          <button onClick={() => setResult(null)} className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 underline">Импортирай още</button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Импортиране...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div>
                <span className="font-medium">Импорт от Excel</span>
                <span className="block text-xs text-gray-400">.xlsx, .xls, .csv — колони: Наименование, ЕИК, Адрес, Телефон, Имейл</span>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  )
}
