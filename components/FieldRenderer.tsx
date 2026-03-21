'use client'

import { useState } from 'react'
import { SchemaField, InsurerKey, INSURERS } from '@/lib/schema'

interface Props {
  field: SchemaField
  value: string | number | undefined
  selectedInsurers: InsurerKey[]
  onChange: (value: string) => void
}

export default function FieldRenderer({ field, value, selectedInsurers, onChange }: Props) {
  const [tooltip, setTooltip] = useState<InsurerKey | null>(null)

  const inputBase =
    'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm ' +
    'placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors'

  return (
    <div className="space-y-1.5">
      {/* Label + insurer badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-medium text-gray-200">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {/* Insurer badges */}
        <div className="flex gap-1 relative">
          {(Object.keys(INSURERS) as InsurerKey[]).map((key) => {
            const insurer = INSURERS[key]
            const isMapped = Boolean(field.mapping[key])
            const isSelected = selectedInsurers.includes(key)
            if (!isSelected) return null

            return (
              <div key={key} className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setTooltip(key)}
                  onMouseLeave={() => setTooltip(null)}
                  className={`w-5 h-5 rounded text-white text-[10px] font-bold flex items-center justify-center transition-opacity ${
                    isMapped ? 'opacity-90 hover:opacity-100' : 'opacity-25'
                  }`}
                  style={{ backgroundColor: isMapped ? insurer.color : '#6b7280' }}
                >
                  {insurer.name[0]}
                </button>

                {/* Tooltip */}
                {tooltip === key && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2 py-1 rounded text-xs text-white whitespace-nowrap shadow-lg"
                    style={{ backgroundColor: isMapped ? insurer.color : '#374151' }}
                  >
                    {isMapped
                      ? `${insurer.name}: "${field.mapping[key]}"`
                      : `${insurer.name}: не се използва`}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                      style={{ borderTopColor: isMapped ? insurer.color : '#374151' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Input */}
      {field.type === 'select' && field.options ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputBase + ' cursor-pointer'}
        >
          <option value="">— изберете —</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className={inputBase + ' resize-none'}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={inputBase}
          min={field.type === 'number' ? 0 : undefined}
        />
      )}

      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
    </div>
  )
}
