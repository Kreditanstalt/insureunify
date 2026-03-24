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

const BLUE = '#0B3D91'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, lineHeight: 1.4, color: '#000', backgroundColor: '#fff', paddingTop: 40, paddingBottom: 40, paddingLeft: 50, paddingRight: 50 },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 6, borderBottom: '1 solid #000', marginBottom: 8 },
  logoArea: { width: 80, height: 30 },
  logoText: { fontSize: 8, fontWeight: 700, color: BLUE },
  logoSub: { fontSize: 6, color: '#555' },
  insurerName: { fontSize: 10, fontWeight: 700, color: BLUE, textAlign: 'right' },
  insurerSub: { fontSize: 7, color: '#555', textAlign: 'right' },
  // Title
  title: { fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  titleSub: { fontSize: 9, textAlign: 'center', marginBottom: 10 },
  // Intro
  intro: { fontSize: 8, fontStyle: 'italic', color: '#444', marginBottom: 10 },
  // Section headers
  sectionHead: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', borderBottom: '1 solid #000', paddingBottom: 2, marginTop: 12, marginBottom: 6 },
  // Label+value rows
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#000' },
  val: { fontSize: 9, fontWeight: 700, borderBottom: '0.5 solid #000', paddingBottom: 1, minHeight: 12 },
  // Table
  tableOuter: { border: '1 solid #000', marginTop: 4 },
  tHeadRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000' },
  tRow: { flexDirection: 'row', borderBottom: '0.5 solid #000', minHeight: 18 },
  tRowLast: { flexDirection: 'row', backgroundColor: '#E8E8E8', minHeight: 18 },
  tCell: { fontSize: 8, padding: '3 4', borderRight: '0.5 solid #000' },
  tCellLast: { fontSize: 8, padding: '3 4' },
  tCellBold: { fontSize: 8, fontWeight: 700, padding: '3 4', borderRight: '0.5 solid #000' },
  tHeadCell: { fontSize: 8, fontWeight: 700, padding: '2 4', borderRight: '0.5 solid #000' },
  tHeadCellLast: { fontSize: 8, fontWeight: 700, padding: '2 4' },
  // Checkboxes
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 4 },
  checkBox: { fontSize: 9, fontWeight: 700, width: 14 },
  checkLabel: { fontSize: 9 },
  // Broker section
  brokerBox: { backgroundColor: '#F0F0F0', padding: '6 8', marginTop: 12, border: '0.5 solid #000' },
  // Footer
  footer: { position: 'absolute', bottom: 14, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 8, color: '#666' },
  footerCenter: { fontSize: 7, color: '#666', textAlign: 'center' },
})

interface Props {
  formData: FormData
  clientName: string
}

function CB({ checked }: { checked: boolean }) {
  return <Text style={S.checkBox}>{checked ? '[X]' : '[ ]'}</Text>
}

