'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'

interface FormRequest {
  id: string
  created_at: string
  broker_name: string | null
  broker_email: string | null
  insurer_name: string
  insurance_class: string
  notes: string | null
  file_name: string | null
  file_url: string | null
  status: 'pending' | 'in_progress' | 'done'
  estimated_days: number
}

const INSURER_OPTIONS = [
  'Булстрад', 'Дженерали', 'Инстинкт', 'ОЗК', 'Алианц', 'Групама',
  'Аксиом', 'Евроинс', 'Атрадиус', 'Алианц Трейд', 'ДЗИ', 'Армеец',
  'Уника', 'Колонад', 'Лев Инс',
]

const CLASS_OPTIONS = [
  { value: 'Имущество', label: 'Имущество', icon: '🏢' },
  { value: 'ОГО', label: 'ОГО / Работодател', icon: '🛡️' },
  { value: 'Трудова злополука', label: 'Трудова злополука', icon: '⚡' },
  { value: 'Професионална отговорност', label: 'Проф. отговорност', icon: '⚖️' },
  { value: 'Търговски кредит', label: 'Търговски кредит', icon: '💳' },
  { value: 'Карго', label: 'Карго', icon: '📦' },
  { value: 'Здравна', label: 'Здравна', icon: '❤️' },
  { value: 'Друг', label: 'Друг клас', icon: '📋' },
]

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  pending:     { label: 'В обработка', classes: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'В процес',   classes: 'bg-blue-100 text-blue-800' },
  done:        { label: 'Готово ✓',    classes: 'bg-green-100 text-green-800' },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FormRequestsPage() {
  const [requests, setRequests] = useState<FormRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [insurerName, setInsurerName] = useState('')
  const [insurerCustom, setInsurerCustom] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  const { profile: authProfile } = useAuth()
  const brokerName = authProfile?.company_name ?? ''
  const brokerEmail = authProfile?.email ?? ''

  useEffect(() => {
    fetchRequests()
  }, [])

  async function fetchRequests() {
    try {
      const res = await fetch('/api/form-requests')
      const data = await res.json()
      setRequests(data.requests ?? [])
    } catch { /* ignore */ }
  }

  function toggleClass(cls: string) {
    setSelectedClasses((prev) => {
      const next = new Set(prev)
      if (next.has(cls)) next.delete(cls); else next.add(cls)
      return next
    })
  }

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase()
      return ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'].includes(ext ?? '')
    })
    setSelectedFiles((prev) => [...prev, ...arr])
  }

  function removeFile(idx: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const effectiveInsurer = insurerName === '__custom' ? insurerCustom : insurerName

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!effectiveInsurer || selectedClasses.size === 0 || selectedFiles.length === 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const classStr = Array.from(selectedClasses).join(', ')
      // Submit one request per file
      let okCount = 0
      for (const file of selectedFiles) {
        const fd = new FormData()
        fd.append('insurer_name', effectiveInsurer)
        fd.append('insurance_class', classStr)
        fd.append('notes', notes)
        fd.append('broker_name', brokerName)
        fd.append('broker_email', brokerEmail)
        fd.append('file', file)
        const res = await fetch('/api/form-requests', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.ok) okCount++
      }

      if (okCount > 0) {
        setSuccess(true)
        setInsurerName('')
        setInsurerCustom('')
        setSelectedClasses(new Set())
        setNotes('')
        setSelectedFiles([])
        if (fileRef.current) fileRef.current.value = ''
        fetchRequests()
      } else {
        setError('Грешка при изпращане')
      }
    } catch {
      setError('Грешка при връзката със сървъра')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* ── Section 1: Submit Form ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Добави нов формуляр</h2>
        <p className="mt-1 text-sm text-gray-500">
          Качи формуляр от застраховател който още не е в системата.
          Ще го прегледаме и добавим в рамките на 5 работни дни.
        </p>

        {success && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            Заявката е изпратена успешно! Ще се свържем с вас до 5 работни дни.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Insurer — dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Застраховател <span className="text-red-500">*</span>
            </label>
            <select
              value={insurerName}
              onChange={(e) => setInsurerName(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">Изберете застраховател...</option>
              {INSURER_OPTIONS.map((ins) => (
                <option key={ins} value={ins}>{ins}</option>
              ))}
              <option value="__custom">Друг...</option>
            </select>
            {insurerName === '__custom' && (
              <input
                type="text"
                value={insurerCustom}
                onChange={(e) => setInsurerCustom(e.target.value)}
                placeholder="Въведете име на застраховател..."
                className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            )}
          </div>

          {/* Insurance Classes — multi-select chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Клас застраховка <span className="text-red-500">*</span>
              {selectedClasses.size > 0 && <span className="text-xs text-gray-400 font-normal ml-1">({selectedClasses.size} избрани)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {CLASS_OPTIONS.map((cls) => {
                const selected = selectedClasses.has(cls.value)
                return (
                  <button
                    key={cls.value}
                    type="button"
                    onClick={() => toggleClass(cls.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cls.icon}</span>
                    <span>{cls.label}</span>
                    {selected && (
                      <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Бележки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="допълнителна информация..."
              rows={2}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* File Upload — drag & drop + multiple */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Формуляри <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
              onClick={() => fileRef.current?.click()}
              className={`rounded-xl border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-600 font-medium">Плъзнете файлове тук или кликнете</p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, изображения — може повече от един файл</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
              className="hidden"
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs">
                    <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="flex-1 text-gray-700 truncate">{f.name}</span>
                    <span className="text-gray-400">{formatFileSize(f.size)}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !effectiveInsurer || selectedClasses.size === 0 || selectedFiles.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Изпрати заявка
          </button>
        </form>
      </div>

      {/* ── Section 2: Existing Requests ── */}
      {requests.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Моите заявки</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2">Дата</th>
                  <th className="px-3 py-2">Застраховател</th>
                  <th className="px-3 py-2">Клас</th>
                  <th className="px-3 py-2">Файл</th>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2">Бележки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => {
                  const badge = STATUS_BADGES[r.status] ?? STATUS_BADGES.pending
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                        {new Date(r.created_at).toLocaleDateString('bg-BG')}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900">{r.insurer_name}</td>
                      <td className="px-3 py-2.5 text-gray-600">{r.insurance_class}</td>
                      <td className="px-3 py-2.5">
                        {r.file_name ? (
                          <span className="text-gray-600">{r.file_name}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-gray-500">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
