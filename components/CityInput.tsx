'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Bulgarian cities/towns ──────────────────────────────────────────────────

const TOP_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе',
  'Стара Загора', 'Плевен', 'Велико Търново', 'Благоевград', 'Перник',
]

const ALL_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен',
  'Велико Търново', 'Благоевград', 'Перник', 'Добрич', 'Шумен', 'Хасково',
  'Пазарджик', 'Сливен', 'Монтана', 'Видин', 'Ловеч', 'Враца', 'Габрово',
  'Кърджали', 'Смолян', 'Силистра', 'Разград', 'Търговище', 'Кюстендил',
  'Ямбол', 'Троян', 'Асеновград', 'Казанлък', 'Дупница', 'Горна Оряховица',
  'Димитровград', 'Свищов', 'Карлово', 'Севлиево', 'Нова Загора', 'Свиленград',
  'Карнобат', 'Панагюрище', 'Велинград', 'Петрич', 'Сандански', 'Банско',
  'Провадия', 'Самоков', 'Ботевград', 'Попово', 'Лом', 'Раднево',
  'Червен бряг', 'Елхово', 'Нови Искър', 'Несебър', 'Поморие', 'Созопол',
  'Балчик', 'Каварна', 'Девня', 'Козлодуй', 'Берковица', 'Ихтиман',
]

// Remove duplicates
const UNIQUE_CITIES = Array.from(new Set(ALL_CITIES))

const inputClass =
  'w-full bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 text-sm ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow'

const errorInputClass =
  'w-full bg-white border border-red-400 bg-red-50/30 text-gray-900 rounded-lg px-3 py-2.5 text-sm ' +
  'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition-shadow'

export default function CityInput({
  value,
  onChange,
  hasError,
  placeholder,
}: {
  value: string | undefined
  onChange: (v: string) => void
  hasError?: boolean
  placeholder?: string
}) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const trimmed = query.trim().toLowerCase()
  const showSearch = trimmed.length >= 2

  const filtered = showSearch
    ? UNIQUE_CITIES.filter((c) => c.toLowerCase().includes(trimmed)).slice(0, 10)
    : TOP_CITIES

  const shouldShowDropdown = open && focused

  // Reset highlight when list changes
  useEffect(() => {
    setHighlightIndex(-1)
  }, [query, open])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-city-item]')
      items[highlightIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  const selectCity = useCallback((city: string) => {
    setQuery(city)
    onChange(city)
    setOpen(false)
    setHighlightIndex(-1)
  }, [onChange])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!shouldShowDropdown || filtered.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < filtered.length) {
        selectCity(filtered[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightIndex(-1)
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => { setFocused(true); setOpen(true) }}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Започнете да пишете или изберете...'}
        className={hasError ? errorInputClass : inputClass}
        autoComplete="off"
      />
      {shouldShowDropdown && filtered.length > 0 && (
        <div ref={listRef} className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
          {!showSearch && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              Популярни градове
            </div>
          )}
          {filtered.map((city, idx) => (
            <button
              key={city}
              type="button"
              data-city-item
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCity(city)}
              onMouseEnter={() => setHighlightIndex(idx)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                idx === highlightIndex
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : city === query
                    ? 'bg-blue-50/50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {city}
            </button>
          ))}
          {showSearch && filtered.length === 0 && (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">Няма намерени градове</div>
          )}
        </div>
      )}
    </div>
  )
}
