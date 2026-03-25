export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea'
export type InsurerKey = 'bulstrad' | 'generali' | 'instinct' | 'axiom' | 'euroins' | 'ozk'

// Property-specific insurers (shown in property questionnaire)
export const PROPERTY_INSURER_KEYS: InsurerKey[] = ['bulstrad', 'generali', 'instinct', 'ozk']
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
  axiom?:    string | null
  euroins?:  string | null
  allianz?:  string | null
  groupama?: string | null
  ozk?:      string | null
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
  computed?: boolean          // val_total — rendered as disabled display field
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

export const INSURERS: Record<InsurerKey, { key: InsurerKey; name: string; color: string; formCode: string; logo: string }> = {
  bulstrad: { key: 'bulstrad', name: 'Булстрад',  color: '#0B3D91', formCode: '2200-26',        logo: '/logos/bulstrad.svg' },
  generali: { key: 'generali', name: 'Дженерали', color: '#C8102E', formCode: 'ИМСБ 07.01.2026', logo: '/logos/generali.jpg' },
  instinct: { key: 'instinct', name: 'Инстинкт',  color: '#6B21A8', formCode: 'AR-01082025',     logo: '/logos/instinct.jpg' },
  axiom:    { key: 'axiom',    name: 'Аксиом',    color: '#1E2D6B', formCode: 'PL-Application',  logo: '/logos/axiom.jpg' },
  euroins:  { key: 'euroins',  name: 'Евроинс',   color: '#1E3A8A', formCode: 'ПО-кл.08',        logo: '/logos/euroins.png' },
  ozk:      { key: 'ozk',     name: 'ОЗК',       color: '#1B3F8B', formCode: 'ОЗК-Имущество',   logo: '/logos/ozk.png' },
}

// Only these insurers appear in the Property questionnaire selector
export const PROPERTY_INSURERS: Record<string, { key: InsurerKey; name: string; color: string; formCode: string; logo: string }> = {
  bulstrad: INSURERS.bulstrad,
  generali: INSURERS.generali,
  instinct: INSURERS.instinct,
  ozk:      INSURERS.ozk,
}

const YES_NO: FieldOption[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Не' },
]

