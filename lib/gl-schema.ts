/**
 * GL — Обща гражданска отговорност (General Liability / ОГО)
 *
 * Извлечен от:
 *   1. Дженерали — "Въпросник-предложение ОГО" (6 клаузи)
 *   2. Булстрад  — "Въпросник Отговорност на работодателя" (vpr-1330, BG/EN, 2025)
 */

import type { InsurerKey, SchemaField, SchemaSection } from './schema'

// ─── GL Insurer subset ────────────────────────────────────────────────────────

export type GLInsurerKey = 'generali' | 'bulstrad' | 'ozk'
export const GL_INSURER_KEYS: GLInsurerKey[] = ['generali', 'bulstrad', 'ozk']

export interface GLInsurerMeta {
  key: InsurerKey
  name: string
  color: string
  formCode: string
  description: string
  logo: string
}

export const GL_INSURERS: Record<GLInsurerKey, GLInsurerMeta> = {
  generali: {
    key:         'generali',
    name:        'Дженерали',
    color:       '#C8102E',
    formCode:    'ОГО-Дженерали',
    description: 'Въпросник-предложение ОГО · Дженерали Застраховане АД',
    logo:        '/logos/generali.jpg',
  },
  bulstrad: {
    key:         'bulstrad',
    name:        'Булстрад',
    color:       '#0B3D91',
    formCode:    'vpr-1330',
    description: 'Въпросник Отг. на работодателя · ЗЕАД Булстрад (BG/EN, 2025)',
    logo:        '/logos/bulstrad.svg',
  },
  ozk: {
    key:         'ozk',
    name:        'ОЗК',
    color:       '#1B3F8B',
    formCode:    'ОЗК-ОГО',
    description: 'Обща гражданска отговорност · ОЗК Застраховане АД',
    logo:        '/logos/ozk.png',
  },
}

export type GLFormData = Record<string, string | number | undefined>

// ─── Internal option lists ────────────────────────────────────────────────────

const YES_NO = [
  { value: 'yes', label: 'Да' },
  { value: 'no',  label: 'Не' },
]

const CURRENCY_OPTS = [
  { value: 'EUR', label: 'EUR — Евро' },
]

// ─────────────────────────────────────────────────────────────────────────────
// GL Master Schema — 6 секции, ~57 полета
// ─────────────────────────────────────────────────────────────────────────────

