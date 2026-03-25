import type { InsurerKey, SchemaField, SchemaSection } from './schema'

// ─── PL Insurer keys ────────────────────────────────────────────────────────
export type PLInsurerKey = 'axiom' | 'bulstrad' | 'euroins' | 'ozk'
export const PL_INSURER_KEYS: PLInsurerKey[] = ['axiom', 'bulstrad', 'euroins', 'ozk']

export const PL_INSURERS: Record<PLInsurerKey, { key: InsurerKey; name: string; color: string; formCode: string; description: string; logo: string }> = {
  axiom:    { key: 'axiom',    name: 'Аксиом',   color: '#1E2D6B', formCode: 'PL-Application', description: 'Предложение-въпросник ПО · ЗК Аксиом АД',  logo: '/logos/axiom.jpg' },
  bulstrad: { key: 'bulstrad', name: 'Булстрад', color: '#0B3D91', formCode: 'БВ-ПО',          description: 'Заявление-въпросник ПО · ЗЕАД Булстрад',   logo: '/logos/bulstrad.svg' },
  euroins:  { key: 'euroins',  name: 'Евроинс',  color: '#1E3A8A', formCode: 'ПО-кл.08',       description: 'Въпросник-предложение ПО кл.08 · ЗД Евроинс', logo: '/logos/euroins.png' },
  ozk:      { key: 'ozk',     name: 'ОЗК',      color: '#1B3F8B', formCode: 'ОЗК-ПО',         description: 'Професионална отговорност · ОЗК Застраховане АД', logo: '/logos/ozk.png' },
}

export type PLFormData = Record<string, string | number | undefined>

const YES_NO = [
  { value: 'yes', label: 'Да' },
  { value: 'no',  label: 'Не' },
]

const PAYMENT_OPTS = [
  { value: 'once',       label: 'Еднократно' },
  { value: 'installment', label: 'Разсрочено' },
]

const CURRENCY_OPTS = [
  { value: 'EUR', label: 'EUR — Евро' },
]

// ─── Helper to cast FieldMapping keys ───────────────────────────────────────
// We use the full FieldMapping interface (bulstrad/generali/instinct/axiom/euroins)
// generali and instinct will always be null for PL fields.

