'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapGLFormDataForInsurer } from '@/lib/gl-mappings'
import type { GLFormData } from '@/lib/gl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' },
  ],
})

const BLUE = '#0B3D91'

const S = StyleSheet.create({
  page:       { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  header:     { marginBottom: 12 },
  companyLine: { fontSize: 12, fontWeight: 700, color: BLUE, textAlign: 'center' },
  subLine:    { fontSize: 8, color: '#555', textAlign: 'center', marginTop: 2 },
  formCode:   { fontSize: 7.5, color: '#888', textAlign: 'right', marginBottom: 4 },
  title:      { fontSize: 10.5, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 14, borderTop: `1.5 solid ${BLUE}`, borderBottom: `1.5 solid ${BLUE}`, paddingVertical: 5 },
  secA:       { fontSize: 10, fontWeight: 700, color: BLUE, marginTop: 10, marginBottom: 6, textTransform: 'uppercase', borderBottom: `0.5 solid ${BLUE}`, paddingBottom: 2 },
  secLabel:   { fontSize: 9, fontWeight: 700, color: BLUE, marginTop: 8, marginBottom: 4 },
  row:        { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-end' },
  lbl:        { fontSize: 8.5, color: '#444', width: '44%' },
  lblBi:      { fontSize: 7.5, color: '#777', width: '44%', fontStyle: 'italic' },
  val:        { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2:       { flexDirection: 'row', gap: 10, marginBottom: 3.5, alignItems: 'flex-end' },
  lbl2:       { fontSize: 8.5, color: '#444', width: '26%' },
  val2:       { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  currency:   { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 3 },
  currBox:    { width: 10, height: 10, border: `1 solid #aaa`, fontSize: 8, textAlign: 'center' },
  currLabel:  { fontSize: 8.5, color: '#333' },
  divider:    { borderTop: `0.5 solid #ddd`, marginTop: 8, marginBottom: 4 },
  footer:     { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  note:       { fontSize: 7.5, color: '#888', marginTop: 4, fontStyle: 'italic' },
})

function CurrencySelector({ value }: { value: string }) {
  return (
    <View style={S.currency}>
      <View style={S.currBox}><Text>{value === 'BGN' ? 'X' : ' '}</Text></View>
      <Text style={S.currLabel}>BGN</Text>
      <View style={S.currBox}><Text>{value === 'EUR' ? 'X' : ' '}</Text></View>
      <Text style={S.currLabel}>EUR</Text>
    </View>
  )
}

interface Props { formData: GLFormData; clientName: string }

export function BulstradGLPDF({ formData, clientName }: Props) {
  const d  = mapGLFormDataForInsurer(formData, 'bulstrad')
  const f  = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document title={`Булстрад Отговорност -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <Text style={S.formCode}>Формуляр: vpr-1330 · Дата: {date}</Text>
        <View style={S.header}>
          <Text style={S.companyLine}>ЗЕАД "БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
          <Text style={S.subLine}>BULSTRAD VIENNA INSURANCE GROUP</Text>
          <Text style={S.subLine}>ЕИК 000694286 · гр. София 1000, пл. "Позитано" 5</Text>
          <Text style={S.title}>
            ВЪПРОСНИК ЗА ЗАСТРАХОВКА "ОТГОВОРНОСТ НА РАБОТОДАТЕЛЯ"{'\n'}
            QUESTIONNAIRE -- EMPLOYERS' LIABILITY INSURANCE
          </Text>
        </View>

        {/* Section A: Insured */}
        <Text style={S.secA}>Секция А. Застрахован / Section A. Insured</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Застрахован / Insured:</Text>
          <Text style={S.val}>{f('gl_company_name')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>ЕИК, БУЛСТАТ / UIC:</Text>
          <Text style={S.val}>{f('gl_eik')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Адрес / Address:</Text>
          <Text style={S.val}>{f('gl_address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Тел. / Phone:</Text><Text style={S.val2}>{f('gl_phone')}</Text>
          <Text style={S.lbl2}>Моб. / Mobile:</Text><Text style={S.val2}>{f('gl_mobile')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Ел. поща / e-mail:</Text>
          <Text style={S.val}>{f('gl_email')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Законен представител / Representative:</Text>
          <Text style={S.val}>{f('gl_representative')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Описание на дейността / Description:</Text>
          <Text style={S.val}>{f('gl_activity')}</Text>
        </View>
        {has('gl_activity_code') && (
          <View style={S.row}>
            <Text style={S.lbl}>Код по КИД / CEA/ISIC code:</Text>
            <Text style={S.val}>{f('gl_activity_code')}</Text>
          </View>
        )}
        {has('gl_website') && (
          <View style={S.row}><Text style={S.lbl}>Уеб страница / Website:</Text><Text style={S.val}>{f('gl_website')}</Text></View>
        )}

        <View style={S.divider} />

        {/* Section B: History */}
        <Text style={S.secA}>Секция Б. История / Section B. History</Text>

        {/* B.1 Previous insurance */}
        <Text style={S.secLabel}>В.1 Предишна застраховка / Previous cover</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Имали ли сте такава застраховка? / Have you held this insurance?</Text>
          <Text style={S.val}>{f('gl_prev_insurance')}</Text>
        </View>

        {/* B.2 Labour accident insurance */}
        <Text style={S.secLabel}>В.2 Задължителна з-ка Трудова злополука</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Работниците застраховани? / Workers insured?</Text>
          <Text style={S.val2}>{f('gl_workers_insured')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Задълж. з-ка Трудова злополука? / Labour accident cover?</Text>
          <Text style={S.val}>{f('gl_prev_labor_insurance')}</Text>
        </View>

        {/* B.3 Employees */}
        <Text style={S.secLabel}>В.3 Работници и служители / Employees</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Общо / Total:</Text><Text style={S.val2}>{f('gl_employees_count')}</Text>
          <Text style={S.lbl2}>Администрация / Admin:</Text><Text style={S.val2}>{f('gl_employees_admin')}</Text>
          <Text style={S.lbl2}>Производство / Prod.:</Text><Text style={S.val2}>{f('gl_employees_production')}</Text>
        </View>

        {/* B.4 Wage fund */}
        <Text style={S.secLabel}>В.4 Годишен фонд РЗ / Annual wage fund</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Годишен фонд РЗ / Annual wage fund:</Text>
          <Text style={S.val}>{f('gl_annual_wage_fund')}</Text>
        </View>
        <CurrencySelector value={f('gl_wage_currency') === '--' ? 'BGN' : f('gl_wage_currency')} />

        {/* B.5 Revenue */}
        <Text style={S.secLabel}>В.5 Годишен приход / Total annual turnover</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>2024:</Text><Text style={S.val2}>{f('gl_revenue_prev_year')}</Text>
          <Text style={S.lbl2}>2025:</Text><Text style={S.val2}>{f('gl_revenue_current_year')}</Text>
          <Text style={S.lbl2}>2026 (оценка):</Text><Text style={S.val2}>{f('gl_revenue_next_year')}</Text>
        </View>
        {has('gl_annual_turnover') && (
          <View style={S.row}><Text style={S.lbl}>Годишен приход / Total turnover:</Text><Text style={S.val}>{f('gl_annual_turnover')}</Text></View>
        )}
        <CurrencySelector value={f('gl_revenue_currency') === '--' ? 'BGN' : f('gl_revenue_currency')} />

        {has('gl_prev_insurer') && (
          <View style={S.row}><Text style={S.lbl}>Предишен застраховател / Previous insurer:</Text><Text style={S.val}>{f('gl_prev_insurer')}</Text></View>
        )}

        <View style={S.divider} />

        {/* Section G: Limits */}
        <Text style={S.secA}>Секция Г. Лимити / Section D. Limits</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Единичен лимит / Limit per occurrence:</Text>
          <Text style={S.val2}>{f('gl_single_limit')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Агрегатен лимит / Aggregate limit:</Text>
          <Text style={S.val2}>{f('gl_aggregate_limit')}</Text>
        </View>
        {has('gl_deductible') && (
          <View style={S.row}><Text style={S.lbl}>Самоучастие / Deductible:</Text><Text style={S.val}>{f('gl_deductible')}</Text></View>
        )}
        <CurrencySelector value={f('gl_currency') === '--' ? 'BGN' : f('gl_currency')} />
        {has('gl_territory') && (
          <View style={S.row}><Text style={S.lbl}>Тер. валидност / Territorial validity:</Text><Text style={S.val}>{f('gl_territory')}</Text></View>
        )}
        <View style={S.row2}>
          {has('gl_period_from') && <><Text style={S.lbl2}>Начало / Inception:</Text><Text style={S.val2}>{f('gl_period_from')}</Text></>}
          {has('gl_period_to')   && <><Text style={S.lbl2}>Край / Expiry:</Text><Text style={S.val2}>{f('gl_period_to')}</Text></>}
        </View>
        {has('gl_retroactive_date') && (
          <View style={S.row}><Text style={S.lbl}>Ретроактивна дата / Retroactive date:</Text><Text style={S.val}>{f('gl_retroactive_date')}</Text></View>
        )}

        <View style={S.divider} />

        {/* Declaration */}
        <Text style={{ fontSize: 8, color: '#555', marginTop: 6 }}>
          Декларирам, че посочените по-горе данни са верни и пълни. Запознат съм с условията на застраховката.{'\n'}
          I declare that the information provided above is true and complete.
        </Text>

        <View style={{ marginTop: 16, flexDirection: 'row', gap: 30 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#555' }}>Застрахован / Insured (подпис/signature):</Text>
            <View style={{ borderTop: '0.5 solid #aaa', marginTop: 24, paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, color: '#888' }}>{clientName}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#555' }}>Дата / Date:</Text>
            <View style={{ borderTop: '0.5 solid #aaa', marginTop: 24, paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, color: '#888' }}>{date}</Text>
            </View>
          </View>
        </View>

        <Text style={S.note}>Генерирано от InsureUnify · vpr-1330</Text>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>ЗЕАД Булстрад ВИГ · Отговорност на работодателя</Text>
          <Text>{clientName}</Text>
          <Text render={({ pageNumber, totalPages }) => `стр. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
