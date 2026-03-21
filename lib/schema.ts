export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea'
export type InsurerKey = 'bulstrad' | 'generali' | 'instinct'
export type TransformType =
  | 'direct'
  | 'year_to_range'
  | 'floors_to_range'
  | 'distance_to_boolean'
  | 'months_to_years'

export interface FieldMapping {
  bulstrad?: string | null
  generali?: string | null
  instinct?: string | null
}

export interface FieldOption {
  value: string
  label: string
}

export interface SchemaField {
  id: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
  mapping: FieldMapping
  transforms?: Partial<Record<InsurerKey, TransformType>>
  helpText?: string
}

export interface SchemaSection {
  id: string
  label: string
  shortLabel: string
  icon: string
  fields: SchemaField[]
}

export const INSURERS: Record<InsurerKey, { key: InsurerKey; name: string; color: string; formCode: string }> = {
  bulstrad: {
    key: 'bulstrad',
    name: 'Булстрад',
    color: '#0B3D91',
    formCode: '2200-26',
  },
  generali: {
    key: 'generali',
    name: 'Женерали',
    color: '#C8102E',
    formCode: 'ИМСБ 07.01.2026',
  },
  instinct: {
    key: 'instinct',
    name: 'Инстинкт',
    color: '#1B6B3A',
    formCode: 'AR-01082025',
  },
}

const YES_NO: FieldOption[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Не' },
]

