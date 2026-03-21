'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapFormDataForInsurer } from '@/lib/mappings'
import type { FormData } from '@/lib/schema'

Font.register({
  family: 'DejaVu',
  fonts: [
    { src: '/fonts/DejaVuSans.ttf', fontWeight: 400 },
    { src: '/fonts/DejaVuSans-Bold.ttf', fontWeight: 700 },
  ],
})

const S = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 9,
    color: '#111',
    backgroundColor: '#fff',
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 42,
  },
  // ── Header ──
  companyLine: { fontSize: 13, fontWeight: 700, color: '#0B3D91', textAlign: 'center' },
  companySubLine: { fontSize: 8, color: '#555', textAlign: 'center', marginTop: 2 },
  titleLine: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
    borderTop: '1.5 solid #0B3D91',
    borderBottom: '1.5 solid #0B3D91',
    paddingVertical: 5,
    color: '#111',
  },
  // ── Section heading ──
  sectionHead: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 10,
    marginBottom: 5,
    color: '#0B3D91',
  },
  // ── Label-value rows ──
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { fontSize: 9, color: '#444', width: '40%' },
  value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  // ── Two-column row ──
  row2: { flexDirection: 'row', gap: 8, marginBottom: 3 },
  col2label: { fontSize: 9, color: '#444', width: '22%' },
  col2value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  // ── Table ──
  table: { marginTop: 6, border: '0.5 solid #999' },
  tableHead: { flexDirection: 'row', backgroundColor: '#e8edf7', borderBottom: '0.5 solid #999' },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #ddd' },
  tableRowLast: { flexDirection: 'row', backgroundColor: '#e8edf7', borderTop: '0.5 solid #999' },
  tableColLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tableColValue: { width: 100, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: '0.5 solid #999', textAlign: 'right' },
  tableColHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#0B3D91' },
  tableColHeadValue: { width: 100, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#0B3D91', borderLeft: '0.5 solid #999', textAlign: 'right' },
  // ── Risk info table ──
  riskRow: { flexDirection: 'row', marginBottom: 2 },
  riskLabel: { fontSize: 9, color: '#444', width: '45%' },
  riskValue: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #ddd' },
  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 42,
    right: 42,
    borderTop: '0.5 solid #0B3D91',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#888',
  },
  divider: { borderTop: '0.5 solid #ccc', marginTop: 10, marginBottom: 2 },
})

function val(v: string | number | undefined): string {
  return v !== undefined && v !== '' ? String(v) : '—'
}

interface Props {
  formData: FormData
  clientName: string
}

