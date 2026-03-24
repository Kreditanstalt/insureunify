'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapPLFormDataForInsurer } from '@/lib/pl-mappings'
import type { PLFormData } from '@/lib/pl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',   fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const DARK_BLUE = '#1E40AF'

const S = StyleSheet.create({
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
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    width: '40%',
  },
  value: {
    fontSize: 9,
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 1,
  },
  row2col: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  halfCol: {
    flex: 1,
    flexDirection: 'row',
  },
  halfLabel: {
    fontSize: 9,
    width: '46%',
  },
  halfValue: {
    fontSize: 9,
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    paddingBottom: 1,
  },
  checkRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  checkLabel: {
    fontSize: 9,
    flex: 1,
  },
  checkOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  checkOption: {
    fontSize: 9,
  },
  detailText: {
    fontSize: 8,
    fontStyle: 'italic',
    marginLeft: 16,
    marginBottom: 4,
  },
  // Table styles
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCellLabel: {
    fontSize: 8,
    flex: 1,
    padding: '3 6',
    fontWeight: 'bold',
  },
  tableCellValue: {
    fontSize: 8,
    width: 160,
    padding: '3 6',
    borderLeftWidth: 0.5,
    borderLeftColor: '#000',
    borderLeftStyle: 'solid',
  },
  tableHeaderLabel: {
    fontSize: 8,
    flex: 1,
    padding: '3 6',
    fontWeight: 'bold',
  },
  tableHeaderValue: {
    fontSize: 8,
    width: 160,
    padding: '3 6',
    fontWeight: 'bold',
    borderLeftWidth: 0.5,
    borderLeftColor: '#000',
    borderLeftStyle: 'solid',
  },
  signRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
  },
  signBlock: {
    flex: 1,
    borderTopWidth: 0.5,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    paddingTop: 4,
  },
  signLabel: {
    fontSize: 8,
    textAlign: 'center',
  },
})

interface Props {
  formData: PLFormData
  clientName: string
}

