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

const GREEN = '#1B6B3A'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, lineHeight: 1.4, color: '#000', backgroundColor: '#fff', paddingTop: 40, paddingBottom: 40, paddingLeft: 50, paddingRight: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1 solid #000', marginBottom: 8 },
  logoText: { fontSize: 10, fontWeight: 700, color: GREEN },
  logoSub: { fontSize: 6.5, color: '#555' },
  title: { fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 6, marginBottom: 2 },
  titleEn: { fontSize: 10, textAlign: 'center', color: '#444', marginBottom: 2 },
  titleSub: { fontSize: 9, fontWeight: 700, textAlign: 'center', marginBottom: 1 },
  titleSubEn: { fontSize: 8, textAlign: 'center', color: '#444', marginBottom: 8 },
  sectionHead: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', borderBottom: '1 solid #000', paddingBottom: 2, marginTop: 10, marginBottom: 5, flexDirection: 'row', justifyContent: 'space-between' },
  sectionEn: { fontSize: 8, color: '#666', fontWeight: 400, fontStyle: 'italic' },
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#000' },
  lblEn: { fontSize: 7.5, color: '#666', fontStyle: 'italic' },
  val: { fontSize: 9, fontWeight: 700, borderBottom: '0.5 solid #000', paddingBottom: 1, minHeight: 12 },
  tableOuter: { border: '1 solid #000', marginTop: 4 },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000' },
  tRow: { flexDirection: 'row', borderBottom: '0.5 solid #000', minHeight: 18 },
  tRowLast: { flexDirection: 'row', backgroundColor: '#E8E8E8', minHeight: 18 },
  tCell: { fontSize: 8, padding: '3 4', borderRight: '0.5 solid #000' },
  tCellLast: { fontSize: 8, padding: '3 4' },
  tHeadCell: { fontSize: 8, fontWeight: 700, padding: '2 4', borderRight: '0.5 solid #000' },
  tHeadCellLast: { fontSize: 8, fontWeight: 700, padding: '2 4' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 6 },
  checkBox: { fontSize: 9, fontWeight: 700 },
  checkLabel: { fontSize: 8 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '50%', flexDirection: 'row', marginBottom: 3, paddingRight: 6 },
  gridLbl: { fontSize: 8, color: '#333', width: '55%' },
  gridVal: { fontSize: 8, fontWeight: 700, flex: 1, borderBottom: '0.5 solid #ccc' },
  claimsTable: { border: '0.5 solid #000', marginTop: 4 },
  footer: { position: 'absolute', bottom: 14, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 8, color: '#666' },
  footerCenter: { fontSize: 7, color: '#666', textAlign: 'center' },
})

interface Props { formData: FormData; clientName: string }

function BiSection({ bg, en }: { bg: string; en: string }) {
  return (
    <View style={S.sectionHead}>
      <Text>{bg}</Text>
      <Text style={S.sectionEn}>{en}</Text>
    </View>
  )
}