export function BulstradPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'bulstrad')
  const f = (id: string) => d[id]?.displayValue ?? val(formData[id])
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document title={`Булстрад Имущество — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Company header */}
        <Text style={S.companyLine}>ЗЕАД „БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
        <Text style={S.companySubLine}>ЕИК 000694286 · гр. София 1000, пл. „Позитано" № 2</Text>
        <Text style={S.titleLine}>
          ПРЕДЛОЖЕНИЕ за сключване на Комбинирана полица „Имущество"
        </Text>

        {/* т.1 */}
        <Text style={S.sectionHead}>т.1  Данни за Кандидата за застраховане:</Text>
        <View style={S.row}>
          <Text style={S.label}>Наименование:</Text>
          <Text style={S.value}>{f('company_name')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>ЕИК/ЕГН:</Text>
          <Text style={S.col2value}>{f('eik')}</Text>
          <Text style={S.col2label}>Представляващ:</Text>
          <Text style={S.col2value}>{val(formData['representative'])}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Седалище и адрес на управление:</Text>
          <Text style={S.value}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Тел.:</Text>
          <Text style={S.col2value}>{f('phone')}</Text>
          <Text style={S.col2label}>е-mail:</Text>
          <Text style={S.col2value}>{f('email')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Основна дейност:</Text>
          <Text style={S.col2value}>{f('activity')}</Text>
          <Text style={S.col2label}>Код по НКИД:</Text>
          <Text style={S.col2value}>{f('nkid_code')}</Text>
        </View>

        {/* т.2 */}
        <Text style={S.sectionHead}>т.2  Период на застраховката:</Text>
        <View style={S.row2}>
          <Text style={S.col2label}>от:</Text>
          <Text style={S.col2value}>{f('period_from')}</Text>
          <Text style={S.col2label}>до:</Text>
          <Text style={S.col2value}>{f('period_to')}</Text>
        </View>

        {/* т.3 */}
        <Text style={S.sectionHead}>т.3  Адрес на застрахованото имущество:</Text>
        <View style={S.row}>
          <Text style={S.label}>Адрес на имуществото:</Text>
          <Text style={S.value}>{f('property_address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Дейност в обекта:</Text>
          <Text style={S.col2value}>{f('object_activity')}</Text>
          <Text style={S.col2label}>Трето ползващо се лице:</Text>
          <Text style={S.col2value}>{f('beneficiary')}</Text>
        </View>

        {/* т.4 Имущество */}
        <Text style={S.sectionHead}>т.4  Имущество и застрахователни суми:</Text>
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={S.tableColHeadLabel}>Вид имущество</Text>
            <Text style={S.tableColHeadValue}>Застрах. сума ({f('currency')})</Text>
          </View>
          {[
            ['1.1. Сгради', 'val_buildings'],
            ['1.2. Машини, съоръжения и оборудване', 'val_machinery'],
            ['Клауза 017 — Електронна техника', 'val_electronics'],
            ['1.4. Инвентар', 'val_inventory'],
            ['2.1–2.4 Материални запаси', 'val_stock'],
          ].map(([label, id]) => (
            <View key={id} style={S.tableRow}>
              <Text style={S.tableColLabel}>{label}</Text>
              <Text style={S.tableColValue}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tableRowLast}>
            <Text style={[S.tableColLabel, { fontWeight: 700 }]}>ОБЩО</Text>
            <Text style={[S.tableColValue, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Оценъчна база:</Text>
          <Text style={S.col2value}>{f('valuation_basis')}</Text>
          <Text style={S.col2label}>Начин на плащане:</Text>
          <Text style={S.col2value}>{f('payment_type')}</Text>
        </View>

        {/* Информация за оценка на риска */}
        <View style={S.divider} />
        <Text style={S.sectionHead}>Информация за оценка на риска:</Text>

        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Носеща конструкция:</Text>
          <Text style={S.riskValue}>{f('construction_type')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Покрив:</Text>
          <Text style={S.riskValue}>{f('roof_type')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Сандвич-панели (XPS/EPS/PUR/PIR/мин.вата):</Text>
          <Text style={S.riskValue}>{f('sandwich_panels')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Период на строителство (до 4/5–10/11–20/над 20 г.):</Text>
          <Text style={S.riskValue}>{f('construction_year')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>От последната реконструкция:</Text>
          <Text style={S.riskValue}>{f('last_renovation')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Брой етажи (1–2/3–5/6–10/над 10):</Text>
          <Text style={S.riskValue}>{f('floors')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Мерките отговарят ли на ПБЗН:</Text>
          <Text style={S.riskValue}>{f('fire_compliance')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Пожароизвестяване (детектори дим/топлина):</Text>
          <Text style={S.riskValue}>{f('fire_alarm')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Спринклерна инсталация:</Text>
          <Text style={S.riskValue}>{f('sprinklers')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Пожарогасители:</Text>
          <Text style={S.riskValue}>{f('fire_extinguishers')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Противопожарни кранове:</Text>
          <Text style={S.riskValue}>{f('hydrants')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Разстояние до пожарна (до 1/1–3/3–5/5–10/над 10 км):</Text>
          <Text style={S.riskValue}>{f('fire_station_distance')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Охранителна система (локална/СОТ):</Text>
          <Text style={S.riskValue}>{f('alarm_system')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Охрана (собствена/специализирана/нощна/денонощна):</Text>
          <Text style={S.riskValue}>{f('guard_type')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Телевизионни камери:</Text>
          <Text style={S.riskValue}>{f('cctv')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Опасни вещества:</Text>
          <Text style={S.riskValue}>{f('hazardous_materials')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Близост до воден басейн:</Text>
          <Text style={S.riskValue}>{f('water_basin_distance')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Свлачищен район:</Text>
          <Text style={S.riskValue}>{f('landslide_area')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Щети последните 5 год.:</Text>
          <Text style={S.riskValue}>{f('previous_claims')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Описание на щети:</Text>
          <Text style={S.riskValue}>{f('claims_details')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Съществуваща подобна застраховка:</Text>
          <Text style={S.riskValue}>{f('existing_insurance')}</Text>
        </View>
        <View style={S.riskRow}>
          <Text style={S.riskLabel}>Отказвана застраховка:</Text>
          <Text style={S.riskValue}>{f('insurance_declined')}</Text>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>ЗЕАД „Булстрад Виена Иншурънс Груп" · Формуляр 2200-26</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