export const VALUE_FIELDS = [
  'val_buildings',
  'val_machinery',
  'val_electronics',
  'val_inventory',
  'val_stock',
  'val_vehicles_no_reg',
  'val_other_dma',
  'val_third_party',
  'val_cash',
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
        mapping: { bulstrad: 'Наименование', generali: 'Ime/Наименование', instinct: 'Ime/Name', ozk: 'Наименование' },
      },
      {
        id: 'eik',
        label: 'ЕИК / ЕГН',
        type: 'text',
        required: true,
        placeholder: '123456789',
        mapping: { bulstrad: 'ЕИК/ЕГН', generali: 'ЕГН/ЕИК', instinct: 'Company ID №', ozk: 'ЕИК/ЕГН' },
      },
      {
        id: 'address',
        label: 'Адрес на управление',
        type: 'text',
        required: true,
        placeholder: 'гр. София, ул. ...',
        mapping: { bulstrad: 'Седалище и адрес', generali: 'Адрес за кореспонденция', instinct: 'Адрес/Address', ozk: 'Седалище и адрес' },
      },
      {
        id: 'phone',
        label: 'Телефон',
        type: 'text',
        required: true,
        placeholder: '+359 88 888 8888',
        mapping: { bulstrad: 'Тел.', generali: 'Телефон/Мобилен тел.', instinct: 'phone number', ozk: 'Тел.' },
      },
      {
        id: 'email',
        label: 'Ел. поща',
        type: 'text',
        required: true,
        placeholder: 'office@firma.bg',
        mapping: { bulstrad: 'е-mail', generali: 'Ел. поща', instinct: 'email', ozk: 'Ел. поща' },
      },
      {
        id: 'activity',
        label: 'Основна дейност',
        type: 'text',
        required: true,
        placeholder: 'Търговия с хранителни стоки',
        mapping: { bulstrad: 'Основна дейност', generali: 'Предмет на дейност', instinct: 'Type of activity', ozk: 'Основна дейност' },
      },
      {
        id: 'nkid_code',
        label: 'Код по НКИД',
        type: 'text',
        placeholder: '47.11',
        mapping: { bulstrad: 'Код по НКИД', generali: null, instinct: null, ozk: 'Код по НКИД' },
      },
      {
        id: 'representative',
        label: 'Представител',
        type: 'text',
        placeholder: 'Иван Иванов — управител',
        mapping: { bulstrad: null, generali: null, instinct: 'Представител', ozk: null },
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
        id: 'property_city',
        label: 'Град',
        type: 'text',
        required: true,
        placeholder: 'София',
        mapping: { bulstrad: 'Град', generali: 'Град', instinct: 'City', ozk: 'Град' },
      },
      {
        id: 'property_address',
        label: 'Адрес',
        type: 'text',
        required: true,
        placeholder: 'ул. / бул., номер, етаж',
        mapping: { bulstrad: 'Адрес на имуществото', generali: 'Местоположение', instinct: 'Insured location', ozk: 'Адрес на имуществото' },
      },
      {
        id: 'object_activity',
        label: 'Дейност в обекта',
        type: 'select',
        options: [
          { value: 'shop', label: 'Магазин / търговски обект' },
          { value: 'warehouse', label: 'Склад' },
          { value: 'office', label: 'Офис / административна сграда' },
          { value: 'production', label: 'Производствено помещение' },
          { value: 'non_production', label: 'Непроизводствено помещение' },
          { value: 'hotel', label: 'Хотел / хотелски комплекс' },
          { value: 'restaurant', label: 'Ресторант / заведение' },
          { value: 'residential', label: 'Жилищна сграда' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: { bulstrad: 'Дейност в застрахования обект', generali: 'Предназначение на сградата', instinct: 'Type of the activity', ozk: 'Дейност в обекта' },
      },
      {
        id: 'beneficiary_type',
        label: 'Ползващо лице — вид',
        type: 'select',
        options: [
          { value: 'none', label: 'Няма ползващо лице' },
          { value: 'bank', label: 'Банка / финансираща институция' },
          { value: 'landlord', label: 'Наемодател' },
          { value: 'other_legal', label: 'Друго юридическо лице' },
        ],
        mapping: { bulstrad: null, generali: null, instinct: null, ozk: null },
      },
      {
        id: 'beneficiary_eik',
        label: 'ЕИК на ползващо лице',
        type: 'text',
        placeholder: 'ЕИК на банката / наемодателя',
        mapping: { bulstrad: null, generali: null, instinct: null, ozk: null },
      },
      {
        id: 'beneficiary_name',
        label: 'Наименование на ползващо лице',
        type: 'text',
        placeholder: 'Наименование',
        mapping: { bulstrad: 'Трето ползващо се лице', generali: 'Трето ползващо се лице', instinct: 'Beneficiary', ozk: 'Ползващо лице' },
      },
      {
        id: 'period_from',
        label: 'Начална дата',
        type: 'date',
        required: true,
        mapping: { bulstrad: 'Период от', generali: null, instinct: 'от 00.00ч на', ozk: 'Период от' },
      },
      {
        id: 'period_to',
        label: 'Крайна дата',
        type: 'date',
        required: true,
        mapping: { bulstrad: 'Период до', generali: null, instinct: 'до 24.00ч на', ozk: 'Период до' },
      },
    ],
  },

  // ─── Секция 3: Имущество и застрахователни суми ───────────────────────────────
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
          { value: 'EUR', label: 'EUR (€)' },
          { value: 'BGN', label: 'BGN (лв.)' },
          { value: 'USD', label: 'USD ($)' },
        ],
        mapping: { bulstrad: 'Валута', generali: 'Евро', instinct: 'EUR', ozk: 'Валута' },
      },
      {
        id: 'val_buildings',
        label: 'Сгради',
        type: 'number',
        placeholder: '0',
        mapping: { bulstrad: '1.1. Сгради', generali: 'Недвижимо имущество', instinct: 'Building, Improvements', ozk: '1.Сгради' },
      },
      {
        id: 'val_machinery',
        label: 'Машини, съоръжения',
        type: 'number',
        placeholder: '0',
        mapping: { bulstrad: '1.2. Машини, съоръжения', generali: 'МСО', instinct: 'Machinery and equipment', ozk: '2.Машини' },
      },
      {
        id: 'val_vehicles_no_reg',
        label: 'Транспортни средства без ДК№',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '1.3. Транспортни средства без ДК№',
          generali: null,
          instinct: 'Vehicles without registration', ozk: '3.МПС без рег.' },
      },
      {
        id: 'val_electronics',
        label: 'Електронно оборудване',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: 'Клауза 017',
          generali: 'Електронна техника и оборудване',
          instinct: 'Electronic equipment', ozk: '4.Ел. оборудване' },
      },
      {
        id: 'val_inventory',
        label: 'Инвентар / Обзавеждане',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: '1.4. Инвентар',
          generali: 'Инвентар, обзавеждане',
          instinct: 'Fixtures + Furniture', ozk: '5.Инвентар' },
      },
      {
        id: 'val_other_dma',
        label: 'Разходи за придобиване на ДМА',
        type: 'number',
        placeholder: '0',
        mapping: { bulstrad: '1.5. Разходи за придобиване на ДМА', generali: null, instinct: null, ozk: '6.Разходи ДМА' },
      },
      {
        id: 'val_stock',
        label: 'Стоки и материали',
        type: 'number',
        placeholder: '0',
        mapping: { bulstrad: '2.1-2.4 Мат. запаси', generali: 'Стоково-мат. запаси', instinct: 'Stock and Materials', ozk: '7.Стоки' },
      },
      {
        id: 'val_third_party',
        label: 'Чужди имущества',
        type: 'number',
        placeholder: '0',
        mapping: { bulstrad: '3. Чужди имущества', generali: null, instinct: 'Third party property', ozk: '8.Чужди имущества' },
      },
      {
        id: 'val_cash',
        label: 'Пари в каса',
        type: 'number',
        placeholder: '0',
        mapping: {
          bulstrad: 'Клауза 021 Пари',
          generali: 'Пари в каси и/или трезори',
          instinct: 'Money/Cash', ozk: '9.Пари' },
      },
      {
        id: 'val_total',
        label: 'ОБЩО (изчислява се автоматично)',
        type: 'number',
        required: true,
        computed: true,
        placeholder: '0',
        mapping: { bulstrad: 'ОБЩО', generali: 'Общо за всички групи', instinct: 'Total', ozk: 'ОБЩО' },
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
          instinct: 'book value/expert eval', ozk: 'База за оценка' },
      },
      {
        id: 'stock_basis',
        label: 'База на стоковите запаси',
        type: 'select',
        options: [
          { value: 'avg_monthly', label: 'Средно-месечна наличност' },
          { value: 'max', label: 'Максимална наличност' },
        ],
        mapping: { bulstrad: null, generali: 'По средно-месечна / максимална наличност', instinct: null, ozk: null },
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
        id: 'building_purpose',
        label: 'Предназначение на сградата',
        type: 'select',
        options: [
          { value: 'admin', label: 'Административна сграда' },
          { value: 'commercial', label: 'Търговски обект' },
          { value: 'production', label: 'Производствена сграда' },
          { value: 'warehouse', label: 'Складова база' },
          { value: 'hotel', label: 'Хотел' },
          { value: 'residential', label: 'Жилищна сграда' },
          { value: 'mixed', label: 'Смесено предназначение' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: { bulstrad: 'Предназначение на сградата', generali: null, instinct: null, ozk: 'Предназначение' },
      },
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
          instinct: 'Стоманобетонна/Тухлена/Метална/Дървена', ozk: 'Конструкция' },
      },
      {
        id: 'roof_type',
        label: 'Вид покрив',
        type: 'select',
        required: true,
        options: [
          { value: 'reinforced_concrete', label: 'ЖБ плоча' },
          { value: 'tiles', label: 'Керемиди' },
          { value: 'metal', label: 'Метален' },
          { value: 'other', label: 'Друг' },
        ],
        mapping: {
          bulstrad: 'Покрив',
          generali: 'Масивна/Метална/Друго',
          instinct: 'reinforced concrete/metal/wooden', ozk: 'Покрив' },
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
          { value: 'mineral', label: 'Мин. вата' },
        ],
        mapping: {
          bulstrad: 'сандвич-панели в конструкцията',
          generali: 'вид на термопанелите',
          instinct: 'XPS/EPS/PUR/PIR/Mineral fibers', ozk: 'Сандвич-панели' },
      },
      {
        id: 'construction_year',
        label: 'Година на построяване',
        type: 'text',
        required: true,
        placeholder: '2005',
        mapping: {
          bulstrad: 'до 4/5-10/11-20/над 20',
          generali: 'Година',
          instinct: 'year of construction', ozk: 'Година построяване' },
        transforms: { bulstrad: 'year_to_range' },
      },
      {
        id: 'last_renovation',
        label: 'Последен ремонт',
        type: 'text',
        placeholder: '2020',
        mapping: {
          bulstrad: 'от последната реконструкция',
          generali: 'Последен ремонт',
          instinct: 'last capital renovation', ozk: 'Последен ремонт' },
        transforms: { bulstrad: 'year_to_range' },
      },
      {
        id: 'floors',
        label: 'Брой етажи',
        type: 'text',
        required: true,
        placeholder: '3',
        mapping: {
          bulstrad: '1-2/3-5/6-10/над 10',
          generali: null,
          instinct: 'total number of floors', ozk: 'Етажи' },
        transforms: { bulstrad: 'floors_to_range' },
      },
      {
        id: 'area_sqm',
        label: 'РЗП (кв.м.)',
        type: 'number',
        placeholder: '500',
        mapping: { bulstrad: null, generali: 'РЗП [м²]', instinct: 'Total built-up area', ozk: 'РЗП' },
      },
      {
        id: 'building_standalone',
        label: 'Вид на сградата',
        type: 'select',
        options: [
          { value: 'standalone', label: 'Самостоятелна сграда' },
          { value: 'part_of', label: 'Част от сграда' },
        ],
        mapping: { bulstrad: null, generali: null, instinct: 'part of building / standalone', ozk: null },
      },
      {
        id: 'commissioned',
        label: 'Въведена в експлоатация',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Въведена ли е в експлоатация', generali: null, instinct: null, ozk: 'В експлоатация' },
      },
      {
        id: 'energy_cert',
        label: 'Енергиен сертификат (клас)',
        type: 'text',
        placeholder: 'A, B, C ...',
        mapping: { bulstrad: 'Енергиен сертификат', generali: null, instinct: null, ozk: 'Енерг. сертификат' },
      },
      {
        id: 'photovoltaic',
        label: 'Фотоволтаична инсталация',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: null, generali: null, instinct: 'фотоволтаична инсталация', ozk: null },
      },
      {
        id: 'lightning_protection',
        label: 'Мълниезащита',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: null, generali: null, instinct: 'мълниезащита', ozk: null },
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
        mapping: { bulstrad: 'Мерките отговарят ли на ПБЗН', generali: null, instinct: 'requirements met?', ozk: 'Противопожарни изисквания' },
      },
      {
        id: 'fire_alarm',
        label: 'Пожароизвестителна система',
        type: 'select',
        required: true,
        options: [
          { value: 'automatic', label: 'Автоматична' },
          { value: 'manual', label: 'Ръчна' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: { bulstrad: 'детектори дим/топлина', generali: 'АПИИ', instinct: 'automatic/manual', ozk: 'Пожароизвестяване' },
      },
      {
        id: 'sprinklers',
        label: 'Спринклерна инсталация',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'спринклерна инсталация', generali: 'АПГИ', instinct: 'Sprinkler installation', ozk: 'Спринклери' },
      },
      {
        id: 'fire_extinguishers',
        label: 'Пожарогасители',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: { bulstrad: 'пожарогасители', generali: 'Пожарогасители', instinct: 'fire extinguishers', ozk: 'Пожарогасители' },
      },
      {
        id: 'hydrants',
        label: 'Противопожарни хидранти',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'противопожарни кранове', generali: 'Пожарни хидранти', instinct: 'hydrants', ozk: 'Хидранти' },
      },
      {
        id: 'additional_water',
        label: 'Допълнителен воден резервоар',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'допълнителен водоем/резервоар', generali: null, instinct: 'additional water reservoir', ozk: 'Воден резервоар' },
      },
      {
        id: 'detectors',
        label: 'CO / Газови детектори',
        type: 'select',
        options: [
          { value: 'co', label: 'CO' },
          { value: 'gas', label: 'Газови' },
          { value: 'both', label: 'И двете' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: { bulstrad: 'CO/газови детектори', generali: null, instinct: 'gas/CO detectors', ozk: 'CO/газ детектори' },
      },
      {
        id: 'fire_station_distance',
        label: 'Разстояние до пожарна служба',
        type: 'select',
        required: true,
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
          instinct: 'distance km', ozk: 'Разст. до пожарна' },
        transforms: { generali: 'distance_to_boolean' },
      },
      {
        id: 'last_inspection',
        label: 'Дата на последен ПБЗН преглед',
        type: 'text',
        placeholder: 'мм.гггг',
        mapping: { bulstrad: 'дата на последен преглед', generali: null, instinct: null, ozk: null },
      },
    ],
  },

  // ─── Секция 6: Охрана ────────────────────────────────────────────────────────
  {
    id: 'security',
    label: 'Охрана',
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
          bulstrad: 'Обектът се обитава',
          generali: null,
          instinct: 'not 24h / 24h', ozk: 'Обитаемост' },
      },
      {
        id: 'alarm_system',
        label: 'Алармена система',
        type: 'select',
        required: true,
        options: [
          { value: 'sot', label: 'СОТ' },
          { value: 'local', label: 'Локална' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: {
          bulstrad: 'локална/СОТ',
          generali: 'ІІ-ра степен обезопасеност: СОТ',
          instinct: 'local/central alarm', ozk: 'Алармена система' },
      },
      {
        id: 'guard_type',
        label: 'Физическа охрана',
        type: 'select',
        options: [
          { value: 'own', label: 'Собствена' },
          { value: 'specialized', label: 'Специализирана' },
          { value: 'night', label: 'Нощна' },
          { value: 'round_clock', label: 'Денонощна' },
          { value: 'none', label: 'Няма' },
        ],
        mapping: {
          bulstrad: 'собствена/специализирана/нощна/денонощна',
          generali: 'степен обезопасеност',
          instinct: 'armed/unarmed guards', ozk: 'Физическа охрана' },
      },
      {
        id: 'cctv',
        label: 'Видеонаблюдение (CCTV)',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'телевизионни камери', generali: null, instinct: 'video surveillance', ozk: 'Видеонаблюдение' },
      },
      {
        id: 'fence',
        label: 'Ефективна ограда',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: null, generali: null, instinct: 'ефективна ограда', ozk: null },
      },
      {
        id: 'other_security',
        label: 'Допълнителни мерки за сигурност',
        type: 'textarea',
        placeholder: 'Фотодатчици, обемни датчици, паник-бутон...',
        mapping: { bulstrad: 'фотодатчици/обемни датчици/паник-бутон', generali: null, instinct: null, ozk: null },
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
        label: 'Леснозапалими / опасни вещества',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Леснозапалими вещества', generali: 'Леснозапалими вещества', instinct: null, ozk: 'Опасни вещества' },
      },
      {
        id: 'hazardous_desc',
        label: 'Вид опасни вещества',
        type: 'text',
        placeholder: 'Опишете вида и количеството',
        mapping: { bulstrad: 'Вид опасни вещества', generali: null, instinct: null, ozk: 'Вид опасни вещества' },
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
          generali: 'Има ли воден басейн наблизо',
          instinct: '≤50m / ≥50m', ozk: 'Близост до воден басейн' },
        transforms: { generali: 'distance_to_boolean' },
      },
      {
        id: 'landslide_area',
        label: 'Свлачищен район',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Свлачищен район', generali: 'Свлачищни процеси', instinct: 'да/не', ozk: 'Свлачищен район' },
      },
      {
        id: 'underground_equipment',
        label: 'Машини под нивото на земята',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Машини под нивото на земята', generali: null, instinct: null, ozk: 'Машини под земята' },
      },
      {
        id: 'stock_floor_distance',
        label: 'Запаси на разстояние <10 см от пода',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Запаси на <10 см от пода', generali: null, instinct: null, ozk: 'Запаси <10 см пода' },
      },
      {
        id: 'nearest_building_distance',
        label: 'Разстояние до най-близка сграда (м)',
        type: 'text',
        placeholder: '15',
        mapping: { bulstrad: 'Разстояние до най-близка сграда', generali: null, instinct: null, ozk: 'Разст. до сграда' },
      },
      {
        id: 'stored_materials_type',
        label: 'Вид съхранявани материали',
        type: 'text',
        placeholder: 'Метал, Пластмаса, Дърво...',
        mapping: { bulstrad: 'Вид съхранявани материали', generali: null, instinct: null, ozk: 'Вид материали' },
      },
    ],
  },

  // ─── Секция 8: Щети и история ─────────────────────────────────────────────────
  {
    id: 'claims_history',
    label: 'Щети и история',
    shortLabel: 'История',
    icon: '📋',
    fields: [
      {
        id: 'previous_claims',
        label: 'Щети през последните 5 години',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: {
          bulstrad: 'Щети (5 год.) Да/Не',
          generali: 'Имало ли е щети 5 години',
          instinct: 'да/не (36 мес.)', ozk: 'Щети (5г.)' },
        transforms: { instinct: 'months_to_years' },
      },
      {
        id: 'claims_details',
        label: 'Описание на щетите',
        type: 'textarea',
        placeholder: 'Дата, вид, размер на щетата...',
        mapping: { bulstrad: 'дата, вид, размер', generali: 'моля посочете', instinct: 'Година/Сума/Причина', ozk: 'Описание на щети' },
      },
      {
        id: 'existing_insurance',
        label: 'Действаща подобна застраховка',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Действаща застраховка', generali: null, instinct: 'да/не', ozk: 'Действаща застраховка' },
      },
      {
        id: 'insurance_declined',
        label: 'Отказвана ли ви е застраховка',
        type: 'select',
        options: YES_NO,
        mapping: { bulstrad: 'Отказвано ли Ви е', generali: null, instinct: 'да/не', ozk: 'Отказвана' },
      },
      {
        id: 'insurance_cancelled',
        label: 'Предсрочно прекратяване на застраховка',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'Предсрочно прекратяване',
          generali: null,
          instinct: 'Прекратявана ли е предсрочно', ozk: 'Прекратявана' },
      },
      {
        id: 'additional_info',
        label: 'Допълнителна информация за риска',
        type: 'textarea',
        placeholder: 'Всякакви допълнителни факти...',
        mapping: {
          bulstrad: 'Други факти за риска',
          generali: null,
          instinct: 'допълнителна информация', ozk: 'Доп. информация' },
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
        mapping: { bulstrad: 'еднократно/разсрочено', generali: 'Не/Да + брой', instinct: null, ozk: 'Начин на плащане' },
      },
      {
        id: 'custom_deductible',
        label: 'Желаете ли самоучастие',
        type: 'select',
        options: YES_NO,
        mapping: {
          bulstrad: 'Желаете ли самоучастие',
          generali: 'Самоучастие различно от ОУ',
          instinct: null, ozk: 'Самоучастие' },
      },
      {
        id: 'deductible_details',
        label: 'Размер / вид на самоучастие',
        type: 'text',
        placeholder: '1000 лв. / 1%',
        mapping: { bulstrad: 'Размер на самоучастие', generali: 'Размер на самоучастие', instinct: null, ozk: 'Размер самоучастие' },
      },
    ],
  },
]

export type FormData = Record<string, string | number | undefined>
