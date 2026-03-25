/**
 * OA — Трудова злополука (Occupational Accident)
 *
 * Извлечен от:
 *   1. Алианц България — "Въпросник-заявление за задължителна застраховка Трудова злополука"
 *      (ЗАД Алианц България, формуляр VAPROSNIK_0142)
 *   2. Групама — "Въпросник за сключване на Групова застраховка Злополука"
 *      (xlsx, Sheet2)
 */

import type { SchemaField, SchemaSection } from './schema'

// ─── OA Insurer subset ────────────────────────────────────────────────────────

export type OAInsurerKey = 'allianz' | 'groupama' | 'ozk'
export const OA_INSURER_KEYS: OAInsurerKey[] = ['allianz', 'groupama', 'ozk']

export interface OAInsurerMeta {
  key:         OAInsurerKey
  name:        string
  color:       string
  formCode:    string
  description: string
  logo:        string
}

export const OA_INSURERS: Record<OAInsurerKey, OAInsurerMeta> = {
  allianz: {
    key:         'allianz',
    name:        'Алианц',
    color:       '#003781',
    formCode:    'VAPROSNIK_0142',
    description: 'Задължителна з-ка Трудова злополука · ЗАД Алианц България',
    logo:        '/logos/allianz.svg',
  },
  groupama: {
    key:         'groupama',
    name:        'Групама',
    color:       '#00A94F',
    formCode:    'Групама-Злополука',
    description: 'Групова застраховка Злополука · Групама Застраховане ЕАД',
    logo:        '/logos/groupama.png',
  },
  ozk: {
    key:         'ozk',
    name:        'ОЗК',
    color:       '#1B3F8B',
    formCode:    'ОЗК-Злополука',
    description: 'Трудова злополука · ОЗК Застраховане АД',
    logo:        '/logos/ozk.png',
  },
}

export type OAFormData = Record<string, string | number | undefined>

// ─── Internal option lists ────────────────────────────────────────────────────

const YES_NO = [
  { value: 'yes', label: 'Да' },
  { value: 'no',  label: 'Не' },
]

const CURRENCY_OPTS = [
  { value: 'EUR', label: 'EUR — Евро' },
]

const INSURANCE_TYPE_OPTS = [
  { value: 'mandatory', label: 'Задължителна (по Наредба)' },
  { value: 'voluntary', label: 'Доброволна' },
]

const TEMP_PERIOD_OPTS = [
  { value: 'above_11', label: 'над 11 дни' },
  { value: 'above_21', label: 'над 21 дни' },
  { value: 'above_31', label: 'над 31 дни' },
]

const TERRITORY_OPTS = [
  { value: 'bg',      label: 'Р България' },
  { value: 'abroad',  label: 'Чужбина' },
  { value: 'bg_plus', label: 'Р България + Чужбина' },
]

// ─────────────────────────────────────────────────────────────────────────────
// OA Master Schema — 5 секции
// ─────────────────────────────────────────────────────────────────────────────

