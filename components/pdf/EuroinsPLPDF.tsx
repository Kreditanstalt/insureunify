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

const DARK_BLUE = '#1E40AF'
const LIGHT_BG = '#EFF6FF'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  headerBar: { backgroundColor: DARK_BLUE, padding: '8 14', borderRadius: 3, marginBottom: 4 },
  headerTitle: { fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 8, color: '#BFD7FF', textAlign: 'center', marginTop: 2 },
  formTitle: { fontSize: 10, fontWeight: 700, textAlign: 'center', color: DARK_BLUE, marginTop: 8, marginBottom: 14 },
  sectionHead: { fontSize: 9, fontWeight: 700, color: '#fff', backgroundColor: DARK_BLUE, padding: '3 6', borderRadius: 2, marginTop: 10, marginBottom: 5 },
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 8.5, color: '#555', width: '44%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #ccc`, paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 10, marginBottom: 3 },
  half: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  lbl2: { fontSize: 8.5, color: '#555', width: '50%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #ccc`, paddingBottom: 1 },
  infoBox: { backgroundColor: LIGHT_BG, borderRadius: 3, padding: '5 8', marginTop: 4, marginBottom: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  checkBox: { width: 10, height: 10, border: `1 solid #888`, borderRadius: 1, marginRight: 4 },
  checkBoxFilled: { width: 10, height: 10, backgroundColor: DARK_BLUE, borderRadius: 1, marginRight: 4 },
  checkText: { fontSize: 8.5, color: '#333', flex: 1 },
  checkAnswer: { flexDirection: 'row', gap: 8 },
  checkOpt: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  // Contract table
  table: { marginTop: 6, border: `0.5 solid #999` },
  tHead: { flexDirection: 'row', backgroundColor: LIGHT_BG, borderBottom: `0.5 solid #999` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid #eee` },
  tLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tVal: { width: 130, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  tHeadLabel: { flex: 1, padding: '3 6', fontSize: 8.5, fontWeight: 700, color: DARK_BLUE },
  tHeadVal: { width: 130, padding: '3 6', fontSize: 8.5, fontWeight: 700, color: DARK_BLUE, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  noteText: { fontSize: 8, color: '#555', marginTop: 2, marginLeft: 14, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${DARK_BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  signRow: { flexDirection: 'row', gap: 16, marginTop: 22 },
  signBlock: { flex: 1, borderTop: `0.5 solid #999`, paddingTop: 3 },
  signLabel: { fontSize: 7.5, color: '#777', textAlign: 'center' },
})

interface Props { formData: PLFormData; clientName: string }

export function EuroinsPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'euroins')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '—')
  const has = (id: string) => f(id) !== '—'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  function YesNoRow({ label, id, detailId }: { label: string; id: string; detailId?: string }) {
    const val = f(id)
    const isYes = val === 'Да'
    const isNo = val === 'Не'
    return (
      <View>
        <View style={S.checkRow}>
          <Text style={S.checkText}>{label}</Text>
          <View style={S.checkAnswer}>
            <View style={S.checkOpt}>
              <View style={isYes ? S.checkBoxFilled : S.checkBox} />
              <Text style={{ fontSize: 8.5, color: '#333' }}>Да</Text>
            </View>
            <View style={S.checkOpt}>
              <View style={isNo ? S.checkBoxFilled : S.checkBox} />
              <Text style={{ fontSize: 8.5, color: '#333' }}>Не</Text>
            </View>
          </View>
        </View>
        {detailId && has(detailId) && (
          <Text style={S.noteText}>{f(detailId)}</Text>
        )}
      </View>
    )
  }

  return (
    <Document title={`Евроинс ПО — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.headerBar}>
          <Text style={S.headerTitle}>ЗД ЕВРОИНС АД</Text>
          <Text style={S.headerSub}>ЕИК 121265113 · бул. „Христофор Колумб" 43, 1592 София · www.euroins.bg</Text>
        </View>
        <Text style={S.formTitle}>ВЪПРОСНИК-ПРЕДЛОЖЕНИЕ „ПРОФЕСИОНАЛНА ОТГОВОРНОСТ" · Клауза 08</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Text style={{ fontSize: 8, color: '#666' }}>Дата: {date}</Text>
        </View>

        {/* I. Кандидат за застраховане */}
        <Text style={S.sectionHead}>I. КАНДИДАТ ЗА ЗАСТРАХОВАНЕ</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Ime/Наименование:</Text>
          <Text style={S.val}>{f('pl_company_name')}</Text>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>ЕГН/ЛНЧ/ЕИК:</Text>
            <Text style={S.val2}>{f('pl_eik')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Тел.:</Text>
            <Text style={S.val2}>{f('pl_phone')}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>Седалище и адрес:</Text>
            <Text style={S.val2}>{f('pl_address')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Email:</Text>
            <Text style={S.val2}>{f('pl_email')}</Text>
          </View>
        </View>

        {/* II. Застраховано лице */}
        <Text style={S.sectionHead}>II. ЗАСТРАХОВАНО ЛИЦЕ / ДАННИ ЗА ДЕЙНОСТТА</Text>
        <View style={S.infoBox}>
          <View style={S.row}>
            <Text style={S.lbl}>Ime/Наименование:</Text>
            <Text style={S.val}>{f('pl_insured_name')}</Text>
          </View>
          <View style={S.row2}>
            <View style={S.half}>
              <Text style={S.lbl2}>ЕГН/ЛНЧ/ЕИК:</Text>
              <Text style={S.val2}>{f('pl_insured_eik')}</Text>
            </View>
            <View style={S.half}>
              <Text style={S.lbl2}>Адрес:</Text>
              <Text style={S.val2}>{f('pl_insured_address')}</Text>
            </View>
          </View>
          <View style={S.row}>
            <Text style={S.lbl}>Професия/дейност:</Text>
            <Text style={S.val}>{f('pl_insured_profession')}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>Брой лица по ТПО:</Text>
            <Text style={S.val2}>{f('pl_employees_count')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Годишен оборот:</Text>
            <Text style={S.val2}>{f('pl_annual_revenue')}</Text>
          </View>
        </View>
        {has('pl_services_description') && (
          <View style={S.row}>
            <Text style={S.lbl}>Описание на услугите:</Text>
            <Text style={S.val}>{f('pl_services_description')}</Text>
          </View>
        )}
        <View style={S.checkRow}>
          <Text style={S.checkText}>Използвате ли подизпълнители?</Text>
          <View style={S.checkAnswer}>
            {['Да', 'Не'].map((opt) => (
              <View key={opt} style={S.checkOpt}>
                <View style={f('pl_subcontractors') === opt ? S.checkBoxFilled : S.checkBox} />
                <Text style={{ fontSize: 8.5, color: '#333' }}>{opt}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* III. История */}
        <Text style={S.sectionHead}>III. ЗАСТРАХОВАТЕЛНА ИСТОРИЯ</Text>
        <YesNoRow label="3.1 Сключена застраховка ПО?" id="pl_prev_insurance" />
        {has('pl_prev_insurer') && (
          <View style={S.row2}>
            <View style={S.half}>
              <Text style={S.lbl2}>Застраховател:</Text>
              <Text style={S.val2}>{f('pl_prev_insurer')}</Text>
            </View>
            <View style={S.half}>
              <Text style={S.lbl2}>Период:</Text>
              <Text style={S.val2}>{f('pl_prev_period')}</Text>
            </View>
          </View>
        )}
        <YesNoRow label="3.2 Изплащани ли са обезщетения?" id="pl_claims_paid" detailId="pl_claims_details" />
        <YesNoRow label="3.3 Предявени искове към Вас?" id="pl_pending_claims" detailId="pl_pending_claims_details" />
        <YesNoRow label="3.4 Отказвана ли Ви е застраховка ПО?" id="pl_insurance_declined" />
        <YesNoRow label="3.5 Известни обстоятелства за бъдещи искове?" id="pl_known_circumstances" />

        {/* IV. Данни за договора */}
        <Text style={S.sectionHead}>IV. ДАННИ ЗА ЗАСТРАХОВАТЕЛНОТО ПОКРИТИЕ</Text>
        <View style={S.table}>
          <View style={S.tHead}>
            <Text style={S.tHeadLabel}>Параметър</Text>
            <Text style={S.tHeadVal}>Стойност</Text>
          </View>
          {[
            ['Лимит за едно събитие', 'pl_single_limit'],
            ['Агрегатен лимит', 'pl_aggregate_limit'],
            ['Самоучастие', 'pl_deductible'],
            ['Териториална валидност', 'pl_territory'],
            ['Начало', 'pl_period_from'],
            ['Край', 'pl_period_to'],
            ['Ретроактивна дата', 'pl_retroactive_date'],
            ['Валута', 'pl_currency'],
          ].filter(([, id]) => f(id) !== '—').map(([lbl, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={S.tLabel}>{lbl}</Text>
              <Text style={S.tVal}>{f(id)}</Text>
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

        {/* Footer */}
        <View style={S.footer}>
          <Text>ЗД Евроинс АД · ЕИК 121265113</Text>
          <Text>{clientName} · {date}</Text>
          <Text>InsureUnify · ПО-кл.08</Text>
        </View>
      </Page>
    </Document>
  )
}
