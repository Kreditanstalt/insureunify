'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapPLFormDataForInsurer } from '@/lib/pl-mappings'
import type { PLFormData } from '@/lib/pl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
})

const BLUE = '#0B3D91'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  companyLine: { fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'center' },
  companySubLine: { fontSize: 8, color: '#555', textAlign: 'center', marginTop: 2 },
  titleLine: { fontSize: 11, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 14, borderTop: `1.5 solid ${BLUE}`, borderBottom: `1.5 solid ${BLUE}`, paddingVertical: 5 },
  sectionHead: { fontSize: 9, fontWeight: 700, marginTop: 10, marginBottom: 5, color: BLUE },
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#444', width: '44%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 8, marginBottom: 3, alignItems: 'flex-end' },
  lbl2: { fontSize: 9, color: '#444', width: '28%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  // Contract table
  table: { marginTop: 8, border: `0.5 solid #999` },
  tHead: { flexDirection: 'row', backgroundColor: '#dbe4f5', borderBottom: `0.5 solid #999` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid #ddd` },
  tLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tVal: { width: 140, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  tHeadLabel: { flex: 1, padding: '3 6', fontSize: 8.5, fontWeight: 700, color: BLUE },
  tHeadVal: { width: 140, padding: '3 6', fontSize: 8.5, fontWeight: 700, color: BLUE, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  signRow: { flexDirection: 'row', gap: 20, marginTop: 24 },
  signBlock: { flex: 1, borderTop: `0.5 solid #999`, paddingTop: 3 },
  signLabel: { fontSize: 7.5, color: '#777', textAlign: 'center' },
})

interface Props { formData: PLFormData; clientName: string }

export function BulstradPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'bulstrad')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '—')

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document title={`Булстрад ПО — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <Text style={S.companyLine}>ЗЕАД „БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
        <Text style={S.companySubLine}>ЕИК 000694286 · гр. София 1000, пл. „Позитано" № 2</Text>
        <Text style={S.titleLine}>ЗАЯВЛЕНИЕ-ВЪПРОСНИК за сключване на застраховка „ПРОФЕСИОНАЛНА ОТГОВОРНОСТ"</Text>

        {/* Данни за застрахования */}
        <Text style={S.sectionHead}>ДАННИ ЗА ЗАСТРАХОВАНИЯ</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Застрахован (пълно наименование):</Text>
          <Text style={S.val}>{f('pl_company_name')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Булстат / ЕГН:</Text>
          <Text style={S.val2}>{f('pl_eik')}</Text>
          <Text style={S.lbl2}>Тел./факс:</Text>
          <Text style={S.val2}>{f('pl_phone')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Адрес (по съдебна регистрация):</Text>
          <Text style={S.val}>{f('pl_address')}</Text>
        </View>

        {/* Данни за договора — table */}
        <Text style={[S.sectionHead, { marginTop: 14 }]}>ДАННИ ЗА ЗАСТРАХОВАТЕЛНИЯ ДОГОВОР</Text>
        <View style={S.table}>
          <View style={S.tHead}>
            <Text style={S.tHeadLabel}>Параметър</Text>
            <Text style={S.tHeadVal}>Стойност</Text>
          </View>
          {[
            ['Лимит единичен (за едно събитие)', 'pl_single_limit'],
            ['Лимит агрегатен (за всички събития)', 'pl_aggregate_limit'],
            ['Самоучастие', 'pl_deductible'],
            ['Територия на валидност', 'pl_territory'],
            ['Срок от', 'pl_period_from'],
            ['Срок до', 'pl_period_to'],
          ].map(([lbl, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={S.tLabel}>{lbl}</Text>
              <Text style={S.tVal}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* Declaration */}
        <Text style={{ fontSize: 8, color: '#555', marginTop: 16, lineHeight: 1.4 }}>
          Заявявам, че всички обстоятелства в настоящото заявление са верни и пълни. Задължавам се при промяна в обстоятелствата незабавно да уведомя застрахователя.
        </Text>

        {/* Signatures */}
        <View style={S.signRow}>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Дата: {date}</Text>
            <Text style={S.signLabel}>Подпис и печат на застрахования</Text>
          </View>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Подпис на брокер / агент</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text>ЗЕАД „Булстрад ВИГ" · ЕИК 000694286</Text>
          <Text>{clientName} · {date}</Text>
          <Text>InsureUnify · БВ-ПО</Text>
        </View>
      </Page>
    </Document>
  )
}
