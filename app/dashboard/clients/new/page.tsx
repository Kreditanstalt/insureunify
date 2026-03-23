'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertClient } from '@/lib/clients'

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({ company_name: '', eik: '', phone: '', email: '', address: '', activity: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company_name.trim()) { setError('Въведете наименование на фирмата'); return }
    setSaving(true)
    const client = upsertClient({
      company_name: form.company_name.trim(),
      eik:      form.eik.trim() || undefined,
      phone:    form.phone.trim() || undefined,
      email:    form.email.trim() || undefined,
      address:  form.address.trim() || undefined,
      activity: form.activity.trim() || undefined,
    })
    router.push(`/dashboard/clients/${client.id}`)
  }

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-shadow'

  return (
    <div className="px-6 py-8 max-w-xl mx-auto">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-400">
        <button onClick={() => router.push('/dashboard/clients')} className="hover:text-gray-700 transition-colors">
          Клиенти
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Нов клиент</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Нов клиент</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Наименование <span className="text-red-500">*</span>
          </label>
          <input
            autoFocus
            required
            value={form.company_name}
            onChange={(e) => set('company_name', e.target.value)}
            placeholder="Примерна Фирма ЕООД"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ЕИК</label>
            <input value={form.eik} onChange={(e) => set('eik', e.target.value)}
              placeholder="123456789" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Телефон</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="+359 88 888 8888" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Ел. поща</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
            placeholder="office@example.com" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Адрес</label>
          <input value={form.address} onChange={(e) => set('address', e.target.value)}
            placeholder="гр. София, бул. Витоша 1" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Основна дейност</label>
          <input value={form.activity} onChange={(e) => set('activity', e.target.value)}
            placeholder="Търговия с хранителни стоки" className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Отказ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Запазване…' : 'Запази клиента'}
          </button>
        </div>
      </form>
    </div>
  )
}
