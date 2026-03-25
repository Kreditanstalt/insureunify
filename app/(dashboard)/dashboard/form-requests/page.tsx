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

const CLASS_OPTIONS = [
  'Имущество',
  'ОГО',
  'Трудова злополука',
  'Професионална отговорност',
  'Търговски кредит',
  'Карго',
  'Здравна',
  'Нов клас (моля опишете в бележките)',
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
  const [insuranceClass, setInsuranceClass] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!insurerName || !insuranceClass || !selectedFile) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const fd = new FormData()
      fd.append('insurer_name', insurerName)
      fd.append('insurance_class', insuranceClass)
      fd.append('notes', notes)
      fd.append('broker_name', brokerName)
      fd.append('broker_email', brokerEmail)
      fd.append('file', selectedFile)

      const res = await fetch('/api/form-requests', { method: 'POST', body: fd })
      const data = await res.json()

      if (data.ok) {
        setSuccess(true)
        setInsurerName('')
        setInsuranceClass('')
        setNotes('')
        setSelectedFile(null)
        if (fileRef.current) fileRef.current.value = ''
        fetchRequests()
      } else {
        setError(data.error || 'Грешка при изпращане')
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
          {/* Insurer */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Застраховател <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={insurerName}
              onChange={(e) => setInsurerName(e.target.value)}
              placeholder="напр. Булстрад, Алианц..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Insurance Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Клас застраховка <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={insuranceClass}
              onChange={(e) => setInsuranceClass(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Изберете клас...</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Бележки</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="допълнителна информация..."
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Формуляр <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              required
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-1.5 text-xs text-gray-500">
                {selectedFile.name} — {formatFileSize(selectedFile.size)}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !insurerName || !insuranceClass || !selectedFile}
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
