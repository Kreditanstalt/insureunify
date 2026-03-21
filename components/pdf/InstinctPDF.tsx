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
    paddingTop: 34,
    paddingBottom: 50,
    paddingHorizontal: 42,
  },
  // ── Header box ──
  headerBox: {
    border: '2 solid #1B6B3A',
    borderRadius: 3,
    padding: '8 12',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  titleBg: { fontSize: 11, fontWeight: 700, color: '#1B6B3A' },
  titleEn: { fontSize: 9, color: '#1B6B3A', marginTop: 1 },
  subtitleBg: { fontSize: 8.5, fontWeight: 700, marginTop: 4 },
  subtitleEn: { fontSize: 7.5, color: '#555', marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  companyName: { fontSize: 9, fontWeight: 700, color: '#1B6B3A' },
  companyEik: { fontSize: 7.5, color: '#777', marginTop: 2 },
  badge: { backgroundColor: '#1B6B3A', borderRadius: 2, padding: '2 6', marginTop: 4 },
  badgeText: { fontSize: 7.5, color: '#fff', fontWeight: 700 },
  // ── Section heading — bilingual ──
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1B6B3A',
    padding: '3 6',
    marginTop: 10,
    marginBottom: 6,
  },
  sectionBg: { fontSize: 8, fontWeight: 700, color: '#fff' },
  sectionEn: { fontSize: 8, color: '#a7f3d0' },
  // ── Field rows ──
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  labelBg: { fontSize: 9, color: '#333', width: '40%' },
  value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  // ── Two-column row ──
  row2: { flexDirection: 'row', gap: 6, marginBottom: 3, alignItems: 'flex-end' },
  col2labelBg: { fontSize: 9, color: '#333', width: '22%' },
  col2value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  // ── Table ──
  table: { border: '0.5 solid #1B6B3A', marginTop: 4 },
  tableHead: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderBottom: '0.5 solid #1B6B3A' },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #dcfce7' },
  tableRowLast: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderTop: '0.5 solid #1B6B3A' },
  tableColLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tableColValue: { width: 90, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: '0.5 solid #dcfce7', textAlign: 'right' },
  tableColHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#1B6B3A' },
  tableColHeadValue: { width: 90, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#1B6B3A', borderLeft: '0.5 solid #dcfce7', textAlign: 'right' },
  // ── Building info grid ──
  buildGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  buildCell: { width: '50%', flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
  buildLabel: { fontSize: 9, color: '#444', width: '55%' },
  buildValue: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #eee' },
  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 42,
    right: 42,
    borderTop: '0.5 solid #1B6B3A',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#888',
  },
})

interface Props {
  formData: FormData
  clientName: string
}

function biHead(bg: string, en: string) {
  return (
    <View style={S.sectionHead}>
      <Text style={S.sectionBg}>{bg}</Text>
      <Text style={S.sectionEn}>{en}</Text>
    </View>
  )
}