export function EuroinsPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'euroins')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '')
  const has = (id: string) => f(id) !== ''

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const check = (id: string, matchValue: string) => f(id) === matchValue ? '[X]' : '[ ]'

  function YesNoCheck({ label, id, detailId }: { label: string; id: string; detailId?: string }) {
    return (
      <View>
        <View style={S.checkRow}>
          <Text style={S.checkLabel}>{label}</Text>
          <View style={S.checkOptions}>
            <Text style={S.checkOption}>{check(id, 'Да')} Да</Text>
            <Text style={S.checkOption}>{check(id, 'Не')} Не</Text>
          </View>
        </View>
        {detailId && has(detailId) && (
          <Text style={S.detailText}>{f(detailId)}</Text>
        )}
      </View>
    )
  }

  const coverageRows = [
    ['Лимит за едно събитие', 'pl_single_limit'],
    ['Агрегатен лимит', 'pl_aggregate_limit'],
    ['Самоучастие', 'pl_deductible'],
    ['Териториална валидност', 'pl_territory'],
    ['Начало', 'pl_period_from'],
    ['Край', 'pl_period_to'],
    ['Ретроактивна дата', 'pl_retroactive_date'],
    ['Валута', 'pl_currency'],
  ].filter(([, id]) => has(id))

  return (
    <Document title={`Евроинс ПО -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Title */}
        <Text style={S.title}>ВЪПРОСНИК-ПРЕДЛОЖЕНИЕ &quot;ПРОФЕСИОНАЛНА ОТГОВОРНОСТ&quot; - Клауза 08</Text>
        <Text style={S.subtitle}>ЗД ЕВРОИНС АД · ЕИК: 121265113 · бул. &quot;Христофор Колумб&quot; 43, 1592 София</Text>

        {/* I. КАНДИДАТ ЗА ЗАСТРАХОВАНЕ */}
        <Text style={S.sectionHeader}>I. КАНДИДАТ ЗА ЗАСТРАХОВАНЕ</Text>
        <View style={S.row}>
          <Text style={S.label}>Наименование:</Text>
          <Text style={S.value}>{f('pl_company_name')}</Text>
        </View>
        <View style={S.row2col}>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>ЕИК:</Text>
            <Text style={S.halfValue}>{f('pl_eik')}</Text>
          </View>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>Телефон:</Text>
            <Text style={S.halfValue}>{f('pl_phone')}</Text>
          </View>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Адрес:</Text>
          <Text style={S.value}>{f('pl_address')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Ел. поща:</Text>
          <Text style={S.value}>{f('pl_email')}</Text>
        </View>

        {/* II. ЗАСТРАХОВАНО ЛИЦЕ / ДАННИ ЗА ДЕЙНОСТТА */}
        <Text style={S.sectionHeader}>II. ЗАСТРАХОВАНО ЛИЦЕ / ДАННИ ЗА ДЕЙНОСТТА</Text>
        <View style={S.row}>
          <Text style={S.label}>Наименование:</Text>
          <Text style={S.value}>{f('pl_insured_name')}</Text>
        </View>
        <View style={S.row2col}>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>ЕИК:</Text>
            <Text style={S.halfValue}>{f('pl_insured_eik')}</Text>
          </View>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>Адрес:</Text>
            <Text style={S.halfValue}>{f('pl_insured_address')}</Text>
          </View>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Професия / дейност:</Text>
          <Text style={S.value}>{f('pl_insured_profession')}</Text>
        </View>
        <View style={S.row2col}>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>Брой лица по ТПО:</Text>
            <Text style={S.halfValue}>{f('pl_employees_count')}</Text>
          </View>
          <View style={S.halfCol}>
            <Text style={S.halfLabel}>Годишен оборот:</Text>
            <Text style={S.halfValue}>{f('pl_annual_revenue')}</Text>
          </View>
        </View>
        {has('pl_services_description') && (
          <View style={S.row}>
            <Text style={S.label}>Описание на услугите:</Text>
            <Text style={S.value}>{f('pl_services_description')}</Text>
          </View>
        )}
        <View style={S.checkRow}>
          <Text style={S.checkLabel}>Използвате ли подизпълнители?</Text>
          <View style={S.checkOptions}>
            <Text style={S.checkOption}>{check('pl_subcontractors', 'Да')} Да</Text>
            <Text style={S.checkOption}>{check('pl_subcontractors', 'Не')} Не</Text>
          </View>
        </View>

        {/* III. ЗАСТРАХОВАТЕЛНА ИСТОРИЯ */}
        <Text style={S.sectionHeader}>III. ЗАСТРАХОВАТЕЛНА ИСТОРИЯ</Text>
        <YesNoCheck label="3.1 Сключена застраховка ПО?" id="pl_prev_insurance" />
        {has('pl_prev_insurer') && (
          <View style={S.row2col}>
            <View style={S.halfCol}>
              <Text style={S.halfLabel}>Застраховател:</Text>
              <Text style={S.halfValue}>{f('pl_prev_insurer')}</Text>
            </View>
            <View style={S.halfCol}>
              <Text style={S.halfLabel}>Период:</Text>
              <Text style={S.halfValue}>{f('pl_prev_period')}</Text>
            </View>
          </View>
        )}
        <YesNoCheck label="3.2 Изплащани ли са обезщетения?" id="pl_claims_paid" detailId="pl_claims_details" />
        <YesNoCheck label="3.3 Предявени искове към Вас?" id="pl_pending_claims" detailId="pl_pending_claims_details" />
        <YesNoCheck label="3.4 Отказвана ли Ви е застраховка ПО?" id="pl_insurance_declined" />
        <YesNoCheck label="3.5 Известни обстоятелства за бъдещи искове?" id="pl_known_circumstances" />

        {/* IV. ДАННИ ЗА ЗАСТРАХОВАТЕЛНОТО ПОКРИТИЕ */}
        <Text style={S.sectionHeader}>IV. ДАННИ ЗА ЗАСТРАХОВАТЕЛНОТО ПОКРИТИЕ</Text>
        <View style={S.table}>
          <View style={S.tableHeaderRow}>
            <Text style={S.tableHeaderLabel}>Параметър</Text>
            <Text style={S.tableHeaderValue}>Стойност</Text>
          </View>
          {coverageRows.map(([lbl, id], idx) => (
            <View key={id} style={idx < coverageRows.length - 1 ? S.tableRow : S.tableRowLast}>
              <Text style={S.tableCellLabel}>{lbl}</Text>
              <Text style={S.tableCellValue}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* Signatures */}
        <View style={S.signRow}>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Дата: {date}</Text>
            <Text style={S.signLabel}>Подпис и печат на кандидата</Text>
          </View>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Подпис на представител на ЗД Евроинс АД</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}