export function InstinctPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'instinct')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const propRows: Array<[string, string, string]> = [
    ['Сграда', 'Building', 'val_buildings'],
    ['Машини и съоръжения', 'Machinery & Equipment', 'val_machinery'],
    ['Стоки и материали', 'Goods & Materials', 'val_stock'],
    ['Обзавеждане, инвентар', 'Furniture & Fixtures', 'val_inventory'],
    ['Електронна техника', 'Electronics', 'val_electronics'],
    ['Пари в каси', 'Cash', 'val_cash'],
    ['Друго', 'Other', 'val_other_dma'],
  ]

  return (
    <Document title={`Instinct All Risks - ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* === HEADER === */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.logoText}>INSTINCT</Text>
            <Text style={S.logoSub}>ЗД "Инстинкт" АД</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 8, color: '#555' }}>ЕИК 207335761</Text>
            <Text style={{ fontSize: 7, color: '#666' }}>бул. "Джавахарлал Неру" 28, 1324 София</Text>
            <Text style={{ fontSize: 7, color: '#666' }}>Формуляр AR-01082025</Text>
          </View>
        </View>

        {/* === TITLE (bilingual) === */}
        <Text style={S.title}>ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК</Text>
        <Text style={S.titleEn}>INSURANCE QUESTIONNAIRE</Text>
        <Text style={S.titleSub}>КОМБИНИРАНА ИМУЩЕСТВЕНА ЗАСТРАХОВКА "ВСИЧКИ РИСКОВЕ"</Text>
        <Text style={S.titleSubEn}>ALL RISKS PROPERTY INSURANCE</Text>

        {/* === 1. Застрахован / Insured === */}
        <BiSection bg="1. Застрахован" en="Insured" />
        <View style={S.row}>
          <View style={{ width: 100 }}><Text style={S.lbl}>Име/Name:</Text></View>
          <Text style={[S.val, { flex: 1 }]}>{f('company_name')}</Text>
        </View>
        <View style={S.row}>
          <View style={{ width: 130 }}><Text style={S.lbl}>ЕИК/ЕГН / Company ID:</Text></View>
          <Text style={[S.val, { width: 120 }]}>{f('eik')}</Text>
          <View style={{ width: 120, marginLeft: 6 }}><Text style={S.lbl}>Представител / Representative:</Text></View>
          <Text style={[S.val, { flex: 1 }]}>{has('representative') ? f('representative') : ''}</Text>
        </View>
        <View style={S.row}>
          <View style={{ width: 100 }}><Text style={S.lbl}>Адрес/Address:</Text></View>
          <Text style={[S.val, { flex: 1 }]}>{f('address')}</Text>
        </View>
        <View style={S.row}>
          <View style={{ width: 70 }}><Text style={S.lbl}>тел./phone:</Text></View>
          <Text style={[S.val, { width: 120 }]}>{f('phone')}</Text>
          <View style={{ width: 40, marginLeft: 6 }}><Text style={S.lbl}>email:</Text></View>
          <Text style={[S.val, { flex: 1 }]}>{f('email')}</Text>
        </View>
        <View style={S.row}>
          <View style={{ width: 180 }}><Text style={S.lbl}>Предмет на дейност / Type of activity:</Text></View>
          <Text style={[S.val, { flex: 1 }]}>{f('activity')}</Text>
        </View>

        {/* === 3. Ползващо лице / Beneficiary === */}
        {has('beneficiary') && (
          <>
            <BiSection bg="3. Ползващо лице" en="Beneficiary" />
            <View style={S.row}>
              <Text style={[S.val, { flex: 1 }]}>{f('beneficiary')}</Text>
            </View>
          </>
        )}

        {/* === 4. Адрес на имуществото / Insured location === */}
        <BiSection bg="4. Адрес на застрахованото имущество" en="Insured location" />
        <View style={S.row}>
          <Text style={[S.val, { flex: 1 }]}>{f('property_address')}</Text>
        </View>
        {has('object_activity') && (
          <View style={S.row}>
            <View style={{ width: 200 }}><Text style={S.lbl}>Вид дейност в обекта / Activity at location:</Text></View>
            <Text style={[S.val, { flex: 1 }]}>{f('object_activity')}</Text>
          </View>
        )}

        {/* === 6. Период / Insurance period === */}
        <BiSection bg="6. Период" en="Insurance period" />
        <View style={S.row}>
          <Text style={[S.lbl, { width: 55 }]}>от/from:</Text>
          <Text style={[S.val, { width: 100 }]}>{fmtDateBG(f('period_from'))}</Text>
          <Text style={[S.lbl, { width: 45, marginLeft: 10 }]}>до/to:</Text>
          <Text style={[S.val, { width: 100 }]}>{fmtDateBG(f('period_to'))}</Text>
        </View>

        {/* === 7. Застраховано имущество / Insured property (table) === */}
        <BiSection bg="7. Застраховано имущество" en="Insured property" />
        <View style={S.tableOuter}>
          <View style={S.tHeadRow}>
            <Text style={[S.tHeadCell, { width: 180 }]}>Описание / Description</Text>
            <Text style={[S.tHeadCellLast, { flex: 1, textAlign: 'right' }]}>Застрах. сума / Sum ({f('currency')})</Text>
          </View>
          {propRows.map(([bg, en, id]) => (
            <View key={id} style={S.tRow}>
              <View style={[S.tCell, { width: 180 }]}>
                <Text style={{ fontSize: 8 }}>{bg}</Text>
                <Text style={{ fontSize: 7, color: '#666', fontStyle: 'italic' }}>{en}</Text>
              </View>
              <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{has(id) ? f(id) : ''}</Text>
            </View>
          ))}
          <View style={S.tRowLast}>
            <Text style={[S.tCell, { width: 180, fontWeight: 700 }]}>Общо / Total</Text>
            <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>

        {/* === 8. Данни за сградата / Building info (2-col grid) === */}
        <BiSection bg="8. Данни за сградата" en="Building information" />
        <View style={S.grid2}>
          {([
            ['Конструкция / Construction:', 'construction_type'],
            ['Покрив / Roof:', 'roof_type'],
            ['Сандвич-панели / Panels:', 'sandwich_panels'],
            ['Год. строеж / Year built:', 'construction_year'],
            ['Последен ремонт / Last renovation:', 'last_renovation'],
            ['Брой етажи / Floors:', 'floors'],
            ['РЗП м2 / Area m2:', 'area_sqm'],
            ['Самостоятелна / Standalone:', 'building_standalone'],
          ] as Array<[string, string]>).filter(([, id]) => has(id)).map(([label, id]) => (
            <View key={id} style={S.gridCell}>
              <Text style={S.gridLbl}>{label}</Text>
              <Text style={S.gridVal}>{f(id)}</Text>
            </View>
          ))}
        </View>

        {/* === 9. Допълнителни покрития / Additional coverage === */}
        <BiSection bg="9. Допълнителна информация" en="Additional information" />
        <View style={S.grid2}>
          {([
            ['Пожароизвестяване / Fire alarm:', 'fire_alarm'],
            ['Спринклери / Sprinklers:', 'sprinklers'],
            ['Пожарогасители / Extinguishers:', 'fire_extinguishers'],
            ['Охрана / Security:', 'alarm_system'],
            ['Камери / CCTV:', 'cctv'],
            ['До пожарна / Fire station dist.:', 'fire_station_distance'],
            ['Щети 3г. / Claims 3y:', 'previous_claims'],
            ['Действаща з-ка / Existing ins.:', 'existing_insurance'],
          ] as Array<[string, string]>).filter(([, id]) => has(id)).map(([label, id]) => (
            <View key={id} style={S.gridCell}>
              <Text style={S.gridLbl}>{label}</Text>
              <Text style={S.gridVal}>{f(id)}</Text>
            </View>
          ))}
        </View>
        {has('claims_details') && (
          <View style={S.row}>
            <View style={{ width: 120 }}><Text style={S.lbl}>Описание щети / Claims details:</Text></View>
            <Text style={[S.val, { flex: 1 }]}>{f('claims_details')}</Text>
          </View>
        )}

        {/* === FOOTER === */}
        <View style={S.footer} fixed>
          <Text>ЕИК 207335761</Text>
          <Text style={S.footerCenter}>ЗД "Инстинкт" АД - бул. "Дж. Неру" 28, София 1324</Text>
          <Text render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
