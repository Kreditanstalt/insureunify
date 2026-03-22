# InsureUnify — Unified Insurance Questionnaire Engine

## Какво е InsureUnify
SaaS платформа за застрахователни брокери в България. Брокерът попълва ЕДИН универсален въпросник и системата автоматично генерира попълнени PDF формуляри за всеки избран застраховател.

## Tech Stack
- **Frontend + Backend**: Next.js 14+ (App Router) deployed on Vercel
- **Database**: Supabase PostgreSQL (with JSONB for flexible schema data)
- **Auth**: Supabase Auth (email + magic link)
- **File Storage**: Supabase Storage (generated PDFs)
- **PDF Generation**: @react-pdf/renderer (client-side)
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
│   │   ├── page.tsx                           ← Dashboard + клас-селектор
│   │   └── new/
│   │       ├── page.tsx                       ← Имуществено застраховане
│   │       ├── general-liability/page.tsx     ← ОГО / Отговорност
│   │       ├── occupational-accident/page.tsx ← Трудова злополука
│   │       └── professional-liability/page.tsx ← Професионална отговорност
│   ├── review/[id]/page.tsx                   ← Преглед + изтегляне на PDF
│   └── api/
│       ├── eik/route.ts                       ← EIK lookup от ТР / CompanyBook
│       ├── eik/search/route.ts                ← Autocomplete по наименование
│       ├── generate-pdf/route.ts
│       └── submissions/route.ts
├── components/
│   ├── EikLookup.tsx                          ← Shared: EikInput, CompanyNameInput, useEikLookup
│   ├── QuestionnaireForm.tsx                  ← Имуществено застраховане
│   ├── GLQuestionnaireForm.tsx                ← ОГО / Обща гражданска отговорност
│   ├── OAQuestionnaireForm.tsx                ← Трудова злополука
│   ├── PLQuestionnaireForm.tsx                ← Професионална отговорност
│   ├── InsurerSelector.tsx                    ← Мулти-селект + logos
│   ├── ReviewOutput.tsx                       ← Преглед (property + GL + OA + PL)
│   ├── DownloadPDFButton.tsx                  ← PDF download (property + GL + OA + PL)
│   ├── SectionSidebar.tsx
│   ├── FieldRenderer.tsx
│   └── pdf/
│       ├── BulstradPDF.tsx                    ← Булстрад Имущество (2200-26)
│       ├── GeneraliPDF.tsx                    ← Дженерали ИМСБ
│       ├── InstinctPDF.tsx                    ← Инстинкт All Risks
│       ├── BulstradGLPDF.tsx                  ← Булстрад ОГО (vpr-1330)
│       ├── GeneraliGLPDF.tsx                  ← Дженерали ОГО
│       ├── AllianzOAPDF.tsx                   ← Алианц Трудова злополука (VAPROSNIK_0142)
│       ├── GroupamaOAPDF.tsx                  ← Групама Групова застраховка Злополука
│       ├── AxiomPLPDF.tsx                     ← Аксиом Проф. отговорност
│       ├── BulstradPLPDF.tsx                  ← Булстрад Проф. отговорност
│       └── EuroinsPLPDF.tsx                   ← Евроинс Проф. отговорност кл.08
├── lib/
│   ├── schema.ts                              ← Имущество: INSURERS (5), MASTER_SCHEMA, FieldMapping
│   ├── mappings.ts                            ← Имущество: mapFormDataForInsurer
│   ├── gl-schema.ts                           ← ОГО: GL_SCHEMA, GL_INSURERS
│   ├── gl-mappings.ts                         ← ОГО: mapGLFormDataForInsurer
│   ├── oa-schema.ts                           ← Трудова злополука: OA_SCHEMA, OA_INSURERS
│   ├── oa-mappings.ts                         ← Трудова злополука: mapOAFormDataForInsurer
│   ├── pl-schema.ts                           ← ПО: PL_SCHEMA, PL_INSURERS
│   ├── pl-mappings.ts                         ← ПО: mapPLFormDataForInsurer/All
│   ├── supabase.ts
│   └── utils.ts
├── public/
│   ├── fonts/
│   │   ├── Roboto-Regular.ttf
│   │   └── Roboto-Bold.ttf
│   └── logos/
│       ├── bulstrad.svg                       ← Логото на Булстрад (SVG)
│       ├── generali.svg                       ← Логото на Дженерали (SVG)
│       ├── instinct.svg                       ← Логото на Инстинкт (SVG)
│       ├── axiom.svg                          ← Логото на Аксиом (SVG)
│       ├── euroins.svg                        ← Логото на Евроинс (SVG)
│       ├── allianz.svg                        ← Логото на Алианц (SVG)
│       └── groupama.svg                       ← Логото на Групама (SVG)
└── supabase/
    ├── schema.sql
    ├── gl_migration.sql                       ← GL класове + insurer_mappings
    ├── oa_migration.sql                       ← OA класове + insurer_mappings
    └── pl_migration.sql                       ← PL класове + insurer_mappings
