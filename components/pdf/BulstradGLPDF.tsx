'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapGLFormDataForInsurer } from '@/lib/gl-mappings'
import type { GLFormData } from '@/lib/gl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const BLUE = '#0B3D91'

const S = StyleSheet.create({
  /* Page */
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#000',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLogo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BLUE,
  },
  headerInsurer: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BLUE,
    textAlign: 'right',
  },
  headerHr: {
    borderBottom: '1 solid #000',
    marginBottom: 10,
  },

  /* Title */
  titleBlock: {
    textAlign: 'center',
    marginBottom: 14,
  },
  titleLine: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formCode: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    marginTop: 3,
  },

  /* Section headers */
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1 solid #000',
    paddingBottom: 3,
    marginTop: 12,
    marginBottom: 8,
  },

  /* Table */
  table: {
    border: '1 solid #000',
    marginBottom: 6,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderBottom: '0.5 solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #000',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  cellLabel: {
    fontSize: 8,
    padding: 4,
    width: '40%',
    borderRight: '0.5 solid #000',
  },
  cellValue: {
    fontSize: 8,
    padding: 4,
    flex: 1,
    fontWeight: 'bold',
  },
  cellHeaderLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 4,
    width: '40%',
    borderRight: '0.5 solid #000',
  },
  cellHeaderValue: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 4,
    flex: 1,
  },
  cellHalf: {
    fontSize: 8,
    padding: 4,
    width: '25%',
    borderRight: '0.5 solid #000',
  },
  cellHalfValue: {
    fontSize: 8,
    padding: 4,
    width: '25%',
    fontWeight: 'bold',
    borderRight: '0.5 solid #000',
  },
  cellHalfValueLast: {
    fontSize: 8,
    padding: 4,
    width: '25%',
    fontWeight: 'bold',
  },
  cellThird: {
    fontSize: 8,
    padding: 4,
    flex: 1,
    borderRight: '0.5 solid #000',
    textAlign: 'center',
  },
  cellThirdLast: {
    fontSize: 8,
    padding: 4,
    flex: 1,
    textAlign: 'center',
  },

  /* Bilingual label */
  lblBg: {
    fontSize: 8,
  },
  lblEn: {
    fontSize: 7,
    color: '#555',
    fontStyle: 'italic',
  },

  /* Declaration */
  declaration: {
    fontSize: 8,
    color: '#333',
    marginTop: 14,
    lineHeight: 1.5,
  },

  /* Signatures */
  sigRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 20,
  },
  sigBlock: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 8,
    color: '#555',
    marginBottom: 28,
  },
  sigLine: {
    borderTop: '0.5 solid #000',
    paddingTop: 3,
  },
  sigName: {
    fontSize: 8,
    color: '#666',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: '#888',
    borderTop: '0.5 solid #ccc',
    paddingTop: 4,
  },
  footerCenter: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  footerRight: {
    fontSize: 8,
    color: '#888',
    textAlign: 'right',
  },
})

/* Helper: checkbox rendering */
function chk(val: string | undefined, match: string): string {
  if (!val) return '[ ]'
  return val.toLowerCase() === match.toLowerCase() ? '[X]' : '[ ]'
}

/* Bilingual label */
function BiLabel({ bg, en }: { bg: string; en: string }) {
  return (
    <View>
      <Text style={S.lblBg}>{bg}</Text>
      <Text style={S.lblEn}>{en}</Text>
    </View>
  )
}

/* Table row with bilingual label + value */
function FieldRow({ bg, en, value, isLast }: { bg: string; en: string; value: string; isLast?: boolean }) {
  return (
    <View style={isLast ? S.tableRowLast : S.tableRow}>
      <View style={S.cellLabel}>
        <BiLabel bg={bg} en={en} />
      </View>
      <Text style={S.cellValue}>{value}</Text>
    </View>
  )
}

interface Props {
  formData: GLFormData
  clientName: string
}

