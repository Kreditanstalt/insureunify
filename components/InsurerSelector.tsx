'use client'

import Image from 'next/image'
import { INSURERS, InsurerKey } from '@/lib/schema'

interface Props {
  selected: InsurerKey[]
  onChange: (selected: InsurerKey[]) => void
  availableInsurers?: InsurerKey[]
}

const INSURER_DESCRIPTIONS: Partial<Record<InsurerKey, string>> = {
  bulstrad: 'Комбинирана полица Имущество · Формуляр 2200-26',
  generali: 'Имущество за малък и среден бизнес · ИМСБ 07.01.2026',
  instinct: 'Всички рискове / All Risks · AR-01082025',
}

export default function InsurerSelector({ selected, onChange, availableInsurers }: Props) {
  const keys = (availableInsurers ?? Object.keys(INSURERS)) as InsurerKey[]

  function toggle(key: InsurerKey) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Изберете застрахователите, за които искате да генерирате документи.
      </p>
      {keys.map((key) => {
        const insurer = INSURERS[key]
        if (!insurer) return null
        const isSelected = selected.includes(key)
        const description = INSURER_DESCRIPTIONS[key as keyof typeof INSURER_DESCRIPTIONS]

        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              isSelected
                ? 'bg-gray-800 border-opacity-100'
                : 'bg-gray-900 border-gray-700 hover:border-gray-500'
            }`}
            style={isSelected ? { borderColor: insurer.color } : undefined}
          >
            {/* Logo */}
            <div
              className="w-14 h-11 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-white border border-gray-200"
            >
              {insurer.logo ? (
                <Image
                  src={insurer.logo}
                  alt={insurer.name}
                  width={56}
                  height={44}
                  className="object-contain p-1"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.style.backgroundColor = insurer.color
                      parent.style.borderRadius = '50%'
                      parent.style.width = '40px'
                      parent.style.height = '40px'
                      parent.textContent = insurer.name[0]
                      parent.style.color = 'white'
                      parent.style.fontWeight = 'bold'
                      parent.style.fontSize = '14px'
                    }
                  }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: insurer.color }}
                >
                  {insurer.name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white">{insurer.name}</div>
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {description ?? insurer.formCode}
              </div>
            </div>

            {/* Checkbox */}
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'border-transparent' : 'border-gray-600'
              }`}
              style={isSelected ? { backgroundColor: insurer.color } : undefined}
            >
              {isSelected && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        )
      })}

      {selected.length === 0 && (
        <p className="text-xs text-red-400 mt-2">Моля, изберете поне един застраховател.</p>
      )}
    </div>
  )
}
