'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapFormDataForInsurer } from '@/lib/mappings'
import type { FormData } from '@/lib/schema'
import { fmtDateBG } from '@/lib/utils'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const RED = '#C8102E'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, lineHeight: 1.4, color: '#000', backgroundColor: '#fff', paddingTop: 40, paddingBottom: 40, paddingLeft: 50, paddingRight: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1 solid #000', marginBottom: 8 },
  logoText: { fontSize: 10, fontWeight: 700, color: RED },
  logoSub: { fontSize: 6.5, color: '#555' },
  insurerInfo: { textAlign: 'right' },
  insurerName: { fontSize: 9, fontWeight: 700, color: RED, textAlign: 'right' },
  insurerSub: { fontSize: 7, color: '#555', textAlign: 'right' },
  title: { fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 8, marginBottom: 2 },
  titleSub: { fontSize: 9, textAlign: 'center', marginBottom: 4 },
  intro: { fontSize: 8, fontStyle: 'italic', color: '#444', marginBottom: 10 },
  sectionHead: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', borderBottom: '1 solid #000', paddingBottom: 2, marginTop: 12, marginBottom: 6 },
  box: { border: '1 solid #000', padding: 8, marginBottom: 6 },
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#000' },
  val: { fontSize: 9, fontWeight: 700, borderBottom: '0.5 solid #000', paddingBottom: 1, minHeight: 12 },
  noteSmall: { fontSize: 7, color: '#555', fontStyle: 'italic', marginTop: 1 },
  tableOuter: { border: '1 solid #000', marginTop: 4 },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000' },
  tRow: { flexDirection: 'row', borderBottom: '0.5 solid #000', minHeight: 18 },
  tRowLast: { flexDirection: 'row', backgroundColor: '#E8E8E8', minHeight: 18 },
  tCell: { fontSize: 8, padding: '3 4', borderRight: '0.5 solid #000' },
  tCellLast: { fontSize: 8, padding: '3 4' },
  tHeadCell: { fontSize: 8, fontWeight: 700, padding: '2 4', borderRight: '0.5 solid #000' },
  tHeadCellLast: { fontSize: 8, fontWeight: 700, padding: '2 4' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 4 },
  checkBox: { fontSize: 9, fontWeight: 700, width: 14 },
  checkLabel: { fontSize: 9 },
  questRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  questNum: { fontSize: 9, fontWeight: 700, width: 16 },
  questText: { fontSize: 9, flex: 1 },
  footer: { position: 'absolute', bottom: 14, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 8, color: '#666' },
  footerCenter: { fontSize: 7, color: '#666', textAlign: 'center' },
})

interface Props { formData: FormData; clientName: string }

function CB({ checked }: { checked: boolean }) {
  return <Text style={S.checkBox}>{checked ? '[X]' : '[ ]'}</Text>
}

