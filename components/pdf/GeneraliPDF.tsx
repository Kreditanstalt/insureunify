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
  // ── Header ──
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  logo: { fontSize: 16, fontWeight: 700, color: '#C8102E' },
  logoSub: { fontSize: 8, color: '#555', marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerLabel: { fontSize: 7, color: '#aaa', textTransform: 'uppercase' },
  headerDate: { fontSize: 9, fontWeight: 700 },
  titleBar: {
    backgroundColor: '#C8102E',
    padding: '5 10',
    marginBottom: 12,
    marginHorizontal: -42,
    paddingHorizontal: 42,
  },
  titleText: { fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center' },
  titleSub: { fontSize: 8, color: '#ffd0d0', textAlign: 'center', marginTop: 2 },
  // ── Section heading ──
  sectionHead: {
    fontSize: 8,
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#C8102E',
    padding: '3 6',
    marginTop: 10,
    marginBottom: 6,
  },
  // ── Field rows ──
  row: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  label: { fontSize: 9, color: '#555', width: '38%' },
  value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 6, marginBottom: 4, alignItems: 'flex-end' },
  col2label: { fontSize: 9, color: '#555', width: '22%' },
  col2value: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #bbb', paddingBottom: 1 },
  // ── Property table ──
  table: { border: '0.5 solid #C8102E', marginTop: 4 },
  tableHead: { flexDirection: 'row', backgroundColor: '#fff0f0', borderBottom: '0.5 solid #C8102E' },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #fdd' },
  tableRowLast: { flexDirection: 'row', backgroundColor: '#fff0f0', borderTop: '0.5 solid #C8102E' },
  tableColLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tableColValue: { width: 90, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: '0.5 solid #fdd', textAlign: 'right' },
  tableColHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#C8102E' },
  tableColHeadValue: { width: 90, padding: '3 6', fontSize: 8, fontWeight: 700, color: '#C8102E', borderLeft: '0.5 solid #fdd', textAlign: 'right' },
  // ── Risk info ──
  riskGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  riskCell: { width: '50%', flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
  riskLabel: { fontSize: 9, color: '#555', width: '55%' },
  riskValue: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #eee' },
  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 42,
    right: 42,
    borderTop: '0.5 solid #C8102E',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#aaa',
  },
})

interface Props {
  formData: FormData
  clientName: string
}

export function GeneraliPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'generali')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '—')
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <Document title={`Женерали ИМСБ — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.logo}>Дженерали Застраховане АД</Text>
            <Text style={S.logoSub}>ЕИК 030485684 · гр. София 1504, бул. „Г. М. Димитров" № 1</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.headerLabel}>Дата</Text>
            <Text style={S.headerDate}>{date}</Text>
          </View>
        </View>

        {/* Red title bar */}
        <View style={S.titleBar}>
          <Text style={S.titleText}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
          <Text style={S.titleSub}>
            Имущество на фирми и организации · Формуляр ИМСБ 07.01.2026
          </Text>
        </View>

        {/* Данни на кандидата */}
        <Text style={S.sectionHead}>ДАННИ НА КАНДИДАТА ЗА ЗАСТРАХОВАНЕ</Text>
        <View style={S.row2}>
          <Text style={S.col2label}>Ime / Наименование:</Text>
          <Text style={S.col2value}>{f('company_name')}</Text>
          <Text style={S.col2label}>ЕГН / ЕИК:</Text>
          <Text style={S.col2value}>{f('eik')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Адрес за кореспонденция:</Text>
          <Text style={S.value}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Телефон/Мобилен тел.:</Text>
          <Text style={S.col2value}>{f('phone')}</Text>
          <Text style={S.col2label}>Ел. поща:</Text>
          <Text style={S.col2value}>{f('email')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.label}>Предмет на дейност:</Text>
          <Text style={S.value}>{f('activity')}</Text>
        </View>

        {/* Застрахован обект */}
        <Text style={S.sectionHead}>ЗАСТРАХОВАН ОБЕКТ</Text>
        <View style={S.row}>
          <Text style={S.label}>Местоположение:</Text>
          <Text style={S.value}>{f('property_address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.col2label}>Предназначение на сградата:</Text>
          <Text style={S.col2value}>{f('object_activity')}</Text>
          <Text style={S.col2label}>Трето ползващо се лице:</Text>
          <Text style={S.col2value}>{f('beneficiary')}</Text>
        </View>

        {/* Клаузи и групи имущество */}
        <Text style={S.sectionHead}>КЛАУЗИ И ЗАСТРАХОВАТЕЛНИ СУМИ</Text>
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={S.tableColHeadLabel}>Група имущество</Text>
            <Text style={S.tableColHeadValue}>Сума ({f('currency')})</Text>
          </View>
          {[
            ['Недвижимо имущество', 'val_buildings'],
            ['МСО (Машини, съоръжения, оборудване)', 'val_machinery'],
            ['Електронна техника', 'val_electronics'],
            ['Инвентар, обзавеждане', 'val_inventory'],
            ['Стоково-материални запаси', 'val_stock'],
          ].map(([label, id]) => (
            <View key={id} style={S.tableRow}>
              <Text style={S.tableColLabel}>{label}</Text>
              <Text style={S.tableColValue}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tableRowLast}>
            <Text style={[S.tableColLabel, { fontWeight: 700 }]}>Общо за всички групи</Text>
            <Text style={[S.tableColValue, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        <View style={[S.row2, { marginTop: 4 }]}>
          <Text style={S.col2label}>Действ./Възстановителна:</Text>
          <Text style={S.col2value}>{f('valuation_basis')}</Text>
          <Text style={S.col2label}>Разсрочено плащане:</Text>
          <Text style={S.col2value}>{f('payment_type')}</Text>
        </View>

        {/* Оценка на риска */}
        <Text style={S.sectionHead}>ИНФОРМАЦИЯ, СВЪРЗАНА С ОЦЕНКАТА НА РИСКА</Text>
        <View style={S.riskGrid}>
          {[
            ['Вид конструкция', 'construction_type'],
            ['Масивна/Метална/Друго (покрив)', 'roof_type'],
            ['Вид на термопанелите', 'sandwich_panels'],
            ['Година на построяване', 'construction_year'],
            ['Последен ремонт', 'last_renovation'],
            ['РЗП [м²]', 'area_sqm'],
            ['АПИИ (пожароизвест.)', 'fire_alarm'],
            ['АПГИ (спринклери)', 'sprinklers'],
            ['Пожарогасители', 'fire_extinguishers'],
            ['Пожарни хидранти', 'hydrants'],
            ['< 2 км до пожарна (Да/Не)', 'fire_station_distance'],
            ['ІІ-ра степен СОТ', 'alarm_system'],
            ['Степен обезопасеност', 'guard_type'],
            ['Опасни вещества (Да/Не)', 'hazardous_materials'],
            ['Близост до вода (Да/Не)', 'water_basin_distance'],
            ['Свлачищен район (Да/Не)', 'landslide_area'],
            ['Щети (5 год.) Да/Не', 'previous_claims'],
            ['Моля посочете (щети)', 'claims_details'],
            ['Самоучастие (Да/Не)', 'custom_deductible'],
          ].map(([label, id]) => (
            <View key={id} style={S.riskCell}>
              <Text style={S.riskLabel}>{label}:</Text>
              <Text style={S.riskValue}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>Дженерали Застраховане АД · ИМСБ 07.01.2026</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