```

## Класове застраховане

### 1. Имуществено застраховане (`property`)
| Застраховател | Формуляр           | PDF компонент      |
|---------------|--------------------|--------------------|
| Булстрад      | 2200-26            | BulstradPDF        |
| Дженерали     | ИМСБ 07.01.2026    | GeneraliPDF        |
| Инстинкт      | AR-01082025        | InstinctPDF        |

### 2. Обща гражданска отговорност — ОГО (`general_liability`)
| Застраховател | Формуляр           | PDF компонент      |
|---------------|--------------------|--------------------|
| Дженерали     | ОГО-Дженерали      | GeneraliGLPDF      |
| Булстрад      | vpr-1330 (BG/EN)   | BulstradGLPDF      |

### 3. Трудова злополука (`occupational_accident`)
| Застраховател | Формуляр           | PDF компонент      |
|---------------|--------------------|--------------------|
| Алианц        | VAPROSNIK_0142     | AllianzOAPDF       |
| Групама       | Групама-Злополука  | GroupamaOAPDF      |

### 4. Професионална отговорност (`professional_liability`)
| Застраховател | Формуляр           | PDF компонент      |
|---------------|--------------------|--------------------|
| Аксиом        | PL-Application     | AxiomPLPDF         |
| Булстрад      | БВ-ПО              | BulstradPLPDF      |
| Евроинс       | ПО-кл.08           | EuroinsPLPDF       |

## EIK Auto-fill — Търговски регистър
Навсякъде където има поле ЕИК, системата автоматично зарежда данни:
- **API**: `/api/eik?eik=<9-13 цифри>` → company_name, address, email, phone, activity, nkid_code, representative
- **Autocomplete**: `/api/eik/search?name=<query>` → CompanyNameInput dropdown
- **Source**: CompanyBook.BG API (`COMPANYBOOK_API_KEY`) + hardcoded fallback registry
- **Shared hook**: `useEikLookup(setFormData, fieldMap)` в `components/EikLookup.tsx`
- **Използва се в**: QuestionnaireForm (property), GLQuestionnaireForm (GL), OAQuestionnaireForm (OA)

## Логота на застрахователи
SVG лого файлове в `/public/logos/<key>.svg` за всеки застраховател.
Показват се в: InsurerSelector, ReviewOutput.
За замяна с реалните лога — замени SVG файловете (препоръчително: 120×40px).

## UI/UX Конвенции
- **Език**: Български
- **Тема**: Light (bg-gray-50)
- **Цветове на застрахователи**:
  - Булстрад:  `#0B3D91` (тъмно синьо)
  - Дженерали: `#C8102E` (червено)
  - Инстинкт:  `#1B6B3A` (зелено)
  - Аксиом:    `#6B21A8` (лилаво)
  - Евроинс:   `#1E40AF` (синьо)
  - Алианц:    `#003781` (тъмно синьо)
  - Групама:   `#00A94F` (зелено)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
COMPANYBOOK_API_KEY=<api key от companybook.bg>
```

## Команди за разработка
```bash
npm run dev          # localhost:3000
npm run build        # production build
npx supabase db push # push schema to Supabase
```
