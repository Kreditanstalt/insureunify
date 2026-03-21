# InsureUnify — Unified Insurance Questionnaire Engine

## Какво е InsureUnify
SaaS платформа за застрахователни брокери в България. Решава конкретен проблем: когато брокер иска да котира имуществена застраховка при 3 различни компании, трябва да попълни 3 отделни въпросника с 60-70% припокриващи се полета. InsureUnify позволява попълване на ЕДИН универсален въпросник, който автоматично генерира попълнени формуляри за всеки избран застраховател.

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
│   │   └── new/page.tsx
│   ├── review/[id]/page.tsx
│   └── api/
│       ├── generate-pdf/route.ts
│       └── submissions/route.ts
├── components/
│   ├── QuestionnaireForm.tsx
│   ├── InsurerSelector.tsx
│   ├── SectionSidebar.tsx
│   ├── FieldRenderer.tsx
│   └── ReviewOutput.tsx
├── lib/
│   ├── supabase.ts
│   ├── schema.ts
│   └── mappings.ts
├── supabase/
│   └── schema.sql
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## UI/UX Конвенции
- **Език**: Български
- **Тема**: Dark theme по подразбиране
- **Цветове на застрахователи**:
  - Булстрад: `#0B3D91`
  - Женерали: `#C8102E`
  - Инстинкт: `#1B6B3A`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Команди за разработка
```bash
npm run dev          # localhost:3000
npm run build        # production build
npx supabase db push # push schema to Supabase
```
