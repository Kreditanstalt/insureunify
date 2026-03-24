'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapPLFormDataForInsurer } from '@/lib/pl-mappings'
import type { PLFormData } from '@/lib/pl-schema'

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

/* Table row helper */
function FieldRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={isLast ? S.tableRowLast : S.tableRow}>
      <Text style={S.cellLabel}>{label}</Text>
      <Text style={S.cellValue}>{value}</Text>
    </View>
  )
}

interface Props {
  formData: PLFormData
  clientName: string
}

export function BulstradPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'bulstrad')
  const f = (id: string) =>
    d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')

  const date = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document title={`Булстрад ПО — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* -- HEADER -- */}
        <View style={S.headerRow} fixed>
          <Text style={S.headerLogo}>InsureUnify</Text>
          <Text style={S.headerInsurer}>ЗЕАД "БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
        </View>
        <View style={S.headerHr} fixed />

        {/* -- TITLE -- */}
        <View style={S.titleBlock}>
          <Text style={S.titleLine}>
            ЗАЯВЛЕНИЕ-ВЪПРОСНИК за сключване на застраховка "ПРОФЕСИОНАЛНА ОТГОВОРНОСТ"
          </Text>
          <Text style={S.formCode}>Формуляр: БВ-ПО · Дата: {date}</Text>
        </View>

        {/* -- SECTION: ДАННИ ЗА ЗАСТРАХОВАНИЯ -- */}
        <Text style={S.sectionHeader}>ДАННИ ЗА ЗАСТРАХОВАНИЯ</Text>

        <View style={S.table}>
          <View style={S.tableRowHeader}>
            <Text style={S.cellHeaderLabel}>Поле</Text>
            <Text style={S.cellHeaderValue}>Стойност</Text>
          </View>
          <FieldRow label="Застрахован (пълно наименование)" value={f('pl_company_name')} />
          <FieldRow label="Булстат / ЕГН" value={f('pl_eik')} />
          <FieldRow label="Тел. / факс" value={f('pl_phone')} />
          <FieldRow label="Адрес (по съдебна регистрация)" value={f('pl_address')} isLast />
        </View>

        {/* -- SECTION: ДАННИ ЗА ЗАСТРАХОВАТЕЛНИЯ ДОГОВОР -- */}
        <Text style={S.sectionHeader}>ДАННИ ЗА ЗАСТРАХОВАТЕЛНИЯ ДОГОВОР</Text>

        <View style={S.table}>
          <View style={S.tableRowHeader}>
            <Text style={S.cellHeaderLabel}>Параметър</Text>
            <Text style={S.cellHeaderValue}>Стойност</Text>
          </View>
          <FieldRow label="Лимит единичен (за едно събитие)" value={f('pl_single_limit')} />
          <FieldRow label="Лимит агрегатен (за всички събития)" value={f('pl_aggregate_limit')} />
          <FieldRow label="Самоучастие" value={f('pl_deductible')} />
          <FieldRow label="Територия на валидност" value={f('pl_territory')} />
          <FieldRow label="Срок от" value={f('pl_period_from')} />
          <FieldRow label="Срок до" value={f('pl_period_to')} isLast />
        </View>

        {/* -- DECLARATION -- */}
        <Text style={S.declaration}>
          Заявявам, че всички обстоятелства в настоящото заявление са верни и пълни. Задължавам се при промяна в обстоятелствата незабавно да уведомя застрахователя.
        </Text>

        {/* -- SIGNATURES -- */}
        <View style={S.sigRow}>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Дата:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{date}</Text>
            </View>
          </View>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Подпис и печат на застрахования:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Подпис на брокер / агент:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}> </Text>
            </View>
          </View>
        </View>

        {/* -- FOOTER (fixed) -- */}
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
