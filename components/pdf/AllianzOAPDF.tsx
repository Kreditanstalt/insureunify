'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapOAFormDataForInsurer } from '@/lib/oa-mappings'
import type { OAFormData } from '@/lib/oa-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const BLUE = '#003781'

const S = StyleSheet.create({
  page:        { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  header:      { marginBottom: 10 },
  companyLine: { fontSize: 12, fontWeight: 700, color: BLUE, textAlign: 'center' },
  subLine:     { fontSize: 7.5, color: '#555', textAlign: 'center', marginTop: 2 },
  title:       { fontSize: 10.5, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 12, borderTop: `1.5 solid ${BLUE}`, borderBottom: `1.5 solid ${BLUE}`, paddingVertical: 5 },
  sectionHead: { fontSize: 9.5, fontWeight: 700, marginTop: 11, marginBottom: 5, color: BLUE, textTransform: 'uppercase' },
  row:         { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-end' },
  lbl:         { fontSize: 8.5, color: '#444', width: '46%' },
  val:         { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2:        { flexDirection: 'row', gap: 10, marginBottom: 3.5, alignItems: 'flex-end' },
  lbl2:        { fontSize: 8.5, color: '#444', width: '28%' },
  val2:        { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  checkRow:    { flexDirection: 'row', marginBottom: 3, alignItems: 'center', gap: 6 },
  checkbox:    { width: 10, height: 10, border: `1 solid #aaa`, fontSize: 8, textAlign: 'center', lineHeight: 1.2 },
  checkLabel:  { fontSize: 8.5, color: '#333', flex: 1 },
  divider:     { borderTop: `0.5 solid #ddd`, marginTop: 8, marginBottom: 5 },
  footer:      { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  note:        { fontSize: 7.5, color: '#888', marginTop: 4, fontStyle: 'italic' },
  numBox:      { width: 40, borderBottom: `0.5 solid #bbb`, paddingBottom: 1, fontSize: 9, fontWeight: 700, textAlign: 'center' },
  yesNo:       { flexDirection: 'row', gap: 8, alignItems: 'center' },
  yesNoItem:   { flexDirection: 'row', gap: 3, alignItems: 'center' },
})

interface Props { formData: OAFormData; clientName: string }

export function AllianzOAPDF({ formData, clientName }: Props) {
  const d   = mapOAFormDataForInsurer(formData, 'allianz')
  const f   = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => formData[id] !== undefined && formData[id] !== ''

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  function YesNo({ id }: { id: string }) {
    const val = formData[id]
    return (
      <View style={S.yesNo}>
        <View style={S.yesNoItem}>
          <View style={S.checkbox}><Text>{val === 'yes' ? 'X' : ' '}</Text></View>
          <Text style={{ fontSize: 8.5 }}>НЕ</Text>
        </View>
        <View style={S.yesNoItem}>
          <View style={S.checkbox}><Text>{val === 'no' ? 'X' : ' '}</Text></View>
          <Text style={{ fontSize: 8.5 }}>ДА</Text>
        </View>
      </View>
    )
  }

  return (
    <Document title={`Алианц Трудова злополука -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.companyLine}>ЗАД АЛИАНЦ БЪЛГАРИЯ АД</Text>
          <Text style={S.subLine}>ЕИК 040638060 · гр. София 1504, бул. "Кн. Ал. Дондуков" 59 · VAPROSNIK_0142</Text>
          <Text style={S.title}>ВЪПРОСНИК-ЗАЯВЛЕНИЕ{'\n'}ЗАДЪЛЖИТЕЛНА ЗАСТРАХОВКА "ТРУДОВА ЗЛОПОЛУКА"</Text>
        </View>

        {/* Section I: Applicant */}
        <Text style={S.sectionHead}>I. ДАННИ ЗА ЗАСТРАХОВАЩИЯ</Text>
        <View style={S.row}><Text style={S.lbl}>Наименование на фирмата:</Text><Text style={S.val}>{f('oa_company_name')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>ЕИК:</Text><Text style={S.val2}>{f('oa_eik')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Адрес (гр./с., ул., No.):</Text><Text style={S.val}>{f('oa_address')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Тел.:</Text><Text style={S.val2}>{f('oa_phone')}</Text>
        </View>

        <View style={S.divider} />

        {/* Section II: Activity */}
        <Text style={S.sectionHead}>т.1 ОСНОВНА ДЕЙНОСТ НА ФИРМАТА</Text>
        <View style={S.row}><Text style={S.lbl}>Основна дейност:</Text><Text style={S.val}>{f('oa_activity')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Код по НКИД:</Text><Text style={S.val2}>{f('oa_activity_code')}</Text>
        </View>
        {has('oa_secondary_activity') && (
          <>
            <Text style={S.sectionHead}>т.2 СПОМАГАТЕЛНИ ДЕЙНОСТИ</Text>
            <View style={S.row}><Text style={S.lbl}>Спомагателни дейности + НКИД:</Text><Text style={S.val}>{f('oa_secondary_activity')}</Text></View>
          </>
        )}

        <View style={S.divider} />

        {/* Section III: Insurance data */}
        <Text style={S.sectionHead}>ДАННИ ЗА ЗАСТРАХОВКАТА</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Брой лица (труд. договор):</Text>
          <View style={S.numBox}><Text>{f('oa_persons_count')}</Text></View>
          <Text style={[S.lbl2, { marginLeft: 10 }]}>Месечен фонд РЗ (лв.):</Text>
          <Text style={S.val2}>{f('oa_monthly_wage_fund')}</Text>
        </View>
        <View style={{ ...S.row, marginTop: 4 }}>
          <Text style={S.lbl}>МБЗ на едно лице {'>'} 27 000 лв.?</Text>
          <YesNo id="oa_high_salary" />
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Период от:</Text><Text style={S.val2}>{f('oa_period_from')}</Text>
          <Text style={S.lbl2}>до:</Text><Text style={S.val2}>{f('oa_period_to')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Валута:</Text><Text style={S.val2}>{f('oa_currency')}</Text>
          <Text style={S.lbl2}>Територия:</Text><Text style={S.val2}>{f('oa_territory')}</Text>
        </View>

        <View style={S.divider} />

        {/* Section IV: Coverage */}
        <Text style={S.sectionHead}>ПОКРИТИ РИСКОВЕ</Text>
        <View style={S.row}>
          <Text style={[S.lbl, { flex: 1 }]}>т.1 Смърт от трудова злополука (съгл. Наредба):</Text>
          <YesNo id="oa_cover_death" />
        </View>
        <View style={S.row}>
          <Text style={[S.lbl, { flex: 1 }]}>т.2 Трайно намалена работоспособност -- ___% от з.с.:</Text>
          <YesNo id="oa_cover_permanent_disability" />
        </View>
        <View style={{ marginBottom: 6 }}>
          <Text style={{ ...S.checkLabel, marginBottom: 3 }}>т.3 Временна неработоспособност:</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <View style={S.checkRow}>
              <View style={S.checkbox}><Text>{formData.oa_cover_temporary_disability === 'yes' ? 'X' : ' '}</Text></View>
              <Text style={S.checkLabel}>Съгл. Наредбата</Text>
            </View>
            {has('oa_temp_disability_limit') && (
              <View style={S.checkRow}>
                <View style={S.checkbox}><Text>X</Text></View>
                <Text style={S.checkLabel}>Доброволен лимит: {f('oa_temp_disability_limit')} лв.</Text>
              </View>
            )}
          </View>
        </View>
        {has('oa_si_per_person') && (
          <View style={S.row}>
            <Text style={S.lbl}>Застрахователна сума (7 × год. брутна заплата):</Text>
            <Text style={S.val}>{f('oa_si_per_person')} {f('oa_currency')}</Text>
          </View>
        )}

        <View style={S.divider} />

        {/* Section V: Risk assessment */}
        <Text style={S.sectionHead}>т.3 ОЦЕНКА НА РИСКА</Text>
        <View style={S.row}>
          <Text style={[S.lbl, { flex: 1 }]}>Настъпвали ли са големи аварии (10 год.)?</Text>
          <YesNo id="oa_major_accidents_10y" />
        </View>
        {has('oa_accidents_details') && (
          <View style={S.row}><Text style={S.lbl}>Описание:</Text><Text style={S.val}>{f('oa_accidents_details')}</Text></View>
        )}

        <Text style={[S.sectionHead, { marginTop: 8 }]}>т.4 РЕГИСТРИРАНИ ТРУДОВИ ЗЛОПОЛУКИ (3 год.)</Text>
        <View style={S.row}>
          <Text style={[S.lbl, { flex: 1 }]}>Има ли регистрирани трудови злополуки?</Text>
          <YesNo id="oa_registered_accidents_3y" />
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Смърт ___ бр.:</Text>
          <View style={S.numBox}><Text>{f('oa_accidents_death_count')}</Text></View>
          <Text style={S.lbl2}>Инвалидност ___ бр.:</Text>
          <View style={S.numBox}><Text>{f('oa_accidents_disability_count')}</Text></View>
          <Text style={S.lbl2}>Вр. НТ ___ бр.:</Text>
          <View style={S.numBox}><Text>{f('oa_accidents_temp_count')}</Text></View>
        </View>

        <Text style={[S.sectionHead, { marginTop: 8 }]}>т.5 ПРЕДПИСАНИЯ ОТ КОНТРОЛНИ ОРГАНИ (3 год.)</Text>
        <View style={S.row}>
          <Text style={[S.lbl, { flex: 1 }]}>Правени ли са предписания?</Text>
          <YesNo id="oa_safety_prescriptions" />
        </View>
        {has('oa_safety_details') && (
          <View style={S.row}><Text style={S.lbl}>Срокове и изпълнение:</Text><Text style={S.val}>{f('oa_safety_details')}</Text></View>
        )}

        <Text style={[S.sectionHead, { marginTop: 8 }]}>т.6 РЕЖИМ НА РАБОТА</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Работа на смени?</Text>
          <YesNo id="oa_shift_work" />
          <Text style={[S.lbl2, { marginLeft: 10 }]}>Брой смени:</Text>
          <View style={S.numBox}><Text>{f('oa_shifts_count')}</Text></View>
        </View>

        <Text style={[S.sectionHead, { marginTop: 8 }]}>т.7 КОНЦЕНТРАЦИЯ НА РАБОТНА СИЛА</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Макс. брой на едно място/едно и също време:</Text>
          <View style={S.numBox}><Text>{f('oa_max_concentration')}</Text></View>
        </View>

        <View style={S.divider} />
        <Text style={S.note}>Дата на попълване: {date} · Генерирано от InsureUnify</Text>

        {/* Signature */}
        <View style={{ marginTop: 16, flexDirection: 'row', gap: 40 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#555' }}>Застраховащ (подпис и печат):</Text>
            <View style={{ borderTop: '0.5 solid #aaa', marginTop: 24, paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, color: '#888' }}>{clientName}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#555' }}>Застрахователен посредник:</Text>
            <View style={{ borderTop: '0.5 solid #aaa', marginTop: 24 }} />
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>ЗАД Алианц България АД · Трудова злополука · VAPROSNIK_0142</Text>
          <Text>{clientName}</Text>
          <Text render={({ pageNumber, totalPages }) => `стр. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