export function BulstradPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'bulstrad')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'
  const isYes = (id: string) => {
    const v = formData[id]
    return v === 'yes' || v === 'Да'
  }

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Coverage table rows
  const propRows: Array<[string, string]> = [
    ['Сгради', 'val_buildings'],
    ['Подобрения към наети сгради', 'val_other_dma'],
    ['Машини, съоръжения и оборудване', 'val_machinery'],
    ['Стопански инвентар', 'val_inventory'],
    ['Стоки и материали', 'val_stock'],
    ['Електронно оборудване', 'val_electronics'],
  ]

  return (
    <Document title={`Булстрад Имущество - ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* === HEADER === */}
        <View style={S.headerRow}>
          <View style={S.logoArea}>
            <Text style={S.logoText}>БУЛСТРАД</Text>
            <Text style={S.logoSub}>Vienna Insurance Group</Text>
          </View>
          <View>
            <Text style={S.insurerName}>ЗЕАД "БУЛСТРАД ВИЕНА ИНШУРАНС ГРУП"</Text>
            <Text style={S.insurerSub}>ЕИК 000694286 - гр. София 1000, пл. "Позитано" 5</Text>
          </View>
        </View>

        {/* === TITLE === */}
        <Text style={S.title}>ПРЕДЛОЖЕНИЕ</Text>
        <Text style={S.titleSub}>за сключване на Комбинирана застрахователна полица "ИМУЩЕСТВО"</Text>
        <Text style={S.intro}>Формуляр 2200-26. Моля попълнете всички полета. Невярно попълнените данни могат да доведат до отказ от изплащане на обезщетение.</Text>

        {/* === SECTION 1: ДАННИ ЗА КАНДИДАТА === */}
        <Text style={S.sectionHead}>1. Данни за Кандидата за застраховане</Text>

        {/* Row 1: Наименование + ЕИК */}
        <View style={S.row}>
          <Text style={[S.lbl, { width: 80 }]}>Наименование:</Text>
          <Text style={[S.val, { width: 250 }]}>{f('company_name')}</Text>
          <Text style={[S.lbl, { width: 60, marginLeft: 6 }]}>ЕИК/ЕГН:</Text>
          <Text style={[S.val, { flex: 1 }]}>{f('eik')}</Text>
        </View>

        {/* Row 2: Адрес */}
        <View style={S.row}>
          <Text style={[S.lbl, { width: 190 }]}>Седалище и адрес на управление:</Text>
          <Text style={[S.val, { flex: 1 }]}>{f('address')}</Text>
        </View>

        {/* Row 3: Тел, Факс, email */}
        <View style={S.row}>
          <Text style={[S.lbl, { width: 26 }]}>Тел.:</Text>
          <Text style={[S.val, { width: 100 }]}>{f('phone')}</Text>
          <Text style={[S.lbl, { width: 50, marginLeft: 6 }]}>е-mail:</Text>
          <Text style={[S.val, { flex: 1 }]}>{f('email')}</Text>
        </View>

        {/* Row 4: Основна дейност + Код НКИД */}
        <View style={S.row}>
          <Text style={[S.lbl, { width: 100 }]}>Основна дейност:</Text>
          <Text style={[S.val, { width: 200 }]}>{f('activity')}</Text>
          <Text style={[S.lbl, { width: 70, marginLeft: 6 }]}>Код по НКИД:</Text>
          <Text style={[S.val, { flex: 1 }]}>{f('nkid_code')}</Text>
        </View>

        {/* Row 5: Дейност в обекта */}
        {has('object_activity') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 180 }]}>Дейност в застрахования обект:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('object_activity')}</Text>
          </View>
        )}

        {/* === SECTION 2: ПЕРИОД === */}
        <Text style={S.sectionHead}>2. Период на застраховката</Text>
        <View style={S.row}>
          <Text style={[S.lbl, { width: 20 }]}>от:</Text>
          <Text style={[S.val, { width: 100 }]}>{fmtDateBG(f('period_from'))}</Text>
          <Text style={[S.lbl, { width: 20, marginLeft: 10 }]}>до:</Text>
          <Text style={[S.val, { width: 100 }]}>{fmtDateBG(f('period_to'))}</Text>
        </View>

        {/* === SECTION 3: ТРЕТО ПОЛЗВАЩО СЕ ЛИЦЕ === */}
        {has('beneficiary') && (
          <>
            <Text style={S.sectionHead}>3. Трето ползващо се лице</Text>
            <View style={S.row}>
              <Text style={[S.lbl, { width: 200 }]}>Трето ползващо се лице (ако има такова):</Text>
              <Text style={[S.val, { flex: 1 }]}>{f('beneficiary')}</Text>
            </View>
          </>
        )}

        {/* === SECTION 4: ИМУЩЕСТВО И ЗАСТРАХОВАТЕЛНИ СУМИ === */}
        <Text style={S.sectionHead}>4. Имущество и застрахователни суми</Text>
        <View style={S.tableOuter}>
          {/* Table header */}
          <View style={S.tHeadRow}>
            <Text style={[S.tHeadCell, { width: 180 }]}>Описание</Text>
            <Text style={[S.tHeadCellLast, { flex: 1, textAlign: 'right' }]}>Застрах. сума ({f('currency')})</Text>
          </View>
          {/* Table rows */}
          {propRows.map(([label, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={[S.tCell, { width: 180 }]}>{label}</Text>
              <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{has(id) ? f(id) : ''}</Text>
            </View>
          ))}
          {/* Total row */}
          <View style={S.tRowLast}>
            <Text style={[S.tCellBold, { width: 180 }]}>ОБЩО</Text>
            <Text style={[S.tCellLast, { flex: 1, textAlign: 'right', fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>

        {/* Valuation & payment */}
        <View style={[S.row, { marginTop: 4 }]}>
          {has('valuation_basis') && (
            <>
              <Text style={[S.lbl, { width: 90 }]}>Оценъчна база:</Text>
              <Text style={[S.val, { width: 120 }]}>{f('valuation_basis')}</Text>
            </>
          )}
          {has('payment_type') && (
            <>
              <Text style={[S.lbl, { width: 100, marginLeft: 6 }]}>Начин на плащане:</Text>
              <Text style={[S.val, { flex: 1 }]}>{f('payment_type')}</Text>
            </>
          )}
        </View>

        {/* === SECTION 5: ДАННИ ЗА СГРАДАТА === */}
        <Text style={S.sectionHead}>5. Данни за сградата</Text>
        {has('construction_type') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 130 }]}>Носеща конструкция:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('construction_type')}</Text>
          </View>
        )}
        {has('roof_type') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 130 }]}>Покрив:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('roof_type')}</Text>
          </View>
        )}
        <View style={S.row}>
          {has('construction_year') && (
            <>
              <Text style={[S.lbl, { width: 120 }]}>Година на строеж:</Text>
              <Text style={[S.val, { width: 80 }]}>{f('construction_year')}</Text>
            </>
          )}
          {has('floors') && (
            <>
              <Text style={[S.lbl, { width: 80, marginLeft: 6 }]}>Брой етажи:</Text>
              <Text style={[S.val, { width: 40 }]}>{f('floors')}</Text>
            </>
          )}
          {has('area_sqm') && (
            <>
              <Text style={[S.lbl, { width: 60, marginLeft: 6 }]}>РЗП м2:</Text>
              <Text style={[S.val, { flex: 1 }]}>{f('area_sqm')}</Text>
            </>
          )}
        </View>

        {/* === SECTION 6: ADDITIONAL QUESTIONS === */}
        <Text style={S.sectionHead}>6. Допълнителни въпроси</Text>

        {/* Claims history */}
        <View style={S.checkRow}>
          <Text style={S.checkLabel}>Застраховани ли са имотите в друго дружество?</Text>
          <CB checked={isYes('existing_insurance')} />
          <Text style={S.checkLabel}>ДА</Text>
          <CB checked={!isYes('existing_insurance') && has('existing_insurance')} />
          <Text style={S.checkLabel}>НЕ</Text>
        </View>

        <View style={S.checkRow}>
          <Text style={S.checkLabel}>Имало ли е щети през последните 3 години?</Text>
          <CB checked={isYes('previous_claims')} />
          <Text style={S.checkLabel}>ДА</Text>
          <CB checked={!isYes('previous_claims') && has('previous_claims')} />
          <Text style={S.checkLabel}>НЕ</Text>
        </View>
        {has('claims_details') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 100, marginLeft: 18 }]}>Описание:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('claims_details')}</Text>
          </View>
        )}

        <View style={S.checkRow}>
          <Text style={S.checkLabel}>Имало ли е откази за застраховане?</Text>
          <CB checked={isYes('insurance_declined')} />
          <Text style={S.checkLabel}>ДА</Text>
          <CB checked={!isYes('insurance_declined') && has('insurance_declined')} />
          <Text style={S.checkLabel}>НЕ</Text>
        </View>

        {/* Fire safety summary */}
        {has('fire_alarm') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 180 }]}>Пожароизвестяване:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('fire_alarm')}</Text>
          </View>
        )}
        {has('alarm_system') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 180 }]}>Охранителна система (СОТ):</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('alarm_system')}</Text>
          </View>
        )}
        {has('guard_type') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 180 }]}>Физическа охрана:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('guard_type')}</Text>
          </View>
        )}
        {has('fire_station_distance') && (
          <View style={S.row}>
            <Text style={[S.lbl, { width: 180 }]}>Разстояние до пожарна:</Text>
            <Text style={[S.val, { flex: 1 }]}>{f('fire_station_distance')}</Text>
          </View>
        )}

        {/* === BROKER SECTION === */}
        <View style={S.brokerBox}>
          <View style={S.row}>
            <Text style={[S.lbl, { width: 80 }]}>Брокер/Агент:</Text>
            <Text style={[S.val, { width: 180 }]}> </Text>
            <Text style={[S.lbl, { width: 35, marginLeft: 6 }]}>Код:</Text>
            <Text style={[S.val, { width: 60 }]}> </Text>
            <Text style={[S.lbl, { width: 35, marginLeft: 6 }]}>Дата:</Text>
            <Text style={[S.val, { flex: 1 }]}>{date}</Text>
          </View>
        </View>

        {/* === FOOTER === */}
        <View style={S.footer} fixed>
          <Text>ЕИК 000694286</Text>
          <Text style={S.footerCenter}>ЗЕАД "Булстрад ВИГ" - пл. Позитано 5, София 1000</Text>
          <Text render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