export function GeneraliPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'generali')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'
  const isYes = (id: string) => { const v = formData[id]; return v === 'yes' || v === 'Да' }

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const propRows: Array<[string, string]> = [
    ['Сграда', 'val_buildings'],
    ['Подобрения', 'val_other_dma'],
    ['Машини, съоръжения, оборудване', 'val_machinery'],
    ['Обзавеждане, инвентар', 'val_inventory'],
    ['Стоки и материали', 'val_stock'],
    ['Електронна техника', 'val_electronics'],
    ['Пари в каси/трезори', 'val_cash'],
  ]

  return (
    <Document title={`Дженерали ИМСБ - ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* === HEADER === */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.logoText}>GENERALI</Text>
            <Text style={S.logoSub}>Дженерали Застраховане АД</Text>
          </View>
          <View style={S.insurerInfo}>
            <Text style={S.insurerName}>Дженерали Застраховане АД</Text>
            <Text style={S.insurerSub}>ЕИК 030269049 - София 1504, бул. "Кн. Ал. Дондуков" 68</Text>
          </View>
        </View>

        {/* === TITLE === */}
        <Text style={S.title}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
        <Text style={S.titleSub}>за застраховка "ИМУЩЕСТВО ЗА МАЛЪК И СРЕДЕН БИЗНЕС"</Text>
        <Text style={S.intro}>Настоящият предложение-въпросник има за цел да събере необходимата информация за оценка на риска и определяне на застрахователната премия. Формуляр ИМСБ 07.01.2026.</Text>

        {/* === ДАННИ НА КАНДИДАТА (bordered box) === */}
        <Text style={S.sectionHead}>Данни на кандидата за застраховане</Text>
        <View style={S.box}>
          <View style={S.row}>
            <Text style={[S.lbl, { width: 110 }]}>Име / Наименование:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('company_name')}</Text>
            <Text style={[S.lbl, { width: 65, marginLeft: 6 }]}>ЕГН / ЕИК:</Text>
            <Text style={[S.val, { width: 100 }]}>{f('eik')}</Text>
          </View>
          <Text style={S.noteSmall}>(три имена за физически лица / фирма за юридически лица)</Text>

          <View style={S.row}>
            <Text style={[S.lbl, { width: 40 }]}>Адрес:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('address')}</Text>
          </View>

          <View style={S.row}>
            <Text style={[S.lbl, { width: 55 }]}>Телефон:</Text>
            <Text style={[S.val, { width: 100 }]}>{f('phone')}</Text>
            <Text style={[S.lbl, { width: 55, marginLeft: 6 }]}>Ел. поща:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('email')}</Text>
          </View>

          <View style={S.row}>
            <Text style={[S.lbl, { width: 120 }]}>Предмет на дейност:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('activity')}</Text>
          </View>

          <View style={S.row}>
            <Text style={[S.lbl, { width: 210 }]}>Местоположение на имуществото (адрес):</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('property_address')}</Text>
          </View>

          {has('beneficiary') && (
            <View style={S.row}>
              <Text style={[S.lbl, { width: 140 }]}>Трето ползващо се лице:</Text>
              <Text style={[S.val, { flex: 1 }]}>{f('beneficiary')}</Text>
            </View>
          )}
        </View>

        {/* === КЛАУЗИ И ЗАСТРАХОВАТЕЛНИ СУМИ === */}
        <Text style={S.sectionHead}>Клаузи и застрахователни суми</Text>
        <View style={S.tableOuter}>
          <View style={S.tHeadRow}>
            <Text style={[S.tHeadCell, { width: 180 }]}>Описание</Text>
            <Text style={[S.tHeadCellLast, { flex: 1, textAlign: 'right' }]}>Застрах. сума ({f('currency')})</Text>
          </View>
          {propRows.map(([label, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={[S.tCell, { width: 180 }]}>{label}</Text>
              <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{has(id) ? f(id) : ''}</Text>
            </View>
          ))}
          <View style={S.tRowLast}>
            <Text style={[S.tCell, { width: 180, fontWeight: 700 }]}>Общо за всички групи</Text>
            <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>

        {/* === ВЪПРОСИ === */}
        <Text style={S.sectionHead}>Информация за оценка на риска</Text>

        <View style={S.questRow}>
          <Text style={S.questNum}>1.</Text>
          <Text style={S.questText}>Строителна година на сградата: {has('construction_year') ? f('construction_year') : '____'}    Вид конструкция: {has('construction_type') ? f('construction_type') : '____'}</Text>
        </View>

        <View style={S.questRow}>
          <Text style={S.questNum}>2.</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9 }}>Материал на покрива:</Text>
            <View style={[S.checkRow, { marginTop: 2 }]}>
              <CB checked={f('roof_type') === 'Бетон'} /><Text style={S.checkLabel}>Бетон</Text>
              <CB checked={f('roof_type') === 'Керемиди'} /><Text style={S.checkLabel}>Керемиди</Text>
              <CB checked={f('roof_type') === 'Ламарина'} /><Text style={S.checkLabel}>Ламарина</Text>
              <CB checked={f('roof_type') !== 'Бетон' && f('roof_type') !== 'Керемиди' && f('roof_type') !== 'Ламарина' && has('roof_type')} /><Text style={S.checkLabel}>Друг: {has('roof_type') ? f('roof_type') : ''}</Text>
            </View>
          </View>
        </View>

        <View style={S.questRow}>
          <Text style={S.questNum}>3.</Text>
          <Text style={S.questText}>Охранителна система: <CB checked={isYes('alarm_system')} /> ДА  <CB checked={!isYes('alarm_system') && has('alarm_system')} /> НЕ    Вид: {has('alarm_system') ? f('alarm_system') : '____'}</Text>
        </View>

        <View style={S.questRow}>
          <Text style={S.questNum}>4.</Text>
          <Text style={S.questText}>Пожароизвестяване: <CB checked={isYes('fire_alarm')} /> ДА  <CB checked={!isYes('fire_alarm') && has('fire_alarm')} /> НЕ</Text>
        </View>

        <View style={S.questRow}>
          <Text style={S.questNum}>5.</Text>
          <Text style={S.questText}>Щети последните 3 г.: <CB checked={isYes('previous_claims')} /> ДА  <CB checked={!isYes('previous_claims') && has('previous_claims')} /> НЕ{has('claims_details') ? `  ->  ${f('claims_details')}` : ''}</Text>
        </View>

        <View style={S.questRow}>
          <Text style={S.questNum}>6.</Text>
          <Text style={S.questText}>Откази за застраховане: <CB checked={isYes('insurance_declined')} /> ДА  <CB checked={!isYes('insurance_declined') && has('insurance_declined')} /> НЕ</Text>
        </View>

        {/* Самоучастие */}
        {has('custom_deductible') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 150 }]}>Желано самоучастие:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('custom_deductible')}{has('deductible_details') ? ` - ${f('deductible_details')}` : ''}</Text>
          </View>
        )}

        {/* === FOOTER === */}
        <View style={S.footer} fixed>
          <Text>ЕИК 030269049</Text>
          <Text style={S.footerCenter}>Дженерали Застраховане АД - бул. "Кн. Ал. Дондуков" 68, София 1504</Text>
          <Text render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