export const OA_SCHEMA: SchemaSection[] = [

  // ═══════════════════════════════════════════════════════════
  // Секция 1: Данни за застраховащия
  // ═══════════════════════════════════════════════════════════
  {
    id:         'oa_applicant',
    label:      'Данни за застраховащия',
    shortLabel: 'Кандидат',
    icon:       '👤',
    fields: [
      {
        id: 'oa_company_name', label: 'Наименование на фирмата', type: 'text', required: true,
        placeholder: 'Фирма ЕООД',
        mapping: { allianz: 'Застраховащ (наименование на фирмата)', groupama: 'Кандидат за Застраховане' },
      } satisfies SchemaField,
      {
        id: 'oa_eik', label: 'ЕИК', type: 'text', required: true,
        placeholder: '123456789',
        mapping: { allianz: 'ЕИК', groupama: 'ЕИК' },
      } satisfies SchemaField,
      {
        id: 'oa_city', label: 'Град', type: 'text', required: true,
        placeholder: 'София',
        mapping: { allianz: 'Град', groupama: 'Град' },
      } satisfies SchemaField,
      {
        id: 'oa_address', label: 'Адрес', type: 'text', required: true,
        placeholder: 'ул. / бул., номер, етаж',
        mapping: { allianz: 'Адрес (гр./с., ул., №)', groupama: 'Адрес за кореспонденция' },
      } satisfies SchemaField,
      {
        id: 'oa_phone', label: 'Телефон', type: 'text', required: true,
        placeholder: '+359 2 …',
        mapping: { allianz: 'Тел.', groupama: 'тел.' },
      } satisfies SchemaField,
      {
        id: 'oa_representative', label: 'Представляван от', type: 'text', required: false,
        placeholder: 'Иван Иванов',
        mapping: { groupama: 'Представляван от' },
      } satisfies SchemaField,
      {
        id: 'oa_activity', label: 'Основна дейност', type: 'select', required: true,
        options: [
          { value: 'retail', label: 'Търговия на дребно' },
          { value: 'wholesale', label: 'Търговия на едро' },
          { value: 'manufacturing', label: 'Производство' },
          { value: 'construction', label: 'Строителство' },
          { value: 'transport', label: 'Транспорт' },
          { value: 'services', label: 'Услуги' },
          { value: 'distribution', label: 'Дистрибуция' },
          { value: 'it', label: 'IT / Технологии' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: { allianz: 'Основна дейност на фирмата', groupama: 'Предмет на дейност' },
      } satisfies SchemaField,
      {
        id: 'oa_activity_code', label: 'Код по НКИД', type: 'text', required: false,
        placeholder: '41.20',
        mapping: { allianz: 'Код по НКИД' },
      } satisfies SchemaField,
      {
        id: 'oa_secondary_activity', label: 'Спомагателни дейности', type: 'text', required: false,
        placeholder: 'Спомагателна дейност + НКИД код',
        mapping: { allianz: 'Спомагателни дейности + Код по НКИД' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 2: Данни за застраховката
  // ═══════════════════════════════════════════════════════════
  {
    id:         'oa_insurance',
    label:      'Данни за застраховката',
    shortLabel: 'Застраховка',
    icon:       '📋',
    fields: [
      {
        id: 'oa_persons_count', label: 'Брой застраховани лица', type: 'number', required: true,
        placeholder: '20',
        mapping: { allianz: 'Брой лица - служители на трудов договор', groupama: '___ лица (от поименен списък)' },
      } satisfies SchemaField,
      {
        id: 'oa_insurance_type', label: 'Вид застраховка', type: 'select', required: true,
        options: INSURANCE_TYPE_OPTS,
        mapping: { allianz: 'Вид: Задължителна (съгл. Наредба)', groupama: 'Пакет А: Задължителна / Пакет Б: Доброволна' },
      } satisfies SchemaField,
      {
        id: 'oa_period_from', label: 'Начална дата', type: 'date', required: true,
        mapping: { allianz: 'от 00.00 часа на ___ г.', groupama: 'Начало' },
      } satisfies SchemaField,
      {
        id: 'oa_period_to', label: 'Крайна дата', type: 'date', required: false,
        mapping: { allianz: 'до 24.00 часа на ___ г.' },
      } satisfies SchemaField,
      {
        id: 'oa_period_months', label: 'Срок (месеци)', type: 'number', required: false,
        placeholder: '12',
        mapping: { groupama: 'За срок от ___ месеца (от 1 до 12)' },
      } satisfies SchemaField,
      {
        id: 'oa_currency', label: 'Валута', type: 'select', required: true,
        options: CURRENCY_OPTS,
        mapping: { allianz: 'Лева', groupama: 'Лева / Евро' },
      } satisfies SchemaField,
      {
        id: 'oa_territory', label: 'Териториална валидност', type: 'select', required: false,
        options: TERRITORY_OPTS,
        mapping: { allianz: 'Р България / Чужбина' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 3: Покрити рискове и суми
  // ═══════════════════════════════════════════════════════════
  {
    id:         'oa_coverage',
    label:      'Покрити рискове и суми',
    shortLabel: 'Покрития',
    icon:       '🛡️',
    fields: [
      {
        id: 'oa_cover_death', label: 'Смърт от трудова злополука', type: 'select', required: true,
        options: YES_NO,
        mapping: { allianz: 'Смърт от трудова злополука — съгласно Наредбата (т.1)', groupama: 'Смърт и трайно намалена работоспособност' },
      } satisfies SchemaField,
      {
        id: 'oa_cover_permanent_disability', label: 'Трайно намалена работоспособност', type: 'select', required: false,
        options: YES_NO,
        helpText: 'При Алианц — % от застрахователната сума по т.1',
        mapping: { allianz: 'Трайно намалена работоспособност — % от з.с. (т.2)' },
      } satisfies SchemaField,
      {
        id: 'oa_cover_temporary_disability', label: 'Временна неработоспособност', type: 'select', required: true,
        options: YES_NO,
        mapping: { allianz: 'Временна неработоспособност (т.3)', groupama: 'Временна неработоспособност' },
      } satisfies SchemaField,
      {
        id: 'oa_temp_disability_limit', label: 'Доброволен лимит за временна НТ (лв.)', type: 'number', required: false,
        placeholder: '1000',
        helpText: 'Алианц: 500 / 1000 / 1500 / 2000 лв.',
        mapping: { allianz: 'Доброволен лимит (500/1000/1500/2000 лв.)' },
      } satisfies SchemaField,
      {
        id: 'oa_temp_disability_period', label: 'Период за временна неработоспособност', type: 'select', required: false,
        options: TEMP_PERIOD_OPTS,
        mapping: { groupama: 'над 11 дни / над 21 дни / над 31 дни' },
      } satisfies SchemaField,
      {
        id: 'oa_cover_domestic_accident', label: 'Покритие от битова злополука', type: 'select', required: false,
        options: YES_NO,
        helpText: 'Само Групама — избираемо допълнително покритие',
        mapping: { groupama: 'От битова злополука (избираемо)' },
      } satisfies SchemaField,
      {
        id: 'oa_si_per_person', label: 'Застрахователна сума на едно лице', type: 'number', required: false,
        placeholder: '140000',
        helpText: 'Задължителна: 7 × годишна брутна заплата (по Наредба)',
        mapping: { allianz: '7 × год. брутна заплата (по Наредба)', groupama: 'Застрахователна сума на едно лице' },
      } satisfies SchemaField,
      {
        id: 'oa_monthly_wage_fund', label: 'Месечен фонд работна заплата (лв.)', type: 'number', required: true,
        placeholder: '50000',
        mapping: { allianz: 'Месечен фонд работна заплата', groupama: 'Общ фонд работна заплата' },
      } satisfies SchemaField,
      {
        id: 'oa_high_salary', label: 'Има ли служител с МБЗ > 27 000 лв.?', type: 'select', required: false,
        options: YES_NO,
        mapping: { allianz: 'Има ли МБЗ/1 лице > 27 000 лв? НЕ/ДА' },
      } satisfies SchemaField,
      {
        id: 'oa_si_basis', label: 'База за изчисляване на з.с.', type: 'text', required: false,
        placeholder: 'Общ фонд р.з. / Една МБЗ',
        helpText: 'Групама Пакет А — изберете база',
        mapping: { groupama: 'База: Общ фонд р.з. / Една МБЗ' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 4: Допълнителни покрития (само Групама)
  // ═══════════════════════════════════════════════════════════
  {
    id:         'oa_options',
    label:      'Допълнителни покрития',
    shortLabel: 'Допълнителни',
    icon:       '➕',
    fields: [
      {
        id: 'oa_opt_medical_expenses', label: 'Медицински разходи', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Медицински разходи (от тр./бит. злоп.)' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_fractures', label: 'Фрактури', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Фрактури (от тр./бит. злоп.)' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_burns', label: 'Изгаряния', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Изгаряния (от тр./бит. злоп.)' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_medical_transport', label: 'Медицинско транспортиране', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Медицинско транспортиране' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_surgery', label: 'Оперативно лечение', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Оперативно лечение' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_dental', label: 'Спешна стоматологична помощ', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Спешна стоматологична помощ' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_hospitalization', label: 'Хоспитализация', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Хоспитализация' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_recovery', label: 'Възстановяване след хоспитализация', type: 'select', required: false,
        options: YES_NO,
        mapping: { groupama: 'Възстановяване след хоспитализация' },
      } satisfies SchemaField,
      {
        id: 'oa_opt_si_per_person', label: 'З.С. за допълнителни покрития (на лице)', type: 'number', required: false,
        placeholder: '5000',
        mapping: { groupama: 'З.С. за допълнителни покрития (на лице)' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 5: Оценка на риска (само Алианц)
  // ═══════════════════════════════════════════════════════════
  {
    id:         'oa_risk',
    label:      'Оценка на риска',
    shortLabel: 'Риск',
    icon:       '⚠️',
    fields: [
      {
        id: 'oa_major_accidents_10y', label: 'Големи аварии (последните 10 год.)?', type: 'select', required: true,
        options: YES_NO,
        mapping: { allianz: 'Настъпвали ли са големи аварии (т.3)' },
      } satisfies SchemaField,
      {
        id: 'oa_accidents_details', label: 'Описание на авариите', type: 'textarea', required: false,
        placeholder: 'Моля опишете обстоятелствата',
        mapping: { allianz: 'Описание на авариите (т.3)' },
      } satisfies SchemaField,
      {
        id: 'oa_registered_accidents_3y', label: 'Регистрирани трудови злополуки (последните 3 год.)?', type: 'select', required: true,
        options: YES_NO,
        mapping: { allianz: 'Има ли регистрирани трудови злополуки (т.4)' },
      } satisfies SchemaField,
      {
        id: 'oa_accidents_death_count', label: 'в т.ч. довели до смърт (бр.)', type: 'number', required: false,
        placeholder: '0',
        mapping: { allianz: 'Смърт ___ бр. (т.4)' },
      } satisfies SchemaField,
      {
        id: 'oa_accidents_disability_count', label: 'в т.ч. довели до инвалидност (бр.)', type: 'number', required: false,
        placeholder: '0',
        mapping: { allianz: 'Инвалидност ___ бр. (т.4)' },
      } satisfies SchemaField,
      {
        id: 'oa_accidents_temp_count', label: 'в т.ч. временна нетрудоспособност (бр.)', type: 'number', required: false,
        placeholder: '0',
        mapping: { allianz: 'Временна нетрудоспособност ___ бр. (т.4)' },
      } satisfies SchemaField,
      {
        id: 'oa_safety_prescriptions', label: 'Предписания от контролни органи (3 год.)?', type: 'select', required: true,
        options: YES_NO,
        mapping: { allianz: 'Правени ли са предписания от контролни органи (т.5)' },
      } satisfies SchemaField,
      {
        id: 'oa_safety_details', label: 'Срокове и степен на изпълнение', type: 'textarea', required: false,
        placeholder: 'Опишете сроковете и степента на изпълнение',
        mapping: { allianz: 'Срокове и степен на изпълнение на предписанията (т.5)' },
      } satisfies SchemaField,
      {
        id: 'oa_shift_work', label: 'Работа на смени?', type: 'select', required: false,
        options: YES_NO,
        mapping: { allianz: 'Работи ли се на смени (т.6)' },
      } satisfies SchemaField,
      {
        id: 'oa_shifts_count', label: 'Брой смени', type: 'number', required: false,
        placeholder: '2',
        mapping: { allianz: 'Брой работни смени (т.6)' },
      } satisfies SchemaField,
      {
        id: 'oa_max_concentration', label: 'Макс. концентрация на работна сила (бр.)', type: 'number', required: false,
        placeholder: '50',
        helpText: 'Максимален брой работници на едно място в едно и също време',
        mapping: { allianz: 'Максимален брой работници на едно място (т.7)' },
      } satisfies SchemaField,
    ],
  },
]