export function InstinctPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'instinct')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '—')
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document title={`Instinct All Risks — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header box */}
        <View style={S.headerBox}>
          <View style={S.headerLeft}>
            <Text style={S.titleBg}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
            <Text style={S.titleEn}>INSURANCE QUESTIONNAIRE</Text>
            <Text style={S.subtitleBg}>КОМБИНИРАНА ИМУЩЕСТВЕНА ЗАСТРАХОВКА „ВСИЧКИ РИСКОВЕ"</Text>
            <Text style={S.subtitleEn}>ALL RISKS PROPERTY INSURANCE</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.companyName}>Инстинкт / Instinct</Text>
            <Text style={S.companyEik}>Формуляр AR-01082025</Text>
            <View style={S.badge}>
              <Text style={S.badgeText}>ALL RISKS · {date}</Text>
            </View>
          </View>
        </View>

        {/* 1. Застрахован / Insured */}
        {biHead('1. Застрахован:', '1. Insured:')}
        <View style={S.row}>
          <Text style={S.labelBg}>Ime/Name:</Text>
          <Text style={S.value}>{f('company_name')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2labelBg}>ЕИК/ЕГН / Company ID №:</Text>
          <Text style={S.col2value}>{f('eik')}</Text>
          <Text style={S.col2labelBg}>Представител / Representative:</Text>
          <Text style={S.col2value}>{f('representative')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.labelBg}>Адрес/Address:</Text>
          <Text style={S.value}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2labelBg}>phone number:</Text>
          <Text style={S.col2value}>{f('phone')}</Text>
          <Text style={S.col2labelBg}>email:</Text>
          <Text style={S.col2value}>{f('email')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.labelBg}>Type of activity:</Text>
          <Text style={S.value}>{f('activity')}</Text>
        </View>

        {/* 2. Застрахован обект / Insured location */}
        {biHead('2. Застрахован обект:', '2. Insured location:')}
        <View style={S.row}>
          <Text style={S.labelBg}>Insured location:</Text>
          <Text style={S.value}>{f('property_address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2labelBg}>Type of the activity:</Text>
          <Text style={S.col2value}>{f('object_activity')}</Text>
          <Text style={S.col2labelBg}>Beneficiary:</Text>
          <Text style={S.col2value}>{f('beneficiary')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2labelBg}>от 00.00ч на / from:</Text>
          <Text style={S.col2value}>{f('period_from')}</Text>
          <Text style={S.col2labelBg}>до 24.00ч на / to:</Text>
          <Text style={S.col2value}>{f('period_to')}</Text>
        </View>

        {/* 7. Застраховано имущество / Insured property */}
        {biHead('7. Застраховано имущество:', '7. Insured property:')}
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={S.tableColHeadLabel}>Вид имущество / Type of property</Text>
            <Text style={S.tableColHeadValue}>Сума / Sum ({f('currency')})</Text>
          </View>
          {[
            ['Building, Improvements', 'val_buildings'],
            ['Machinery and equipment', 'val_machinery'],
            ['Electronic equipment', 'val_electronics'],
            ['Fixtures + Furniture', 'val_inventory'],
            ['Stock and Materials', 'val_stock'],
          ].map(([label, id]) => (
            <View key={id} style={S.tableRow}>
              <Text style={S.tableColLabel}>{label}</Text>
              <Text style={S.tableColValue}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tableRowLast}>
            <Text style={[S.tableColLabel, { fontWeight: 700 }]}>Total / Общо</Text>
            <Text style={[S.tableColValue, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        <View style={[S.row2, { marginTop: 4 }]}>
          <Text style={S.col2labelBg}>book value/expert eval:</Text>
          <Text style={S.col2value}>{f('valuation_basis')}</Text>
        </View>

        {/* 8. Данни за сградата / Information about the building */}
        {biHead('8. Данни за сградата:', '8. Information about the building:')}
        <View style={S.buildGrid}>
          {[
            ['Стоманобетонна/Тухлена/Метална/Дървена (конструкция):', 'construction_type'],
            ['reinforced concrete/metal/wooden (покрив):', 'roof_type'],
            ['XPS/EPS/PUR/PIR/Mineral fibers (панели):', 'sandwich_panels'],
            ['year of construction:', 'construction_year'],
            ['last capital renovation:', 'last_renovation'],
            ['total number of floors:', 'floors'],
            ['Total built-up area:', 'area_sqm'],
            ['Фотоволтаична инсталация (да/не):', 'photovoltaic'],
          ].map(([label, id]) => (
            <View key={id} style={S.buildCell}>
              <Text style={S.buildLabel}>{label}</Text>
              <Text style={S.buildValue}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* 9. Пожарна безопасност / Fire safety */}
        {biHead('9. Пожарна безопасност:', '9. Fire safety:')}
        <View style={S.buildGrid}>
          {[
            ['requirements met? (ПБЗН):', 'fire_compliance'],
            ['automatic/manual (пожароизвест.):', 'fire_alarm'],
            ['Sprinkler installation:', 'sprinklers'],
            ['fire extinguishers:', 'fire_extinguishers'],
            ['hydrants:', 'hydrants'],
            ['distance km (до пожарна):', 'fire_station_distance'],
          ].map(([label, id]) => (
            <View key={id} style={S.buildCell}>
              <Text style={S.buildLabel}>{label}</Text>
              <Text style={S.buildValue}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* 10. Охрана / Security */}
        {biHead('10. Охрана / Security:', '10. Security:')}
        <View style={S.buildGrid}>
          {[
            ['not 24h / 24h (обитаемост):', 'occupancy'],
            ['local/central alarm:', 'alarm_system'],
            ['armed/unarmed guards:', 'guard_type'],
            ['video surveillance:', 'cctv'],
            ['≤50m / ≥50m (воден басейн):', 'water_basin_distance'],
            ['да/не (свлачище):', 'landslide_area'],
            ['да/не (36 мес. щети):', 'previous_claims'],
            ['Година/Сума/Причина:', 'claims_details'],
            ['да/не (съществ. застрах.):', 'existing_insurance'],
            ['да/не (отказана застрах.):', 'insurance_declined'],
          ].map(([label, id]) => (
            <View key={id} style={S.buildCell}>
              <Text style={S.buildLabel}>{label}</Text>
              <Text style={S.buildValue}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>Instinct · All Risks · AR-01082025</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