export function BulstradGLPDF({ formData, clientName }: Props) {
  const d = mapGLFormDataForInsurer(formData, 'bulstrad')
  const f = (id: string) =>
    d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')

  const date = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document title={`Булстрад Отговорност — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* ── HEADER ── */}
        <View style={S.headerRow} fixed>
          <Text style={S.headerLogo}>InsureUnify</Text>
          <Text style={S.headerInsurer}>ЗЕАД "БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
        </View>
        <View style={S.headerHr} fixed />

        {/* ── TITLE ── */}
        <View style={S.titleBlock}>
          <Text style={S.titleLine}>ВЪПРОСНИК ЗА ЗАСТРАХОВКА "ОТГОВОРНОСТ НА РАБОТОДАТЕЛЯ"</Text>
          <Text style={S.titleLine}>QUESTIONNAIRE — EMPLOYERS' LIABILITY INSURANCE</Text>
          <Text style={S.formCode}>Формуляр: vpr-1330 · Дата: {date}</Text>
        </View>

        {/* ── SECTION A: ЗАСТРАХОВАН / INSURED ── */}
        <Text style={S.sectionHeader}>А. ЗАСТРАХОВАН / INSURED</Text>

        <View style={S.table}>
          <View style={S.tableRowHeader}>
            <Text style={S.cellHeaderLabel}>Поле / Field</Text>
            <Text style={S.cellHeaderValue}>Стойност / Value</Text>
          </View>
          <FieldRow bg="Застрахован" en="Insured" value={f('gl_company_name')} />
          <FieldRow bg="ЕИК, БУЛСТАТ" en="UIC" value={f('gl_eik')} />
          <FieldRow bg="Адрес" en="Address" value={f('gl_address')} />
          <View style={S.tableRow}>
            <View style={S.cellHalf}>
              <BiLabel bg="Тел." en="Phone" />
            </View>
            <Text style={S.cellHalfValue}>{f('gl_phone')}</Text>
            <View style={S.cellHalf}>
              <BiLabel bg="Моб." en="Mobile" />
            </View>
            <Text style={S.cellHalfValueLast}>{f('gl_mobile')}</Text>
          </View>
          <FieldRow bg="Ел. поща" en="E-mail" value={f('gl_email')} />
          <FieldRow bg="Законен представител" en="Representative" value={f('gl_representative')} />
          <FieldRow bg="Описание на дейността" en="Description of activity" value={f('gl_activity')} />
          <FieldRow bg="Код по КИД" en="CEA/ISIC code" value={f('gl_activity_code')} />
          <FieldRow bg="Уеб страница" en="Website" value={f('gl_website')} isLast />
        </View>

        {/* ── SECTION B: ИСТОРИЯ / HISTORY ── */}
        <Text style={S.sectionHeader}>Б. ИСТОРИЯ / HISTORY</Text>

        <View style={S.table}>
          <View style={S.tableRowHeader}>
            <Text style={S.cellHeaderLabel}>Поле / Field</Text>
            <Text style={S.cellHeaderValue}>Стойност / Value</Text>
          </View>
          <FieldRow
            bg="Имали ли сте такава застраховка?"
            en="Have you held this insurance?"
            value={f('gl_prev_insurance')}
          />
          <FieldRow
            bg="Работниците застраховани?"
            en="Workers insured?"
            value={f('gl_workers_insured')}
          />
          <FieldRow
            bg="Задълж. з-ка Трудова злополука?"
            en="Labour accident cover?"
            value={f('gl_prev_labor_insurance')}
          />

          {/* Employees sub-header */}
          <View style={S.tableRowHeader}>
            <Text style={{ ...S.cellHeaderLabel, width: '100%' }}>Работници и служители / Employees</Text>
          </View>
          <View style={S.tableRow}>
            <View style={S.cellThird}>
              <Text style={S.lblBg}>Общо / Total</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_employees_count')}</Text>
            </View>
            <View style={S.cellThird}>
              <Text style={S.lblBg}>Администрация / Admin</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_employees_admin')}</Text>
            </View>
            <View style={S.cellThirdLast}>
              <Text style={S.lblBg}>Производство / Production</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_employees_production')}</Text>
            </View>
          </View>

          <FieldRow
            bg="Годишен фонд РЗ"
            en="Annual wage fund"
            value={f('gl_annual_wage_fund')}
          />

          {/* Revenue sub-header */}
          <View style={S.tableRowHeader}>
            <Text style={{ ...S.cellHeaderLabel, width: '100%' }}>Годишен приход / Total annual turnover</Text>
          </View>
          <View style={S.tableRow}>
            <View style={S.cellThird}>
              <Text style={S.lblBg}>2024</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_revenue_prev_year')}</Text>
            </View>
            <View style={S.cellThird}>
              <Text style={S.lblBg}>2025</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_revenue_current_year')}</Text>
            </View>
            <View style={S.cellThirdLast}>
              <Text style={S.lblBg}>2026 (оценка / est.)</Text>
              <Text style={{ ...S.lblBg, fontWeight: 'bold', marginTop: 2 }}>{f('gl_revenue_next_year')}</Text>
            </View>
          </View>

          <FieldRow
            bg="Годишен оборот"
            en="Annual turnover"
            value={f('gl_annual_turnover')}
          />
          <FieldRow
            bg="Предишен застраховател"
            en="Previous insurer"
            value={f('gl_prev_insurer')}
            isLast
          />
        </View>

        {/* ── SECTION D: ЛИМИТИ / LIMITS ── */}
        <Text style={S.sectionHeader}>Г. ЛИМИТИ / LIMITS</Text>

        <View style={S.table}>
          <View style={S.tableRowHeader}>
            <Text style={S.cellHeaderLabel}>Поле / Field</Text>
            <Text style={S.cellHeaderValue}>Стойност / Value</Text>
          </View>
          <FieldRow
            bg="Единичен лимит"
            en="Limit per occurrence"
            value={f('gl_single_limit')}
          />
          <FieldRow
            bg="Агрегатен лимит"
            en="Aggregate limit"
            value={f('gl_aggregate_limit')}
          />
          <FieldRow
            bg="Самоучастие"
            en="Deductible"
            value={f('gl_deductible')}
          />
          <View style={S.tableRow}>
            <View style={S.cellLabel}>
              <BiLabel bg="Валута" en="Currency" />
            </View>
            <View style={{ ...S.cellValue, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Text>{chk(f('gl_currency'), 'EUR')} EUR</Text>
              <Text>{chk(f('gl_currency'), 'BGN')} BGN</Text>
              <Text>{chk(f('gl_currency'), 'USD')} USD</Text>
            </View>
          </View>
          <FieldRow
            bg="Тер. валидност"
            en="Territorial validity"
            value={f('gl_territory')}
          />
          <View style={S.tableRow}>
            <View style={S.cellHalf}>
              <BiLabel bg="Начало" en="Inception" />
            </View>
            <Text style={S.cellHalfValue}>{f('gl_period_from')}</Text>
            <View style={S.cellHalf}>
              <BiLabel bg="Край" en="Expiry" />
            </View>
            <Text style={S.cellHalfValueLast}>{f('gl_period_to')}</Text>
          </View>
          <FieldRow
            bg="Ретроактивна дата"
            en="Retroactive date"
            value={f('gl_retroactive_date')}
            isLast
          />
        </View>

        {/* ── DECLARATION ── */}
        <Text style={S.declaration}>
          Декларирам, че посочените по-горе данни са верни и пълни. Запознат съм с условията на застраховката.{'\n'}
          I declare that the information provided above is true and complete. I am familiar with the insurance conditions.
        </Text>

        {/* ── SIGNATURES ── */}
        <View style={S.sigRow}>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Застрахован / Insured (подпис / signature):</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Дата / Date:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{date}</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER (fixed) ── */}
        <View style={S.footer} fixed>
          <Text> </Text>
          <Text style={S.footerCenter}>ЕИК 000694286 · гр. София 1000, пл. "Позитано" 5</Text>
          <Text
            style={S.footerRight}
            render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
