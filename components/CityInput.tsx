'use client'

import { useState, useRef, useEffect } from 'react'

// ─── Bulgarian cities/towns ──────────────────────────────────────────────────
// Top cities first, then full list of all major settlements

const TOP_CITIES = [
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе',
  'Стара Загора', 'Плевен', 'Велико Търново', 'Благоевград', 'Перник',
]

const ALL_CITIES = [
  // Областни центрове и големи градове
  'София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Плевен',
  'Велико Търново', 'Благоевград', 'Перник', 'Добрич', 'Сливен', 'Шумен',
  'Хасково', 'Ямбол', 'Пазарджик', 'Враца', 'Габрово', 'Кърджали',
  'Монтана', 'Видин', 'Ловеч', 'Търговище', 'Кюстендил', 'Разград',
  'Силистра', 'Смолян',
  // Средни и малки градове
  'Асеновград', 'Казанлък', 'Ботевград', 'Самоков', 'Дупница', 'Горна Оряховица',
  'Димитровград', 'Свищов', 'Карлово', 'Троян', 'Лом', 'Петрич', 'Сандански',
  'Севлиево', 'Нова Загора', 'Свиленград', 'Провадия', 'Раднево', 'Карнобат',
  'Панагюрище', 'Велинград', 'Червен бряг', 'Попово', 'Първомай', 'Мездра',
  'Тетевен', 'Берковица', 'Козлодуй', 'Елхово', 'Ихтиман', 'Нови Искър',
  'Банско', 'Девня', 'Банкя', 'Елин Пелин', 'Костинброд', 'Етрополе',
  'Твърдица', 'Исперих', 'Тутракан', 'Нови пазар', 'Каспичан', 'Омуртаг',
  'Кубрат', 'Своге', 'Костенец', 'Пирдоп', 'Белоградчик', 'Трявна',
  'Дряново', 'Ардино', 'Крумовград', 'Момчилград', 'Златоград',
  'Мадан', 'Рудозем', 'Девин', 'Чепеларе', 'Доспат', 'Неделино',
  'Средец', 'Созопол', 'Несебър', 'Поморие', 'Айтос', 'Каварна',
  'Балчик', 'Тервел', 'Бяла', 'Обзор', 'Ахтопол',
  'Белослав', 'Аксаково', 'Вълчи дол', 'Суворово', 'Долни чифлик',
  'Генерал Тошево', 'Шабла', 'Чирпан', 'Гълъбово', 'Харманли',
  'Симеоновград', 'Любимец', 'Ивайловград', 'Тополовград',
  'Крън', 'Мъглиж', 'Павел баня', 'Шипка', 'Гурково',
  'Сопот', 'Хисаря', 'Калофер', 'Клисура', 'Баня',
  'Разлог', 'Гоце Делчев', 'Хаджидимово', 'Белица',
  'Рила', 'Бобов дол', 'Бобошево', 'Сапарева баня',
  'Батак', 'Белово', 'Брацигово', 'Пещера', 'Ракитово', 'Септември', 'Стрелча',
  'Долна баня', 'Копривщица', 'Златица',
  'Правец', 'Тетевен', 'Априлци', 'Луковит', 'Угърчин', 'Ябланица',
  'Оряхово', 'Бяла Слатина', 'Кнежа', 'Левски', 'Никопол', 'Белене',
  'Павликени', 'Сухиндол', 'Полски Тръмбеш', 'Стражица', 'Златарица',
  'Дебелец', 'Килифарево', 'Лясковец', 'Елена',
  'Две могили', 'Бяла', 'Борово', 'Ценово',
  'Алфатар', 'Дулово', 'Главиница',
  'Чипровци', 'Вършец', 'Бойчиновци',
  'Вълчедръм', 'Брусарци',
  'Котел', 'Нови пазар', 'Велики Преслав',
  'Каолиново', 'Върбица',
  'Болярово', 'Стралджа',
  'Тунджа', 'Ябланово',
  'Ивайловград', 'Маджарово',
  'Златарица', 'Антоново', 'Опака',
]

// Remove duplicates and sort
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
}: {
  value: string | undefined
  onChange: (v: string) => void
  hasError?: boolean
}) {
  const [query, setQuery] = useState(value ?? '')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
    ? UNIQUE_CITIES.filter((c) => c.toLowerCase().includes(trimmed)).slice(0, 15)
    : TOP_CITIES

  const shouldShowDropdown = open && focused

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
        placeholder="Започнете да пишете или изберете..."
        className={hasError ? errorInputClass : inputClass}
        autoComplete="off"
      />
      {shouldShowDropdown && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
          {!showSearch && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              Популярни градове
            </div>
          )}
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(city)
                onChange(city)
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                city === query ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
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