export const GL_SCHEMA: SchemaSection[] = [

  // ═══════════════════════════════════════════════════════════
  // Секция 1: Данни за кандидата
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gl_applicant',
    label: 'Данни за кандидата',
    shortLabel: 'Кандидат',
    icon: '👤',
    fields: [
      {
        id: 'gl_company_name', label: 'Наименование', type: 'text', required: true,
        placeholder: 'Фирма ЕООД / Иван Иванов',
        mapping: { generali: 'Кандидат за застраховане', bulstrad: 'Застрахован / Insured' },
      } satisfies SchemaField,
      {
        id: 'gl_eik', label: 'ЕИК / ЕГН', type: 'text', required: true,
        placeholder: '123456789',
        mapping: { generali: 'ЕИК / ЕГН', bulstrad: 'ЕИК, БУЛСТАТ / UIC' },
      } satisfies SchemaField,
      {
        id: 'gl_city', label: 'Град', type: 'text', required: true,
        placeholder: 'София',
        mapping: { generali: 'Град', bulstrad: 'Град' },
      } satisfies SchemaField,
      {
        id: 'gl_address', label: 'Адрес', type: 'text', required: true,
        placeholder: 'ул. / бул., номер, етаж',
        mapping: { generali: 'Адрес на управление', bulstrad: 'Адрес / Address' },
      } satisfies SchemaField,
      {
        id: 'gl_phone', label: 'Телефон', type: 'text', required: true,
        placeholder: '+359 2 …',
        mapping: { generali: 'Тел / Факс.', bulstrad: 'Телефонен номер / Phone number' },
      } satisfies SchemaField,
      {
        id: 'gl_mobile', label: 'Мобилен телефон', type: 'text', required: false,
        placeholder: '+359 88 …',
        mapping: { generali: 'моб. тел.', bulstrad: 'Мобилен телефон / Mobile phone' },
      } satisfies SchemaField,
      {
        id: 'gl_email', label: 'Ел. поща', type: 'text', required: true,
        placeholder: 'office@firma.bg',
        mapping: { generali: 'e-mail', bulstrad: 'Електронна поща / e-mail' },
      } satisfies SchemaField,
      {
        id: 'gl_representative', label: 'Представляван от', type: 'text', required: false,
        placeholder: 'Иван Иванов',
        mapping: { generali: 'Представляван от', bulstrad: 'Имена на законен представител / Representative' },
      } satisfies SchemaField,
      {
        id: 'gl_position', label: 'Длъжност', type: 'text', required: false,
        placeholder: 'Управител',
        mapping: { generali: 'Длъжност' },
      } satisfies SchemaField,
      {
        id: 'gl_activity', label: 'Основна дейност', type: 'select', required: true,
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
        mapping: { generali: 'Основна дейност', bulstrad: 'Описание на Дейността / Description of insured activity' },
      } satisfies SchemaField,
      {
        id: 'gl_activity_code', label: 'Код по КИД/НКИД', type: 'text', required: false,
        placeholder: '47.11',
        mapping: { bulstrad: 'Код на Дейността по КИД / CEA/ISIC code' },
      } satisfies SchemaField,
      {
        id: 'gl_year_founded', label: 'Година на основаване', type: 'text', required: false,
        placeholder: '2010',
        mapping: { generali: 'Година на основаване' },
      } satisfies SchemaField,
      {
        id: 'gl_website', label: 'Уеб сайт', type: 'text', required: false,
        placeholder: 'https://firma.bg',
        mapping: { generali: 'Web-site', bulstrad: 'Уеб страница / Website' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 2: Избор на покритие / клаузи (Дженерали)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gl_coverage',
    label: 'Избор на покритие',
    shortLabel: 'Покритие',
    icon: '☑️',
    fields: [
      {
        id: 'gl_cover_employer', label: 'Отговорност на работодателя',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива щети на служители при трудова злополука. При Булстрад — основно покритие.',
        mapping: { generali: 'Желая покритие — Отговорност на работодателя' },
      } satisfies SchemaField,
      {
        id: 'gl_cover_activity', label: 'Отговорност за дейността',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива щети на трети лица от вашата дейност.',
        mapping: { generali: 'Желая покритие — Отговорност за дейността' },
      } satisfies SchemaField,
      {
        id: 'gl_cover_product', label: 'Отговорност за продукта',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива щети причинени от вашите продукти.',
        mapping: { generali: 'Желая покритие — Отговорност за продукта' },
      } satisfies SchemaField,
      {
        id: 'gl_cover_tenant', label: 'Отговорност на наемателя',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива щети на наетия имот.',
        mapping: { generali: 'Желая покритие — Отговорност на наемателя' },
      } satisfies SchemaField,
      {
        id: 'gl_cover_pollution', label: 'Инцидентно замърсяване',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива внезапно замърсяване на околната среда.',
        mapping: { generali: 'Желая покритие — Инцидентно замърсяване' },
      } satisfies SchemaField,
      {
        id: 'gl_cover_repair', label: 'Ремонтна дейност',
        type: 'select', required: false, options: YES_NO,
        helpText: 'Покрива щети при извършване на ремонтни дейности.',
        mapping: { generali: 'Желая покритие — Ремонтна дейност' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 3: Отговорност на работодателя
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gl_employer',
    label: 'Отговорност на работодателя',
    shortLabel: 'Работодател',
    icon: '👷',
    fields: [
      {
        id: 'gl_employees_count', label: 'Брой работници и служители — общо',
        type: 'number', required: true, placeholder: '25',
        mapping: { generali: 'Брой на вашите служители и работници', bulstrad: 'Общо / Total лица' },
      } satisfies SchemaField,
      {
        id: 'gl_employees_admin', label: 'в т.ч. администрация',
        type: 'number', required: false, placeholder: '5',
        mapping: { bulstrad: 'Администрация / Administrative' },
      } satisfies SchemaField,
      {
        id: 'gl_employees_production', label: 'в т.ч. производство / обслужване',
        type: 'number', required: false, placeholder: '20',
        mapping: { bulstrad: 'Производство / Production' },
      } satisfies SchemaField,
      {
        id: 'gl_annual_wage_fund', label: 'Годишен фонд „Работна заплата" (изминала год.)',
        type: 'number', required: true, placeholder: '500000',
        mapping: { generali: 'Годишен фонд Работна заплата (изминала год.)', bulstrad: 'Годишен фонд работна заплата / Annual wage fund' },
      } satisfies SchemaField,
      {
        id: 'gl_wage_fund_forecast', label: 'Прогнозен фонд „Работна заплата" (настояща год.)',
        type: 'number', required: false, placeholder: '550000',
        mapping: { generali: 'Прогнозен фонд Работна заплата (настояща год.)' },
      } satisfies SchemaField,
      {
        id: 'gl_wage_currency', label: 'Валута на фонда',
        type: 'select', required: false, options: CURRENCY_OPTS,
        mapping: { bulstrad: '☐ EUR (фонд)' },
      } satisfies SchemaField,
      {
        id: 'gl_work_accidents_5y', label: 'Трудови злополуки (последните 5 год.)?',
        type: 'select', required: false, options: YES_NO,
        mapping: { generali: 'Случаи на трудова злополука (5 год.)?' },
      } satisfies SchemaField,
      {
        id: 'gl_claims_from_workers', label: 'Предявени искове от увредени лица?',
        type: 'select', required: false, options: YES_NO,
        mapping: { generali: 'Предявени искове от увредени лица?' },
      } satisfies SchemaField,
      {
        id: 'gl_claims_details', label: 'Брой, размер и вид на злополуката',
        type: 'textarea', required: false, placeholder: 'Опишете подробно',
        mapping: { generali: 'Брой, размер и вид на злополуката' },
      } satisfies SchemaField,
      {
        id: 'gl_workers_insured', label: 'Застраховани ли са работниците срещу злополука?',
        type: 'select', required: false, options: YES_NO,
        mapping: { generali: 'Застраховани ли са работниците?', bulstrad: 'Задължителна з-ка Трудова злополука' },
      } satisfies SchemaField,
      {
        id: 'gl_prev_insurer', label: 'Предишен застраховател',
        type: 'text', required: false, placeholder: 'Наименование на застрахователя',
        mapping: { generali: 'Предишен застраховател', bulstrad: 'Застраховател / Name of insurer' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 4: Отговорност за дейността (Дженерали; приходи — Булстрад)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gl_activity_section',
    label: 'Отговорност за дейността / Приходи',
    shortLabel: 'Дейност',
    icon: '🏭',
    fields: [
      {
        id: 'gl_activity_description', label: 'Подробно описание на дейността',
        type: 'textarea', required: false, placeholder: 'Опишете всички дейности, продукти, услуги',
        mapping: { generali: 'Опишете подробно вашата дейност' },
      } satisfies SchemaField,
      {
        id: 'gl_annual_turnover', label: 'Годишен търговски оборот (изминала год.)',
        type: 'number', required: false, placeholder: '1000000',
        mapping: { generali: 'Годишен търговски оборот (изминала год.)', bulstrad: 'Годишен приход / Total annual turnover' },
      } satisfies SchemaField,
      {
        id: 'gl_turnover_forecast', label: 'Прогнозен оборот (настояща год.)',
        type: 'number', required: false, placeholder: '1100000',
        mapping: { generali: 'Прогнозен оборот (настояща год.)' },
      } satisfies SchemaField,
      {
        id: 'gl_revenue_prev_year', label: 'Приход предходна година (2024)',
        type: 'number', required: false, placeholder: '900000',
        mapping: { bulstrad: 'Приход 2024' },
      } satisfies SchemaField,
      {
        id: 'gl_revenue_current_year', label: 'Приход текуща година (2025)',
        type: 'number', required: false, placeholder: '1000000',
        mapping: { bulstrad: 'Приход 2025' },
      } satisfies SchemaField,
      {
        id: 'gl_revenue_next_year', label: 'Оценка за предстоящата година (2026)',
        type: 'number', required: false, placeholder: '1100000',
        mapping: { bulstrad: 'Оценка 2026' },
      } satisfies SchemaField,
      {
        id: 'gl_revenue_currency', label: 'Валута на приходите',
        type: 'select', required: false, options: CURRENCY_OPTS,
        mapping: { bulstrad: '☐ EUR (приходи)' },
      } satisfies SchemaField,
      {
        id: 'gl_premises_city', label: 'Град (помещения)',
        type: 'text', required: false, placeholder: 'София',
        mapping: { generali: 'Град (помещения)' },
      } satisfies SchemaField,
      {
        id: 'gl_premises_address', label: 'Адрес на помещенията',
        type: 'text', required: false, placeholder: 'ул. / бул., номер',
        mapping: { generali: 'Местонахождение на помещенията' },
      } satisfies SchemaField,
      {
        id: 'gl_premises_type', label: 'Вид помещение (сграда/открита площ) в m²',
        type: 'text', required: false, placeholder: 'Склад 500 m², Офис 200 m²',
        mapping: { generali: 'Вид помещение (сграда/площ) в m²' },
      } satisfies SchemaField,
      {
        id: 'gl_public_access', label: 'Достъп на външни лица',
        type: 'text', required: false, placeholder: 'свободно / с пропуск / друг',
        mapping: { generali: 'Достъп на външни лица' },
      } satisfies SchemaField,
      {
        id: 'gl_last_elec_inspection', label: 'Последна проверка на ел. инсталация',
        type: 'text', required: false, placeholder: 'месец/година',
        mapping: { generali: 'Последна проверка на ел. инсталация' },
      } satisfies SchemaField,
      {
        id: 'gl_last_plumbing_check', label: 'Последна проверка на ВиК',
        type: 'text', required: false, placeholder: 'месец/година',
        mapping: { generali: 'Последна проверка на ВиК' },
      } satisfies SchemaField,
      {
        id: 'gl_heating_type', label: 'Начин на отопление',
        type: 'text', required: false, placeholder: 'централно / локално / ток / газ',
        mapping: { generali: 'Начин на отопление' },
      } satisfies SchemaField,
      {
        id: 'gl_fire_equipment', label: 'Средства за пожарогасене',
        type: 'text', required: false, placeholder: 'пожарогасители, хидранти, …',
        mapping: { generali: 'Средства за пожарогасене' },
      } satisfies SchemaField,
      {
        id: 'gl_hazardous_materials', label: 'Експлозиви, химикали, радиоизотопи?',
        type: 'select', required: false, options: YES_NO,
        mapping: { generali: 'Експлозиви, химикали, радиоизотопи?' },
      } satisfies SchemaField,
      {
        id: 'gl_third_party_claims_5y', label: 'Щети на клиенти/посетители (5 год.)?',
        type: 'select', required: false, options: YES_NO,
        mapping: { generali: 'Щети на клиенти/посетители (5 год.)?' },
      } satisfies SchemaField,
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // Секция 5: Лимити и договор
  // ═══════════════════════════════════════════════════════════
  {
    id: 'gl_contract',
    label: 'Лимити и договор',
    shortLabel: 'Договор',
    icon: '📄',
    fields: [
      {
        id: 'gl_single_limit', label: 'Лимит за едно събитие',
        type: 'number', required: true, placeholder: '100000',
        mapping: { generali: 'Лимит за едно събитие', bulstrad: 'Единичен лимит / Limit per one occurrence' },
      } satisfies SchemaField,
      {
        id: 'gl_aggregate_limit', label: 'Агрегатен лимит',
        type: 'number', required: true, placeholder: '200000',
        mapping: { generali: 'В агрегат', bulstrad: 'Агрегатен лимит / Aggregate limit' },
      } satisfies SchemaField,
      {
        id: 'gl_deductible', label: 'Самоучастие',
        type: 'text', required: false, placeholder: '500 EUR или 5%',
        mapping: { generali: 'Самоучастие', bulstrad: 'Самоучастие / Deductible' },
      } satisfies SchemaField,
      {
        id: 'gl_currency', label: 'Валута',
        type: 'select', required: true, options: CURRENCY_OPTS,
        mapping: { generali: 'Валута', bulstrad: '☐ EUR (лимити)' },
      } satisfies SchemaField,
      {
        id: 'gl_territory', label: 'Териториална валидност',
        type: 'select', required: false,
        options: [
          { value: 'bg', label: 'Република България' },
          { value: 'bg_eu', label: 'България + ЕС' },
          { value: 'bg_eu_third', label: 'България + ЕС + трети страни' },
          { value: 'worldwide', label: 'Целият свят' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: { bulstrad: 'Териториална валидност / Territorial validity' },
      } satisfies SchemaField,
      {
        id: 'gl_period_from', label: 'Начална дата',
        type: 'date', required: false,
        mapping: { bulstrad: 'Начало / Inception date' },
      } satisfies SchemaField,
      {
        id: 'gl_period_to', label: 'Крайна дата',
        type: 'date', required: false,
        mapping: { bulstrad: 'Край / Expiry date' },
      } satisfies SchemaField,
      {
        id: 'gl_retroactive_date', label: 'Ретроактивна дата',
        type: 'date', required: false,
        mapping: { bulstrad: 'Ретроактивна дата / Retroactive date' },
      } satisfies SchemaField,
      {
        id: 'gl_prev_insurance', label: 'Имали ли сте такава застраховка преди?',
        type: 'select', required: false, options: YES_NO,
        mapping: { bulstrad: 'Имали ли сте действаща/предишна такава застраховка' },
      } satisfies SchemaField,
      {
        id: 'gl_prev_labor_insurance', label: 'Задължителна з-ка Трудова злополука (действаща/предишна)?',
        type: 'select', required: false, options: YES_NO,
        mapping: { bulstrad: 'Действаща/предишна Задължителна з-ка Трудова злополука' },
      } satisfies SchemaField,
    ],
  },
]