export const PL_SCHEMA: SchemaSection[] = [

  // ─── Секция 1: Данни за кандидата ─────────────────────────────────────────
  {
    id: 'pl_applicant',
    label: 'Данни за кандидата',
    shortLabel: 'Кандидат',
    icon: '👤',
    fields: [
      {
        id: 'pl_company_name',
        label: 'Наименование',
        type: 'text',
        required: true,
        placeholder: 'Фирма ЕООД / Иван Иванов',
        mapping: {
          axiom:    'Ime / наименование',
          bulstrad: 'Застрахован (наименование)',
          euroins:  'Ime/Наименование',
        },
      } satisfies SchemaField,
      {
        id: 'pl_eik',
        label: 'ЕИК / ЕГН',
        type: 'text',
        required: true,
        placeholder: '123456789',
        mapping: {
          axiom:    'ЕИК/ЕГН',
          bulstrad: 'Булстат / ЕГН',
          euroins:  'ЕГН/ЛНЧ/ЕИК',
        },
      } satisfies SchemaField,
      {
        id: 'pl_city',
        label: 'Град',
        type: 'text',
        required: true,
        placeholder: 'София',
        mapping: {
          axiom:    'City',
          bulstrad: 'Град',
          euroins:  'Град',
        },
      } satisfies SchemaField,
      {
        id: 'pl_address',
        label: 'Адрес',
        type: 'text',
        required: true,
        placeholder: 'ул. / бул., номер, етаж',
        mapping: {
          axiom:    'Адрес',
          bulstrad: 'Адрес (по съдебна регистрация)',
          euroins:  'Седалище и адрес на управление',
        },
      } satisfies SchemaField,
      {
        id: 'pl_phone',
        label: 'Телефон',
        type: 'text',
        required: true,
        placeholder: '+359 88 888 8888',
        mapping: {
          axiom:    'телефон',
          bulstrad: 'Тел./факс',
          euroins:  'Тел.',
        },
      } satisfies SchemaField,
      {
        id: 'pl_email',
        label: 'Ел. поща',
        type: 'text',
        required: true,
        placeholder: 'office@firma.bg',
        mapping: {
          axiom:   'E-mail',
          euroins: 'Email',
        },
      } satisfies SchemaField,
      {
        id: 'pl_activity',
        label: 'Предмет на дейност / Професия',
        type: 'text',
        required: true,
        placeholder: 'Счетоводни услуги / Адвокат / Архитект',
        mapping: {
          axiom:   'Предмет на дейност / професия',
          euroins: 'Професия/дейност',
        },
      } satisfies SchemaField,
    ],
  },

  // ─── Секция 2: Данни за застрахованото лице ───────────────────────────────
  {
    id: 'pl_insured',
    label: 'Застраховано лице',
    shortLabel: 'Застраховано лице',
    icon: '🏢',
    fields: [
      {
        id: 'pl_insured_name',
        label: 'Застраховано лице (наименование)',
        type: 'text',
        required: true,
        placeholder: 'Попълнете ако е различно от кандидата',
        mapping: {
          axiom:   'Ime / наименование (Застрахован)',
          euroins: 'Ime/Наименование (Застраховано лице)',
        },
      } satisfies SchemaField,
      {
        id: 'pl_insured_eik',
        label: 'ЕИК на застрахованото лице',
        type: 'text',
        required: false,
        placeholder: '123456789',
        mapping: {
          axiom:   'ЕИК/ЕГН (Застрахован)',
          euroins: 'ЕГН/ЛНЧ/ЕИК (Застраховано лице)',
        },
      } satisfies SchemaField,
      {
        id: 'pl_insured_address',
        label: 'Адрес на застрахованото лице',
        type: 'text',
        required: false,
        placeholder: 'гр. София, ул. …',
        mapping: {
          axiom:   'Адрес (Застрахован)',
          euroins: 'Седалище и адрес (Застраховано лице)',
        },
      } satisfies SchemaField,
      {
        id: 'pl_insured_profession',
        label: 'Професия / дейност',
        type: 'select',
        required: true,
        options: [
          { value: 'accountant', label: 'Счетоводител / Одитор' },
          { value: 'insurance_broker', label: 'Застрахователен брокер / агент' },
          { value: 'consultant', label: 'Консултант' },
          { value: 'lawyer', label: 'Юрист / Адвокат' },
          { value: 'architect', label: 'Проектант / Архитект' },
          { value: 'engineer', label: 'Инженер' },
          { value: 'doctor', label: 'Лекар / Медицинска дейност' },
          { value: 'it_specialist', label: 'IT специалист' },
          { value: 'appraiser', label: 'Оценител' },
          { value: 'property_manager', label: 'Управител на имоти' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: {
          axiom:   'Предмет на дейност / професия (Застрахован)',
          euroins: 'Професия/дейност',
        },
      } satisfies SchemaField,
      {
        id: 'pl_activity_start_date',
        label: 'Начална дата на упражняване на професията',
        type: 'date',
        required: false,
        mapping: {
          axiom: 'Начална дата на упражняване на проф. дейност',
        },
      } satisfies SchemaField,
      {
        id: 'pl_employees_count',
        label: 'Брой осигурени лица по ТПО',
        type: 'number',
        required: false,
        placeholder: '5',
        mapping: {
          axiom:   'Брой осигурени лица по трудово правоотношение',
          euroins: 'Брой лица по трудово правоотношение',
        },
      } satisfies SchemaField,
      {
        id: 'pl_services_description',
        label: 'Описание на предоставяните услуги',
        type: 'textarea',
        required: false,
        placeholder: 'Опишете подробно видовете услуги',
        mapping: {
          euroins: 'Описание на предоставяните услуги',
        },
      } satisfies SchemaField,
      {
        id: 'pl_annual_revenue',
        label: 'Годишен оборот (EUR)',
        type: 'number',
        required: false,
        placeholder: '100000',
        mapping: {
          euroins: 'Годишен оборот',
        },
      } satisfies SchemaField,
      {
        id: 'pl_subcontractors',
        label: 'Използвате ли подизпълнители?',
        type: 'select',
        required: false,
        options: YES_NO,
        mapping: {
          euroins: 'Използвате ли подизпълнители?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_professional_org',
        label: 'Членство в професионална организация',
        type: 'select',
        required: false,
        options: [
          { value: 'none', label: 'Не' },
          { value: 'ides', label: 'ИДЕС' },
          { value: 'kab', label: 'КАБ' },
          { value: 'kai', label: 'КАИ' },
          { value: 'sak', label: 'САК' },
          { value: 'bakb', label: 'БАКБ' },
          { value: 'other', label: 'Друга' },
        ],
        mapping: {
          axiom: 'Член на проф. организация?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_professional_org_name',
        label: 'Наименование на организацията',
        type: 'text',
        required: false,
        placeholder: 'ИКИБ / КАБ / …',
        mapping: {
          axiom: 'Наименование на проф. организация',
        },
      } satisfies SchemaField,
    ],
  },

  // ─── Секция 3: Застрахователна история ────────────────────────────────────
  {
    id: 'pl_history',
    label: 'Застрахователна история',
    shortLabel: 'История',
    icon: '📋',
    fields: [
      {
        id: 'pl_prev_insurance',
        label: 'Имали ли сте сключена ПО застраховка?',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: {
          axiom:   'Имали ли сте до сега сключена застраховка ПО?',
          euroins: 'Има ли сключена застраховка ПО?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_prev_insurer',
        label: 'Предишен застраховател',
        type: 'text',
        required: false,
        placeholder: 'Наименование на застрахователя',
        mapping: {
          euroins: 'Застраховател (предишна ПО)',
        },
      } satisfies SchemaField,
      {
        id: 'pl_prev_period',
        label: 'Период на предишна застраховка',
        type: 'text',
        required: false,
        placeholder: 'напр. 01.01.2023 – 31.12.2023',
        mapping: {
          euroins: 'Период на предишна застраховка',
        },
      } satisfies SchemaField,
      {
        id: 'pl_claims_paid',
        label: 'Изплащани ли са обезщетения по ПО?',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: {
          axiom:   'Изплащано ли е обезщетение по застраховка ПО?',
          euroins: 'Изплащани ли са обезщетения?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_claims_details',
        label: 'Подробности за обезщетенията',
        type: 'textarea',
        required: false,
        placeholder: 'Причини, размер, дата на събитието',
        mapping: {
          axiom:   '(ако да) подробности за обезщетенията',
          euroins: 'Причини и размер на обезщетенията',
        },
      } satisfies SchemaField,
      {
        id: 'pl_insurance_declined',
        label: 'Отказвана ли Ви е ПО застраховка?',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: {
          axiom:   'Отказвано ли ви е сключване на застраховка ПО?',
          euroins: 'Отказвана ли Ви е застраховка ПО?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_valid_other_insurance',
        label: 'Имате ли валидна ПО при друга компания?',
        type: 'select',
        required: false,
        options: YES_NO,
        mapping: {
          axiom: 'Имате ли валидна ПО при друга компания?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_pending_claims',
        label: 'Предявени искове / съдебни дела (3 год.)?',
        type: 'select',
        required: true,
        options: YES_NO,
        mapping: {
          axiom:   'Предявени искове / съдебни дела (3 год.)?',
          euroins: 'Предявени искове към Вас?',
        },
      } satisfies SchemaField,
      {
        id: 'pl_pending_claims_details',
        label: 'Подробности за исковете',
        type: 'textarea',
        required: false,
        placeholder: 'Страни, размер, статус на делото',
        mapping: {
          axiom:   '(ако да) подробности за искове',
          euroins: 'Подробности за исковете',
        },
      } satisfies SchemaField,
      {
        id: 'pl_known_circumstances',
        label: 'Известни ли са Ви обстоятелства за бъдещи искове?',
        type: 'select',
        required: false,
        options: YES_NO,
        mapping: {
          axiom:   'Обстоятелства за бъдещи искове?',
          euroins: 'Има ли обстоятелства за бъдещи искове?',
        },
      } satisfies SchemaField,
    ],
  },

  // ─── Секция 4: Данни за договора ─────────────────────────────────────────
  {
    id: 'pl_contract',
    label: 'Данни за договора',
    shortLabel: 'Договор',
    icon: '📄',
    fields: [
      {
        id: 'pl_single_limit',
        label: 'Единичен лимит (за едно събитие)',
        type: 'number',
        required: true,
        placeholder: '100000',
        mapping: {
          axiom:    'Единичен лимит на отговорност (за едно събитие)',
          bulstrad: 'Лимит единичен',
          euroins:  'Лимит за едно събитие',
        },
      } satisfies SchemaField,
      {
        id: 'pl_aggregate_limit',
        label: 'Агрегатен лимит (за всички събития)',
        type: 'number',
        required: true,
        placeholder: '200000',
        mapping: {
          axiom:    'Агрегатен лимит (за всички събития)',
          bulstrad: 'Лимит агрегатен',
          euroins:  'Агрегатен лимит',
        },
      } satisfies SchemaField,
      {
        id: 'pl_territory',
        label: 'Териториална валидност',
        type: 'select',
        required: true,
        options: [
          { value: 'bg', label: 'Република България' },
          { value: 'bg_eu', label: 'България + ЕС' },
          { value: 'bg_eu_third', label: 'България + ЕС + трети страни' },
          { value: 'worldwide', label: 'Целият свят' },
          { value: 'other', label: 'Друго' },
        ],
        mapping: {
          axiom:    'Териториална валидност',
          bulstrad: 'Територия на валидност',
          euroins:  'Териториална валидност',
        },
      } satisfies SchemaField,
      {
        id: 'pl_territory_other',
        label: 'Уточнете територията',
        type: 'text',
        required: false,
        placeholder: 'Опишете териториалния обхват',
        mapping: {},
      } satisfies SchemaField,
      {
        id: 'pl_deductible',
        label: 'Самоучастие',
        type: 'text',
        required: false,
        placeholder: 'напр. 1 000 EUR или 10%',
        mapping: {
          axiom:    'Самоучастие',
          bulstrad: 'Самоучастие',
          euroins:  'Самоучастие',
        },
      } satisfies SchemaField,
      {
        id: 'pl_period_from',
        label: 'Начална дата',
        type: 'date',
        required: true,
        mapping: {
          axiom:    'Срок от',
          bulstrad: 'Срок от',
          euroins:  'Начало',
        },
      } satisfies SchemaField,
      {
        id: 'pl_period_to',
        label: 'Крайна дата',
        type: 'date',
        required: true,
        mapping: {
          axiom:    'Срок до',
          bulstrad: 'Срок до',
          euroins:  'Край',
        },
      } satisfies SchemaField,
      {
        id: 'pl_retroactive_date',
        label: 'Ретроактивна дата',
        type: 'date',
        required: false,
        mapping: {
          euroins: 'Ретроактивна дата',
        },
      } satisfies SchemaField,
      {
        id: 'pl_payment_type',
        label: 'Начин на плащане',
        type: 'select',
        required: true,
        options: PAYMENT_OPTS,
        mapping: {
          axiom: 'Начин на плащане',
        },
      } satisfies SchemaField,
      {
        id: 'pl_currency',
        label: 'Валута',
        type: 'select',
        required: false,
        options: CURRENCY_OPTS,
        mapping: {
          euroins: 'Валута',
        },
      } satisfies SchemaField,
    ],
  },
]
