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

const GREEN = '#1B6B3A'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 34, paddingBottom: 50, paddingHorizontal: 42 },
  // header box
  headerBox: { border: `2 solid ${GREEN}`, borderRadius: 3, padding: '8 12', marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleBg: { fontSize: 11, fontWeight: 700, color: GREEN },
  titleEn: { fontSize: 9, color: GREEN, marginTop: 1 },
  subtitleBg: { fontSize: 8.5, fontWeight: 700, marginTop: 4 },
  subtitleEn: { fontSize: 7.5, color: '#555', marginTop: 1 },
  companyName: { fontSize: 9, fontWeight: 700, color: GREEN },
  companyEik: { fontSize: 7.5, color: '#777', marginTop: 2 },
  badge: { backgroundColor: GREEN, borderRadius: 2, padding: '2 6', marginTop: 4 },
  badgeText: { fontSize: 7.5, color: '#fff', fontWeight: 700 },
  // bilingual section head
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: GREEN, padding: '3 6', marginTop: 10, marginBottom: 6 },
  sectionBg: { fontSize: 8, fontWeight: 700, color: '#fff' },
  sectionEn: { fontSize: 8, color: '#a7f3d0' },
  // rows
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#333', width: '42%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 6, marginBottom: 3, alignItems: 'flex-end' },
  lbl2: { fontSize: 9, color: '#333', width: '24%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  // table
  table: { border: `0.5 solid ${GREEN}`, marginTop: 4 },
  tHead: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderBottom: `0.5 solid ${GREEN}` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid #dcfce7` },
  tRowLast: { flexDirection: 'row', backgroundColor: '#f0fdf4', borderTop: `0.5 solid ${GREEN}` },
  tLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tVal: { width: 100, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: `0.5 solid #dcfce7`, textAlign: 'right' },
  tHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: GREEN },
  tHeadVal: { width: 100, padding: '3 6', fontSize: 8, fontWeight: 700, color: GREEN, borderLeft: `0.5 solid #dcfce7`, textAlign: 'right' },
  // grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '50%', flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
  gridLbl: { fontSize: 9, color: '#444', width: '55%' },
  gridVal: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #eee` },
  // footer
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${GREEN}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
})

interface Props {
  formData: FormData
  clientName: string
}

function BiHead({ bg, en }: { bg: string; en: string }) {
  return (
    <View style={S.sectionHead}>
      <Text style={S.sectionBg}>{bg}</Text>
      <Text style={S.sectionEn}>{en}</Text>
    </View>
  )
}

