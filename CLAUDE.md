# InsureUnify — Unified Insurance Questionnaire Engine

## Какво е InsureUnify
SaaS платформа за застрахователни брокери в България. Решава конкретен проблем: когато брокер иска да котира застраховка при 3 различни компании, трябва да попълни 3 отделни въпросника с 60-70% припокриващи се полета. InsureUnify позволява попълване на ЕДИН универсален въпросник, който автоматично генерира попълнени формуляри за всеки избран застраховател.

## Tech Stack
- **Frontend + Backend**: Next.js 14+ (App Router) deployed on Vercel
- **Database**: Supabase PostgreSQL (with JSONB for flexible schema data)
- **Auth**: Supabase Auth (email + magic link)
- **File Storage**: Supabase Storage (generated PDFs, uploaded questionnaires)
- **PDF Generation**: @react-pdf/renderer (serverless on Vercel API routes)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Архитектура на проекта
```
insureunify/
├── CLAUDE.md
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── new/
│   │       ├── page.tsx                       ← Имуществено застраховане
│   │       └── professional-liability/page.tsx ← Професионална отговорност
│   ├── review/[id]/page.tsx
│   └── api/
│       ├── generate-pdf/route.ts
│       ├── submissions/route.ts
│       ├── eik/route.ts
│       └── eik/search/route.ts
├── components/
│   ├── QuestionnaireForm.tsx      ← Форма Имуществено застраховане
│   ├── PLQuestionnaireForm.tsx    ← Форма Професионална отговорност
│   ├── InsurerSelector.tsx        ← availableInsurers prop за филтриране
│   ├── SectionSidebar.tsx
│   ├── FieldRenderer.tsx
│   ├── ReviewOutput.tsx           ← insuranceClass prop
│   ├── DownloadPDFButton.tsx      ← insuranceClass prop
│   └── pdf/
│       ├── BulstradPDF.tsx        ← Булстрад Имущество
│       ├── GeneraliPDF.tsx        ← Женерали ИМСБ
│       ├── InstinctPDF.tsx        ← Инстинкт All Risks
│       ├── AxiomPLPDF.tsx         ← Аксиом Проф. отговорност
│       ├── BulstradPLPDF.tsx      ← Булстрад Проф. отговорност
│       └── EuroinsPLPDF.tsx       ← Евроинс Проф. отговорност кл.08
├── lib/
│   ├── supabase.ts
│   ├── schema.ts        ← InsurerKey (bulstrad|generali|instinct|axiom|euroins)
│   ├── mappings.ts      ← Имуществено застраховане mappings
│   ├── pl-schema.ts     ← PL_SCHEMA (4 секции, ~36 полета), PL_INSURERS
│   └── pl-mappings.ts   ← mapPLFormDataForInsurer/All
├── supabase/
│   ├── schema.sql           ← Основна схема
│   └── pl_migration.sql     ← INSERT за ПО insurers + mappings
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Поддържани класове застраховане

### 1. Имуществено застраховане (property)
- **Маршрут**: `/dashboard/new`
- **Застрахователи**: Булстрад (2200-26), Женерали (ИМСБ), Инстинкт (AR-01082025)
- **Схема**: `lib/schema.ts → MASTER_SCHEMA` (9 секции, 90+ полета)
- **Mappings**: `lib/mappings.ts`
- **PDF**: `components/pdf/BulstradPDF, GeneraliPDF, InstinctPDF`

### 2. Професионална отговорност (professional_liability) ← НОВО
- **Маршрут**: `/dashboard/new/professional-liability`
- **Застрахователи**: Аксиом (PL-Application), Булстрад (БВ-ПО), Евроинс (ПО-кл.08)
- **Схема**: `lib/pl-schema.ts → PL_SCHEMA` (4 секции, 36 полета)
- **Mappings**: `lib/pl-mappings.ts`
- **PDF**: `components/pdf/AxiomPLPDF, BulstradPLPDF, EuroinsPLPDF`
- **SQL**: `supabase/pl_migration.sql`

## Схема на данните (professional_liability)

### Секция 1: Данни за кандидата (pl_applicant)
| ID | Label | Type | Аксиом | Булстрад | Евроинс |
|----|-------|------|--------|----------|---------|
| pl_company_name | Наименование | text | ✓ | ✓ | ✓ |
| pl_eik | ЕИК / ЕГН | text | ✓ | ✓ | ✓ |
| pl_address | Адрес | text | ✓ | ✓ | ✓ |
| pl_phone | Телефон | text | ✓ | ✓ | ✓ |
| pl_email | Ел. поща | text | ✓ | — | ✓ |
| pl_activity | Предмет на дейност | text | ✓ | — | ✓ |

### Секция 2: Застраховано лице (pl_insured) — 11 полета
pl_insured_name, pl_insured_eik, pl_insured_address, pl_insured_profession,
pl_activity_start_date, pl_employees_count, pl_services_description (Евроинс),
pl_annual_revenue (Евроинс), pl_subcontractors (Евроинс),
pl_professional_org (Аксиом), pl_professional_org_name (Аксиом)

### Секция 3: Застрахователна история (pl_history) — 10 полета
pl_prev_insurance, pl_prev_insurer (Евроинс), pl_prev_period (Евроинс),
pl_claims_paid, pl_claims_details, pl_insurance_declined,
pl_valid_other_insurance (Аксиом), pl_pending_claims, pl_pending_claims_details,
pl_known_circumstances

### Секция 4: Данни за договора (pl_contract) — 9 полета
pl_single_limit, pl_aggregate_limit, pl_territory, pl_deductible,
pl_period_from, pl_period_to, pl_retroactive_date (Евроинс),
pl_payment_type (Аксиом), pl_currency (Евроинс)

## Цветове на застрахователи
- **Булстрад**: `#0B3D91`
- **Женерали**: `#C8102E`
- **Инстинкт**: `#1B6B3A`
- **Аксиом**: `#6B21A8` (лилаво)
- **Евроинс**: `#1E40AF` (тъмно синьо)

## insuranceClass в localStorage submissions
```typescript
StoredSubmission = {
  id: string
  clientName: string
  selectedInsurers: InsurerKey[]
  formData: FormData | PLFormData
  insuranceClass: 'property' | 'professional_liability'  // ← Ново поле
  createdAt: string
}
```
Полето `insuranceClass` определя кои mappings и PDF templates да се използват при преглед.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
COMPANYBOOK_API_KEY=...
```

## Команди за разработка
```bash
npm run dev          # localhost:3000
npm run build        # production build
npx supabase db push # push schema to Supabase
```

## SQL миграция за Profesionalna otgovornost
Изпълни `supabase/pl_migration.sql` в Supabase SQL Editor.
