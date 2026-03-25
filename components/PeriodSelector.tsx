'use client'

import { useState, useRef, useEffect } from 'react'
import { fmtDateBG } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const DURATIONS = [
  { label: '6 месеца', months: 6 },
  { label: '1 година',  months: 12 },
  { label: '2 години',  months: 24 },
  { label: 'Друг',     months: 0 },
]

const inputClass =
  'w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

// ─── Reusable PeriodSelector ─────────────────────────────────────────────────

export default function PeriodSelector({
  fromFieldId,
  toFieldId,
  formData,
  set,
}: {
  fromFieldId: string
  toFieldId: string
  formData: Record<string, string | number | undefined>
  set: (id: string, v: string) => void
}) {
  const [selMonths, setSelMonths] = useState(12)
  const [isCustom, setIsCustom] = useState(false)
  const [customVal, setCustomVal] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const from = (formData[fromFieldId] as string) || todayISO()
    if (!formData[fromFieldId]) set(fromFieldId, from)
    if (!formData[toFieldId]) set(toFieldId, addMonths(from, 12))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function calcTo(from: string, months: number) {
    if (months > 0) set(toFieldId, addMonths(from, months))
  }

  function handleFromChange(v: string) {
    set(fromFieldId, v)
    calcTo(v, isCustom ? parseInt(customVal) || 0 : selMonths)
  }

  function handleDuration(months: number) {
    if (months === 0) {
      setIsCustom(true)
    } else {
      setIsCustom(false)
      setSelMonths(months)
      calcTo((formData[fromFieldId] as string) || todayISO(), months)
    }
  }

  function handleCustomInput(v: string) {
    setCustomVal(v)
    const months = parseInt(v) || 0
    if (months > 0) calcTo((formData[fromFieldId] as string) || todayISO(), months)
  }

  const periodTo = formData[toFieldId] as string | undefined

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Начална дата <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={(formData[fromFieldId] as string) || todayISO()}
            onChange={(e) => handleFromChange(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Крайна дата</label>
          <div className={inputClass + ' bg-gray-50 text-gray-600 cursor-default select-none'}>
            {periodTo ? `до: ${fmtDateBG(periodTo)}` : '—'}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Срок на застраховката <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map(({ label, months }) => {
            const active = months === 0 ? isCustom : !isCustom && selMonths === months
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleDuration(months)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors min-h-[34px] ${
                  active
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-700'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        {isCustom && (
          <div className="mt-2 max-w-[160px]">
            <input
              type="number"
              min={1}
              max={120}
              value={customVal}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder="брой месеци"
              className={inputClass}
            />
          </div>
        )}
      </div>
    </div>
  )
}