export function InstinctPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'instinct')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Property table -- only rows with values
  const propRows: Array<[string, string]> = [
    ['Building, Improvements', 'val_buildings'],
    ['Machinery and equipment', 'val_machinery'],
    ['Vehicles without registration', 'val_vehicles_no_reg'],
    ['Electronic equipment', 'val_electronics'],
    ['Fixtures + Furniture', 'val_inventory'],
    ['Stock and Materials', 'val_stock'],
    ['Third party property', 'val_third_party'],
    ['Money/Cash', 'val_cash'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  // Building info grid -- only filled fields
  const buildingFields: Array<[string, string]> = [
    ['Стоманобетонна/Метална/Тухлена:', 'construction_type'],
    ['reinforced concrete/metal/wooden (покрив):', 'roof_type'],
    ['XPS/EPS/PUR/PIR/Mineral fibers:', 'sandwich_panels'],
    ['year of construction:', 'construction_year'],
    ['last capital renovation:', 'last_renovation'],
    ['total number of floors:', 'floors'],
    ['Total built-up area [м²]:', 'area_sqm'],
    ['part of building / standalone:', 'building_standalone'],
    ['фотоволтаична инсталация:', 'photovoltaic'],
    ['мълниезащита / lightning protection:', 'lightning_protection'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  // Fire safety grid
  const fireFields: Array<[string, string]> = [
    ['requirements met? (ПБЗН):', 'fire_compliance'],
    ['automatic/manual (пожароизвест.):', 'fire_alarm'],
    ['Sprinkler installation:', 'sprinklers'],
    ['fire extinguishers:', 'fire_extinguishers'],
    ['hydrants:', 'hydrants'],
    ['additional water reservoir:', 'additional_water'],
    ['gas/CO detectors:', 'detectors'],
    ['distance km (до пожарна):', 'fire_station_distance'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  // Security grid
  const securityFields: Array<[string, string]> = [
    ['not 24h / 24h (обитаемост):', 'occupancy'],
    ['local/central alarm:', 'alarm_system'],
    ['armed/unarmed guards:', 'guard_type'],
    ['video surveillance:', 'cctv'],
    ['ефективна ограда / fence:', 'fence'],
    ['<=50m / >=50m (воден басейн):', 'water_basin_distance'],
    ['свлачище / landslide:', 'landslide_area'],
    ['да/не (36 мес. щети):', 'previous_claims'],
    ['Year/Sum/Cause:', 'claims_details'],
    ['да/не (съществ. застрах.):', 'existing_insurance'],
    ['да/не (отказана застрах.):', 'insurance_declined'],
    ['Прекратявана ли е предсрочно:', 'insurance_cancelled'],
    ['допълнителна информация:', 'additional_info'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  return (
    <Document title={`Instinct All Risks -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header box */}
        <View style={S.headerBox}>
          <View>
            <Text style={S.titleBg}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
            <Text style={S.titleEn}>INSURANCE QUESTIONNAIRE</Text>
            <Text style={S.subtitleBg}>КОМБИНИРАНА ИМУЩЕСТВЕНА ЗАСТРАХОВКА "ВСИЧКИ РИСКОВЕ"</Text>
            <Text style={S.subtitleEn}>ALL RISKS PROPERTY INSURANCE</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.companyName}>Инстинкт / Instinct</Text>
            <Text style={S.companyEik}>ЗД "Инстинкт" АД · ЕИК 207335761</Text>
            <Text style={S.companyEik}>бул. "Джавахарлал Неру" 28, 1324 София</Text>
            <Text style={S.companyEik}>Формуляр AR-01082025</Text>
            <View style={S.badge}>
              <Text style={S.badgeText}>ALL RISKS · {date}</Text>
            </View>
          </View>
        </View>

        {/* 1. Застрахован / Insured */}
        <BiHead bg="1. Застрахован:" en="1. Insured:" />
        <View style={S.row}>
          <Text style={S.lbl}>Ime/Name:</Text>
          <Text style={S.val}>{f('company_name')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>ЕИК/ЕГН / Company ID No.:</Text>
          <Text style={S.val2}>{f('eik')}</Text>
          {has('representative') && <>
            <Text style={S.lbl2}>Представител / Representative:</Text>
            <Text style={S.val2}>{f('representative')}</Text>
          </>}
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Адрес/Address:</Text>
          <Text style={S.val}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>phone number:</Text>
          <Text style={S.val2}>{f('phone')}</Text>
          <Text style={S.lbl2}>email:</Text>
          <Text style={S.val2}>{f('email')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Type of activity:</Text>
          <Text style={S.val}>{f('activity')}</Text>
        </View>

        {/* 2. Застрахован обект / Insured location */}
        <BiHead bg="2. Застрахован обект:" en="2. Insured location:" />
        <View style={S.row}>
          <Text style={S.lbl}>Insured location:</Text>
          <Text style={S.val}>{f('property_address')}</Text>
        </View>
        {has('object_activity') && (
          <View style={S.row}>
            <Text style={S.lbl}>Вид дейност / Type of the activity:</Text>
            <Text style={S.val}>{f('object_activity')}</Text>
          </View>
        )}
        {has('beneficiary') && (
          <View style={S.row}>
            <Text style={S.lbl}>Beneficiary:</Text>
            <Text style={S.val}>{f('beneficiary')}</Text>
          </View>
        )}
        <View style={S.row2}>
          {has('period_from') && <>
            <Text style={S.lbl2}>от 00.00ч на / from:</Text>
            <Text style={S.val2}>{fmtDateBG(f('period_from'))}</Text>
          </>}
          {has('period_to') && <>
            <Text style={S.lbl2}>до 24.00ч на / to:</Text>
            <Text style={S.val2}>{fmtDateBG(f('period_to'))}</Text>
          </>}
        </View>

        {/* 7. Застраховано имущество / Insured property */}
        <BiHead bg="7. Застраховано имущество:" en="7. Insured property:" />
        <View style={S.table}>
          <View style={S.tHead}>
            <Text style={S.tHeadLabel}>Вид имущество / Type of property</Text>
            <Text style={S.tHeadVal}>Сума / Sum ({f('currency')})</Text>
          </View>
          {propRows.map(([label, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={S.tLabel}>{label}</Text>
              <Text style={S.tVal}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tRowLast}>
            <Text style={[S.tLabel, { fontWeight: 700 }]}>Total / Общо</Text>
            <Text style={[S.tVal, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        {has('valuation_basis') && (
          <View style={[S.row, { marginTop: 4 }]}>
            <Text style={S.lbl}>book value/expert eval:</Text>
            <Text style={S.val}>{f('valuation_basis')}</Text>
          </View>
        )}

        {/* 8. Данни за сградата / Building */}
        {buildingFields.length > 0 && (
          <>
            <BiHead bg="8. Данни за сградата:" en="8. Information about the building:" />
            <View style={S.grid}>
              {buildingFields.map(([label, id]) => (
                <View key={id} style={S.gridCell}>
                  <Text style={S.gridLbl}>{label}</Text>
                  <Text style={S.gridVal}>{f(id)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 9. Пожарна безопасност / Fire safety */}
        {fireFields.length > 0 && (
          <>
            <BiHead bg="9. Пожарна безопасност:" en="9. Fire safety:" />
            <View style={S.grid}>
              {fireFields.map(([label, id]) => (
                <View key={id} style={S.gridCell}>
                  <Text style={S.gridLbl}>{label}</Text>
                  <Text style={S.gridVal}>{f(id)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 10. Охрана и допълнително / Security */}
        {securityFields.length > 0 && (
          <>
            <BiHead bg="10. Охрана / Допълнително:" en="10. Security / Additional:" />
            <View style={S.grid}>
              {securityFields.map(([label, id]) => (
                <View key={id} style={S.gridCell}>
                  <Text style={S.gridLbl}>{label}</Text>
                  <Text style={S.gridVal}>{f(id)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>Instinct · All Risks · AR-01082025</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
