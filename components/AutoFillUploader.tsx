'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

export interface AutoFillResult {
  extracted: Record<string, string | null>
}

interface Props {
  onFill: (data: Record<string, string | null>) => void
  className?: string
}

type Status = 'idle' | 'dragging' | 'uploading' | 'done' | 'error'

export default function AutoFillUploader({ onFill, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [filledCount, setFilledCount] = useState(0)

  async function processFile(file: File) {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setErrorMsg('Неподдържан формат. Моля качете PDF, DOCX или изображение.')
      setStatus('error')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Файлът е прекалено голям (макс. 10 MB).')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/auto-fill', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Неизвестна грешка')
        setStatus('error')
        return
      }

      const extracted: Record<string, string | null> = json.extracted ?? {}
      const count = Object.values(extracted).filter((v) => v !== null && v !== '').length
      setFilledCount(count)
      setStatus('done')
      onFill(extracted)
    } catch {
      setErrorMsg('Мрежова грешка при качване.')
      setStatus('error')
    }
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setStatus('idle')
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function reset() {
    setStatus('idle')
    setErrorMsg('')
    setFilledCount(0)
  }

  return (
    <div className={className}>
      {status === 'uploading' ? (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <svg className="h-4 w-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>AI анализира документа…</span>
        </div>
      ) : status === 'done' ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              <span className="font-semibold">{filledCount} полета</span> попълнени от документа
            </span>
          </div>
          <button onClick={reset} className="text-emerald-600 hover:text-emerald-800 transition-colors text-xs underline">
            Нов документ
          </button>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
          <button onClick={reset} className="text-red-600 hover:text-red-800 transition-colors text-xs underline">
            Опитай пак
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setStatus('dragging') }}
          onDragLeave={() => setStatus('idle')}
          onDrop={handleDrop}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3 text-sm transition-colors ${
            status === 'dragging'
              ? 'border-blue-400 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span>
            <span className="font-medium">📄 Качи документ за auto-fill</span>
            <span className="ml-1 text-xs text-gray-400">(PDF, DOCX, изображение — макс. 10 MB)</span>
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.webp,.gif"
            className="sr-only"
            onChange={handleChange}
          />
        </label>
      )}
    </div>
  )
}
