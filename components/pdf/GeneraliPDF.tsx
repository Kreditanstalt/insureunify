'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapFormDataForInsurer } from '@/lib/mappings'
import type { FormData } from '@/lib/schema'
import { fmtDateBG } from '@/lib/utils'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
})

const RED = '#C8102E'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 34, paddingBottom: 50, paddingHorizontal: 42 },
  // header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 },
  logo: { fontSize: 16, fontWeight: 700, color: RED },
  logoSub: { fontSize: 8, color: '#555', marginTop: 2 },
  headerDate: { fontSize: 9, fontWeight: 700 },
  headerLabel: { fontSize: 7, color: '#aaa', textTransform: 'uppercase' },
  // title bar
  titleBar: { backgroundColor: RED, padding: '5 10', marginBottom: 12, marginHorizontal: -42, paddingHorizontal: 42 },
  titleText: { fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'center' },
  titleSub: { fontSize: 8, color: '#ffd0d0', textAlign: 'center', marginTop: 2 },
  // section
  sectionHead: { fontSize: 8, fontWeight: 700, color: '#fff', backgroundColor: RED, padding: '3 6', marginTop: 10, marginBottom: 6 },
  // rows
  row: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#555', width: '38%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 6, marginBottom: 4, alignItems: 'flex-end' },
  lbl2: { fontSize: 9, color: '#555', width: '24%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  // table
  table: { border: `0.5 solid ${RED}`, marginTop: 4 },
  tHead: { flexDirection: 'row', backgroundColor: '#fff0f0', borderBottom: `0.5 solid ${RED}` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid #fdd` },
  tRowLast: { flexDirection: 'row', backgroundColor: '#fff0f0', borderTop: `0.5 solid ${RED}` },
  tLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tVal: { width: 100, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: `0.5 solid #fdd`, textAlign: 'right' },
  tHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: RED },
  tHeadVal: { width: 100, padding: '3 6', fontSize: 8, fontWeight: 700, color: RED, borderLeft: `0.5 solid #fdd`, textAlign: 'right' },
  // risk grid
  riskGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  riskCell: { width: '50%', flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
  riskLbl: { fontSize: 9, color: '#555', width: '55%' },
  riskVal: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #eee` },
  // footer
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${RED}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#aaa' },
})

interface Props {
  formData: FormData
  clientName: string
}

export function GeneraliPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'generali')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Property table -- only rows with values
  const propRows: Array<[string, string]> = [
    ['Недвижимо имущество', 'val_buildings'],
    ['МСО (Машини, съоръжения, оборудване)', 'val_machinery'],
    ['Електронна техника и оборудване', 'val_electronics'],
    ['Инвентар, обзавеждане', 'val_inventory'],
    ['Стоково-материални запаси', 'val_stock'],
    ['Пари в каси и/или трезори', 'val_cash'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  // Risk info fields for Generali (2-col grid)
  const riskFields: Array<[string, string]> = [
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
    ['&lt;2 км до пожарна (Да/Не)', 'fire_station_distance'],
    ['ІІ-ра степен обезопасеност: СОТ', 'alarm_system'],
    ['Физическа охрана', 'guard_type'],
    ['Леснозапалими вещества', 'hazardous_materials'],
    ['Воден басейн наблизо', 'water_basin_distance'],
    ['Свлачищни процеси', 'landslide_area'],
    ['Имало ли е щети 5 год.', 'previous_claims'],
    ['Описание на щети', 'claims_details'],
    ['Самоучастие различно от ОУ', 'custom_deductible'],
    ['Размер на самоучастие', 'deductible_details'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  return (
    <Document title={`Женерали ИМСБ -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.logo}>Дженерали Застраховане АД</Text>
            <Text style={S.logoSub}>ЕИК 030269049 · гр. София 1504, бул. "Кн. Ал. Дондуков" 68</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.headerLabel}>Дата</Text>
            <Text style={S.headerDate}>{date}</Text>
          </View>
        </View>

        {/* Red title bar */}
        <View style={S.titleBar}>
          <Text style={S.titleText}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
          <Text style={S.titleSub}>Имущество на фирми и организации · Формуляр ИМСБ 07.01.2026</Text>
        </View>

        {/* ДАННИ НА КАНДИДАТА */}
        <Text style={S.sectionHead}>ДАННИ НА КАНДИДАТА ЗА ЗАСТРАХОВАНЕ</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Ime / Наименование:</Text>
          <Text style={S.val2}>{f('company_name')}</Text>
          <Text style={S.lbl2}>ЕГН / ЕИК:</Text>
          <Text style={S.val2}>{f('eik')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Адрес за кореспонденция:</Text>
          <Text style={S.val}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Телефон/Мобилен тел.:</Text>
          <Text style={S.val2}>{f('phone')}</Text>
          <Text style={S.lbl2}>Ел. поща:</Text>
          <Text style={S.val2}>{f('email')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Предмет на дейност:</Text>
          <Text style={S.val}>{f('activity')}</Text>
        </View>

        {/* ЗАСТРАХОВАН ОБЕКТ */}
        <Text style={S.sectionHead}>ЗАСТРАХОВАН ОБЕКТ</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Местоположение:</Text>
          <Text style={S.val}>{f('property_address')}</Text>
        </View>
        {has('object_activity') && (
          <View style={S.row}>
            <Text style={S.lbl}>Предназначение на сградата:</Text>
            <Text style={S.val}>{f('object_activity')}</Text>
          </View>
        )}
        {has('beneficiary') && (
          <View style={S.row}>
            <Text style={S.lbl}>Трето ползващо се лице:</Text>
            <Text style={S.val}>{f('beneficiary')}</Text>
          </View>
        )}

        {/* КЛАУЗИ И ЗАСТРАХОВАТЕЛНИ СУМИ */}
        <Text style={S.sectionHead}>КЛАУЗИ И ЗАСТРАХОВАТЕЛНИ СУМИ</Text>
        <View style={S.table}>
          <View style={S.tHead}>
            <Text style={S.tHeadLabel}>Група имущество</Text>
            <Text style={S.tHeadVal}>Сума ({f('currency')})</Text>
          </View>
          {propRows.map(([label, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={S.tLabel}>{label}</Text>
              <Text style={S.tVal}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tRowLast}>
            <Text style={[S.tLabel, { fontWeight: 700 }]}>Общо за всички групи</Text>
            <Text style={[S.tVal, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        <View style={[S.row2, { marginTop: 4 }]}>
          {has('valuation_basis') && <>
            <Text style={S.lbl2}>Действ./Възстановителна:</Text>
            <Text style={S.val2}>{f('valuation_basis')}</Text>
          </>}
          {has('payment_type') && <>
            <Text style={S.lbl2}>Разсрочено плащане:</Text>
            <Text style={S.val2}>{f('payment_type')}</Text>
          </>}
        </View>
        {has('stock_basis') && (
          <View style={S.row}>
            <Text style={S.lbl}>По средно-месечна / максимална наличност:</Text>
            <Text style={S.val}>{f('stock_basis')}</Text>
          </View>
        )}

        {/* ИНФОРМАЦИЯ ЗА ОЦЕНКА НА РИСКА */}
        <Text style={S.sectionHead}>ИНФОРМАЦИЯ, СВЪРЗАНА С ОЦЕНКАТА НА РИСКА</Text>
        <View style={S.riskGrid}>
          {riskFields.map(([label, id]) => (
            <View key={id} style={S.riskCell}>
              <Text style={S.riskLbl}>{label}:</Text>
              <Text style={S.riskVal}>{f(id)}</Text>
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