export const MASTER_SCHEMA: SchemaSection[] = [
  // ─── Секция 1: Данни за кандидата ───────────────────────────────────────────
  {
    id: 'applicant',
    label: 'Данни за кандидата',
    shortLabel: 'Кандидат',
    icon: '👤',
    fields: [
      {
        id: 'company_name',
        label: 'Наименование',
        type: 'text',
        required: true,
        placeholder: 'Фирма ЕООД / Иван Иванов',
        mapping: {
          bulstrad: 'Наименование',
          generali: 'Име/Наименование',
          instinct: 'Име/Name',
        },
      },
      {
        id: 'eik',
        label: 'ЕИК / ЕГН',
        type: 'text',
        required: true,
        placeholder: '123456789',
        mapping: {
          bulstrad: 'ЕИК/ЕГН',
          generali: 'ЕГН/ЕИК',
          instinct: 'Company ID №',
        },
      },
      {
        id: 'address',
        label: 'Адрес на управление',
        type: 'text',
        required: true,
        placeholder: 'гр. София, ул. ...',
        mapping: {
          bulstrad: 'Седалище и адрес',
          generali: 'Адрес за кореспонденция',
          instinct: 'Адрес/Address',
        },
      },
      {
        id: 'phone',
        label: 'Телефон',
        type: 'text',
        placeholder: '+359 88 888 8888',
        mapping: {
          bulstrad: 'Тел.',
          generali: 'Телефон/Мобилен тел.',
          instinct: 'phone number',
        },
      },
      {
        id: 'email',
        label: 'Ел. поща',
        type: 'text',
        placeholder: 'office@firma.bg',
        mapping: {
          bulstrad: 'е-mail',
          generali: 'Ел. поща',
          instinct: 'email',
        },
      },
      {
        id: 'activity',
        label: 'Основна дейност',
        type: 'text',
        placeholder: 'Търговия с хранителни стоки',
        mapping: {
          bulstrad: 'Основна дейност + НКИД',
          generali: 'Предмет на дейност',
          instinct: 'Type of activity',
        },
      },
      {
        id: 'nkid_code',
        label: 'Код по НКИД',
        type: 'text',
        placeholder: '47.11',
        mapping: {
          bulstrad: 'Код по НКИД',
          generali: null,
          instinct: null,
        },
      },
      {
        id: 'representative',
        label: 'Представител',
        type: 'text',
        placeholder: 'Иван Иванов',
        mapping: {
          bulstrad: null,
          generali: null,
          instinct: 'Представител',
        },
      },
    ],
  },

  // ─── Секция 2: Обект и период ────────────────────────────────────────────────
  {
    id: 'insurance_object',
    label: 'Обект и период',
    shortLabel: 'Обект',
    icon: '🏢',
    fields: [
      {
        id: 'property_address',
        label: 'Адрес на застрахованото имущество',
        type: 'text',
        required: true,
        placeholder: 'гр. София, ул. ...',
        mapping: {
          bulstrad: 'Адрес на имуществото',
          generali: 'Местоположение',
          instinct: 'Insured location',
        },
      },
      {
        id: 'object_activity',
        label: 'Дейност в обекта',
        type: 'text',
        placeholder: 'Магазин / Склад / Офис',
        mapping: {
          bulstrad: 'Дейност в обекта',
          generali: 'Предназначение на сградата',
          instinct: 'Type of the activity',
        },
      },
      {
        id: 'beneficiary',
        label: 'Ползващо лице',
        type: 'text',
        placeholder: 'Банка / наемодател (ако има)',
        mapping: {
          bulstrad: 'Трето ползващо се лице',
          generali: 'Трето ползващо се лице',
          instinct: 'Beneficiary',
        },
      },
      {
        id: 'period_from',
        label: 'Начална дата',
        type: 'date',
        required: true,
        mapping: {
          bulstrad: 'Период от',
          generali: null,
          instinct: 'от 00.00ч на',
        },
      },
      {
        id: 'period_to',
        label: 'Крайна дата',
        type: 'date',
        required: true,
        mapping: {
          bulstrad: 'Период до',
          generali: null,
          instinct: 'до 24.00ч на',
        },
      },
    ],
  },

  // ─── Секция 3: Имущество и суми ──────────────────────────────────────────────
  {
    id: 'property_values',
    label: 'Имущество и застрахователни суми',
    shortLabel: 'Суми',
    icon: '💰',
    fields: [
      {
        id: 'currency',
        label: 'Валута',
        type: 'select',
        required: true,
        options: [
          { value: 'BGN', label: 'BGN (лв.)' },
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'USD', label: 'USD ($)' },
        ],
        mapping: {
          bulstrad: 'Валута',
          generali: 'Евро',
          instinct: 'BGN/EUR/USD',
        },
      },
      {
        id: 'val_buildings',
        label: 'Сгради',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '1.1. Сгради',
          generali: 'Недвижимо имущество',
          instinct: 'Building, Improvements',
        },
      },
      {
        id: 'val_machinery',
        label: 'Машини и оборудване',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '1.2. Машини, съоръжения',
          generali: 'МСО',
          instinct: 'Machinery and equipment',
        },
      },
      {
        id: 'val_electronics',
        label: 'Електронно оборудване',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: 'Клауза 017',
          generali: 'Електронна техника',
          instinct: 'Electronic equipment',
        },
      },
      {
        id: 'val_inventory',
        label: 'Инвентар / Обзавеждане',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '1.4. Инвентар',
          generali: 'Инвентар, обзавеждане',
          instinct: 'Fixtures + Furniture',
        },
      },
      {
        id: 'val_stock',
        label: 'Стоки и материали',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '2.1-2.4 Мат. запаси',
          generali: 'Стоково-мат. запаси',
          instinct: 'Stock and Materials',
        },
      },
      {
        id: 'val_total',
        label: 'Обща застрахователна сума',
        type: 'number',
        required: true,
        placeholder: '0',
        mapping: {
          bulstrad: 'ОБЩО',
          generali: 'Общо за всички групи',
          instinct: 'Total',
        },
      },
      {
        id: 'valuation_basis',
        label: 'База за оценка',
        type: 'select',
        options: [
          { value: 'actual', label: 'Действителна стойност' },
          { value: 'replacement', label: 'Възстановителна стойност' },
        ],
        mapping: {
          bulstrad: 'действ./възстановителна',
          generali: 'Действ./Възстановителна',
          instinct: 'book value/expert eval',
        },
      },
    ],
  },

  // ─── Секция 4: Данни за сградата ─────────────────────────────────────────────
  {
    id: 'building_info',
    label: 'Данни за сградата',
    shortLabel: 'Сграда',
    icon: '🏗️',
    fields: [
      {
        id: 'construction_type',
        label: 'Носеща конструкция',
        type: 'select',
        required: true,
        options: [
          { value: 'reinforced_concrete', label: 'Стоманобетонна' },
          { value: 'metal', label: 'Метална' },
          { value: 'brick', label: 'Тухлена' },
          { value: 'wooden', label: 'Дървена' },
          { value: 'other', label: 'Друга' },
        ],
        mapping: {
          bulstrad: 'Носеща конструкция',
          generali: 'Вид конструкция',
          instinct: 'Стоманобетонна/Тухлена/Метална/Дървена',
        },
      },
      {
        id: 'roof_type',
        label: 'Вид покрив',
        type: 'select',
        options: [
          { value: 'reinforced_concrete', label: 'ЖБ плоча' },
          { value: 'tiles', label: 'Керемиди' },
          { value: 'metal', label: 'Метален' },
          { value: 'other', label: 'Друг' },
        ],
        mapping: {
          bulstrad: 'Покрив',
          generali: 'Масивна/Метална/Друго',
          instinct: 'reinforced concrete/metal/wooden',
        },
      },
      {
        id: 'sandwich_panels',
        label: 'Сандвич-панели',
        type: 'select',
        options: [
          { value: 'none', label: 'Няма' },
          { value: 'xps', label: 'XPS' },
          { value: 'eps', label: 'EPS' },
          { value: 'pur', label: 'PUR' },
          { value: 'pir', label: 'PIR' },
          { value: 'mineral', label: 'Минерална вата' },
        ],
        mapping: {
          bulstrad: 'XPS/EPS/PUR/PIR/мин.вата',
          generali: 'вид на термопанелите',
          instinct: 'XPS/EPS/PUR/PIR/Mineral fibers',
        },
      },
      {
        id: 'construction_year',
        label: 'Година на построяване',
        type: 'text',
        placeholder: '2005',
        mapping: {
          bulstrad: 'до 4/5-10/11-20/над 20',
          generali: 'Година',
          instinct: 'year of construction',
        },
        transforms: {
          bulstrad: 'year_to_range',
        },
      },
      {
        id: 'last_renovation',
        label: 'Последен ремонт',
        type: 'text',
        placeholder: '2020',
        mapping: {
          bulstrad: 'от последната реконструкция',
          generali: 'Последен ремонт',
          instinct: 'last capital renovation',
        },
      },
      {
        id: 'floors',
        label: 'Брой етажи',
        type: 'text',
        placeholder: '3',
        mapping: {
          bulstrad: '1-2/3-5/6-10/над 10',
          generali: null,
          instinct: 'total number of floors',
        },
        transforms: {
          bulstrad: 'floors_to_range',
        },
      },
      {
        id: 'area_sqm',
        label: 'РЗП (кв.м.)',
        type: 'number',
        placeholder: '500',
        mapping: {
          bulstrad: null,
          generali: 'РЗП [м²]',
          instinct: 'Total built-up area',
        },
      },
      {
        id: 'photovoltaic',
        label: 'Фотоволтаична инсталация',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: null,
          generali: null,
          instinct: 'да/не',
        },
      },
    ],
  },

  // ─── Секция 5: Пожарна безопасност ───────────────────────────────────────────
  {
    id: 'fire_safety',
    label: 'Пожарна безопасност',
    shortLabel: 'Пожарна',
    icon: '🔥',
    fields: [
      {
        id: 'fire_compliance',
        label: 'Спазени изисквания ПБЗН',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'Мерките отговарят ли?',
          generali: null,
          instinct: 'requirements met?',
        },
      },
      {
        id: 'fire_alarm',
        label: 'Пожароизвестителна система',
        type: 'select',
        options: [
          { value: 'automatic', label: 'Автоматична' },
          { value: 'manual', label: 'Ръчна' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: {
          bulstrad: 'детектори дим/топлина',
          generali: 'АПИИ',
          instinct: 'automatic/manual',
        },
      },
      {
        id: 'sprinklers',
        label: 'Спринклерна инсталация',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'спринклерна инсталация',
          generali: 'АПГИ',
          instinct: 'Sprinkler installation',
        },
      },
      {
        id: 'fire_extinguishers',
        label: 'Пожарогасители',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'пожарогасители',
          generali: 'Пожарогасители',
          instinct: 'fire extinguishers',
        },
      },
      {
        id: 'hydrants',
        label: 'Хидранти',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'противопожарни кранове',
          generali: 'Пожарни хидранти',
          instinct: 'hydrants',
        },
      },
      {
        id: 'fire_station_distance',
        label: 'Разстояние до пожарна служба',
        type: 'select',
        options: [
          { value: 'lt_1', label: 'до 1 км' },
          { value: '1_3', label: '1-3 км' },
          { value: '3_5', label: '3-5 км' },
          { value: '5_10', label: '5-10 км' },
          { value: 'gt_10', label: 'над 10 км' },
        ],
        mapping: {
          bulstrad: 'до 1/1-3/3-5/5-10/над 10 км',
          generali: '<2 км Да/Не',
          instinct: 'distance km',
        },
        transforms: {
          generali: 'distance_to_boolean',
        },
      },
    ],
  },

  // ─── Секция 6: Охрана и сигурност ────────────────────────────────────────────
  {
    id: 'security',
    label: 'Охрана и сигурност',
    shortLabel: 'Охрана',
    icon: '🔒',
    fields: [
      {
        id: 'occupancy',
        label: 'Обитаемост',
        type: 'select',
        options: [
          { value: 'working_hours', label: 'Работно време' },
          { value: 'constant', label: 'Постоянно' },
          { value: 'year_round', label: 'Целогодишно' },
        ],
        mapping: {
          bulstrad: 'работно/постоянно/целогодишно',
          generali: null,
          instinct: 'not 24h / 24h',
        },
      },
      {
        id: 'alarm_system',
        label: 'Алармена система',
        type: 'select',
        options: [
          { value: 'sot', label: 'СОТ (централизирана)' },
          { value: 'local', label: 'Локална' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: {
          bulstrad: 'локална/СОТ',
          generali: 'ІІ-ра степен: СОТ',
          instinct: 'local/central alarm',
        },
      },
      {
        id: 'guard_type',
        label: 'Вид охрана',
        type: 'select',
        options: [
          { value: 'own', label: 'Собствена' },
          { value: 'specialized', label: 'Специализирана фирма' },
          { value: 'night', label: 'Нощна' },
          { value: 'round_clock', label: 'Денонощна' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: {
          bulstrad: 'собствена/специализирана/нощна/денонощна',
          generali: 'степен обезопасеност',
          instinct: 'armed/unarmed guards',
        },
      },
      {
        id: 'cctv',
        label: 'Видеонаблюдение (CCTV)',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'телевизионни камери',
          generali: null,
          instinct: 'video surveillance',
        },
      },
    ],
  },

  // ─── Секция 7: Рискова среда ──────────────────────────────────────────────────
  {
    id: 'risk_environment',
    label: 'Рискова среда',
    shortLabel: 'Рискове',
    icon: '⚠️',
    fields: [
      {
        id: 'hazardous_materials',
        label: 'Опасни вещества в обекта',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не + опис',
          generali: 'Да/Не',
          instinct: null,
        },
      },
      {
        id: 'water_basin_distance',
        label: 'Близост до воден басейн / река',
        type: 'select',
        options: [
          { value: 'lt_500', label: 'до 500 м' },
          { value: '500_1000', label: '500-1000 м' },
          { value: '1000_1500', label: '1000-1500 м' },
          { value: 'gt_1500', label: 'над 1500 м' },
        ],
        mapping: {
          bulstrad: 'до 500/1000/1500/над 1500 м',
          generali: 'Да/Не',
          instinct: '≤50m / ≥50m',
        },
        transforms: {
          generali: 'distance_to_boolean',
        },
      },
      {
        id: 'landslide_area',
        label: 'Свлачищен район',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не',
          generali: 'Да/Не',
          instinct: 'да/не',
        },
      },
    ],
  },

  // ─── Секция 8: Щети и история ────────────────────────────────────────────────
  {
    id: 'claims_history',
    label: 'Щети и история',
    shortLabel: 'История',
    icon: '📋',
    fields: [
      {
        id: 'previous_claims',
        label: 'Щети през последните години',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не (5 год.)',
          generali: 'Да/Не (5 год.)',
          instinct: 'да/не (36 мес.)',
        },
        transforms: {
          instinct: 'months_to_years',
        },
      },
      {
        id: 'claims_details',
        label: 'Описание на щетите',
        type: 'textarea',
        placeholder: 'Дата, вид, размер на щетата...',
        mapping: {
          bulstrad: 'дата, вид, размер',
          generali: 'моля посочете',
          instinct: 'Година/Сума/Причина',
        },
      },
      {
        id: 'existing_insurance',
        label: 'Съществуваща подобна застраховка',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не',
          generali: null,
          instinct: 'да/не',
        },
      },
      {
        id: 'insurance_declined',
        label: 'Отказвана ли ви е застраховка',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не',
          generali: null,
          instinct: 'да/не',
        },
      },
    ],
  },

  // ─── Секция 9: Плащане ────────────────────────────────────────────────────────
  {
    id: 'payment',
    label: 'Плащане',
    shortLabel: 'Плащане',
    icon: '💳',
    fields: [
      {
        id: 'payment_type',
        label: 'Начин на плащане',
        type: 'select',
        options: [
          { value: 'single', label: 'Еднократно' },
          { value: 'installments', label: 'Разсрочено' },
        ],
        mapping: {
          bulstrad: 'еднократно/разсрочено',
          generali: 'Не/Да + брой',
          instinct: null,
        },
      },
      {
        id: 'custom_deductible',
        label: 'Различно самоучастие',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'да/не',
          generali: 'Да/Не',
          instinct: null,
        },
      },
    ],
  },
]

export type FormData = Record<string, string | number | undefined>
