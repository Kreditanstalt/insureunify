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

const PURPLE = '#6B21A8'
const LIGHT = '#F3E8FF'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  header: { marginBottom: 16 },
  companyLine: { fontSize: 14, fontWeight: 700, color: PURPLE, textAlign: 'center' },
  companySubLine: { fontSize: 8, color: '#666', textAlign: 'center', marginTop: 2 },
  titleBar: { backgroundColor: PURPLE, marginTop: 10, marginBottom: 16, paddingVertical: 6, borderRadius: 2 },
  titleText: { fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center' },
  sectionHead: { fontSize: 9, fontWeight: 700, color: PURPLE, marginTop: 12, marginBottom: 6, borderBottom: `0.5 solid ${PURPLE}`, paddingBottom: 2 },
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 8.5, color: '#555', width: '44%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #ccc`, paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 10, marginBottom: 3 },
  half: { flex: 1, flexDirection: 'row', alignItems: 'flex-end' },
  lbl2: { fontSize: 8.5, color: '#555', width: '50%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #ccc`, paddingBottom: 1 },
  yesno: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 3 },
  checkBox: { width: 10, height: 10, border: `1 solid #888`, borderRadius: 1 },
  checkBoxFilled: { width: 10, height: 10, backgroundColor: PURPLE, borderRadius: 1 },
  checkLabel: { fontSize: 8.5, color: '#333' },
  note: { fontSize: 8, color: '#555', marginTop: 2, marginLeft: 4, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${PURPLE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  infoBox: { backgroundColor: LIGHT, borderRadius: 3, padding: '6 8', marginTop: 6 },
  signRow: { flexDirection: 'row', gap: 20, marginTop: 20 },
  signBlock: { flex: 1, borderTop: `0.5 solid #999`, paddingTop: 3 },
  signLabel: { fontSize: 7.5, color: '#777', textAlign: 'center' },
})

interface Props { formData: PLFormData; clientName: string }

export function AxiomPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'axiom')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  function YesNoRow({ label, id, detailId }: { label: string; id: string; detailId?: string }) {
    const val = f(id)
    const isYes = val === 'Да'
    const isNo = val === 'Не'
    return (
      <View>
        <View style={S.yesno}>
          <Text style={S.checkLabel}>{label}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 'auto' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={isYes ? S.checkBoxFilled : S.checkBox} />
              <Text style={S.checkLabel}>да</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <View style={isNo ? S.checkBoxFilled : S.checkBox} />
              <Text style={S.checkLabel}>не</Text>
            </View>
          </View>
        </View>
        {detailId && has(detailId) && (
          <Text style={S.note}>{f(detailId)}</Text>
        )}
      </View>
    )
  }

  return (
    <Document title={`Аксиом ПО -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.companyLine}>ЗК АКСИОМ АД</Text>
          <Text style={S.companySubLine}>ЕИК 131039664 · бул. "Витоша" 150, бл. 70, ет. 1, 1408 София · www.axiom.bg</Text>
          <View style={S.titleBar}>
            <Text style={S.titleText}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК за застраховка "ПРОФЕСИОНАЛНА ОТГОВОРНОСТ"</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 8, color: '#666' }}>Дата: {date}</Text>
          </View>
        </View>

        {/* I. Данни за ЗАСТРАХОВАЩИЯ */}
        <Text style={S.sectionHead}>I. ДАННИ ЗА ЗАСТРАХОВАЩИЯ</Text>
        <View style={S.row}>
          <Text style={S.lbl}>1. Наименование/Pref.:</Text>
          <Text style={S.val}>{f('pl_company_name')}</Text>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>ЕИК/ЕГН:</Text>
            <Text style={S.val2}>{f('pl_eik')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Адрес:</Text>
            <Text style={S.val2}>{f('pl_address')}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>Телефон:</Text>
            <Text style={S.val2}>{f('pl_phone')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>E-mail:</Text>
            <Text style={S.val2}>{f('pl_email')}</Text>
          </View>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Предмет на дейност / Професия:</Text>
          <Text style={S.val}>{f('pl_activity')}</Text>
        </View>

        {/* II. Данни за ЗАСТРАХОВАНИЯ */}
        <Text style={S.sectionHead}>II. ДАННИ ЗА ЗАСТРАХОВАНИЯ</Text>
        <View style={S.infoBox}>
          <Text style={{ fontSize: 7.5, color: '#555', marginBottom: 4 }}>
            (Попълва се само ако застраховащият и застрахованият са различни лица)
          </Text>
          <View style={S.row}>
            <Text style={S.lbl}>1. Наименование:</Text>
            <Text style={S.val}>{f('pl_insured_name')}</Text>
          </View>
          <View style={S.row2}>
            <View style={S.half}>
              <Text style={S.lbl2}>ЕИК/ЕГН:</Text>
              <Text style={S.val2}>{f('pl_insured_eik')}</Text>
            </View>
            <View style={S.half}>
              <Text style={S.lbl2}>Адрес:</Text>
              <Text style={S.val2}>{f('pl_insured_address')}</Text>
            </View>
          </View>
          <View style={S.row}>
            <Text style={S.lbl}>Предмет на дейност:</Text>
            <Text style={S.val}>{f('pl_insured_profession')}</Text>
          </View>
        </View>

        {/* Point 5 extras */}
        <View style={[S.row2, { marginTop: 6 }]}>
          <View style={S.half}>
            <Text style={S.lbl2}>Начална дата на проф. дейност:</Text>
            <Text style={S.val2}>{f('pl_activity_start_date')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Брой осигурени лица по ТПО:</Text>
            <Text style={S.val2}>{f('pl_employees_count')}</Text>
          </View>
        </View>
        <View style={S.yesno}>
          <Text style={S.checkLabel}>6. Член на проф. организация?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 'auto' }}>
            {['Да', 'Не'].map((opt) => (
              <View key={opt} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <View style={f('pl_professional_org') === opt ? S.checkBoxFilled : S.checkBox} />
                <Text style={S.checkLabel}>{opt.toLowerCase()}</Text>
              </View>
            ))}
          </View>
        </View>
        {has('pl_professional_org_name') && (
          <View style={S.row}>
            <Text style={S.lbl}>Наименование на организацията:</Text>
            <Text style={S.val}>{f('pl_professional_org_name')}</Text>
          </View>
        )}

        {/* Застрахователна история */}
        <Text style={S.sectionHead}>ЗАСТРАХОВАТЕЛНА ИСТОРИЯ</Text>
        <YesNoRow label="7. Имали ли сте до сега сключена застраховка ПО?" id="pl_prev_insurance" />
        <YesNoRow label="8. Изплащано ли е обезщетение по застраховка ПО?" id="pl_claims_paid" detailId="pl_claims_details" />
        <YesNoRow label="9. Отказвано ли ви е сключване на застраховка ПО?" id="pl_insurance_declined" />
        <YesNoRow label="10. Имате ли валидна застраховка ПО при друга компания?" id="pl_valid_other_insurance" />
        <YesNoRow label="11. Предявявани ли са искове / съдебни дела (3 год.)?" id="pl_pending_claims" detailId="pl_pending_claims_details" />
        <YesNoRow label="12. Известни ли са Ви обстоятелства за бъдещи искове?" id="pl_known_circumstances" />

        {/* III. Данни за договора */}
        <Text style={S.sectionHead}>III. ДАННИ ЗА ЗАСТРАХОВАТЕЛНИЯ ДОГОВОР</Text>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>12.1 Единичен лимит (за едно събитие):</Text>
            <Text style={S.val2}>{has('pl_single_limit') ? `${f('pl_single_limit')} ${f('pl_currency')}` : '--'}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>12.2 Агрегатен лимит (за всички):</Text>
            <Text style={S.val2}>{has('pl_aggregate_limit') ? `${f('pl_aggregate_limit')} ${f('pl_currency')}` : '--'}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>13. Териториална валидност:</Text>
            <Text style={S.val2}>{f('pl_territory')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>14. Самоучастие:</Text>
            <Text style={S.val2}>{f('pl_deductible')}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <View style={S.half}>
            <Text style={S.lbl2}>15. Срок от:</Text>
            <Text style={S.val2}>{f('pl_period_from')}</Text>
          </View>
          <View style={S.half}>
            <Text style={S.lbl2}>Срок до:</Text>
            <Text style={S.val2}>{f('pl_period_to')}</Text>
          </View>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>16. Начин на плащане:</Text>
          <Text style={S.val}>{f('pl_payment_type')}</Text>
        </View>

        {/* Signatures */}
        <View style={S.signRow}>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Подпис и печат на застраховащия</Text>
          </View>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Подпис на представител на ЗК Аксиом АД</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer}>
          <Text>ЗК Аксиом АД · ЕИК 131039664</Text>
          <Text>{clientName} · {date}</Text>
          <Text>InsureUnify · PL-Application</Text>
        </View>
      </Page>
    </Document>
  )
}
