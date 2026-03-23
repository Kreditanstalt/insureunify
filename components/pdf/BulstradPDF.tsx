'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapFormDataForInsurer } from '@/lib/mappings'
import type { FormData } from '@/lib/schema'
import { fmtDateBG } from '@/lib/utils'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Roboto-Regular.ttf`, fontWeight: 'normal' },
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Roboto-Bold.ttf`, fontWeight: 'bold' },
  ],
})

const BLUE = '#0B3D91'

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  companyLine: { fontSize: 13, fontWeight: 700, color: BLUE, textAlign: 'center' },
  companySubLine: { fontSize: 8, color: '#555', textAlign: 'center', marginTop: 2 },
  titleLine: { fontSize: 11, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 14, borderTop: `1.5 solid ${BLUE}`, borderBottom: `1.5 solid ${BLUE}`, paddingVertical: 5 },
  sectionHead: { fontSize: 9, fontWeight: 700, marginTop: 10, marginBottom: 5, color: BLUE },
  // row: label + value
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#444', width: '42%' },
  val: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  // two-column row
  row2: { flexDirection: 'row', gap: 8, marginBottom: 3, alignItems: 'flex-end' },
  lbl2: { fontSize: 9, color: '#444', width: '24%' },
  val2: { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  // table
  table: { marginTop: 6, border: `0.5 solid #999` },
  tHead: { flexDirection: 'row', backgroundColor: '#e8edf7', borderBottom: `0.5 solid #999` },
  tRow: { flexDirection: 'row', borderBottom: `0.5 solid #ddd` },
  tRowLast: { flexDirection: 'row', backgroundColor: '#e8edf7', borderTop: `0.5 solid #999` },
  tLabel: { flex: 1, padding: '3 6', fontSize: 9 },
  tVal: { width: 110, padding: '3 6', fontSize: 9, fontWeight: 700, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  tHeadLabel: { flex: 1, padding: '3 6', fontSize: 8, fontWeight: 700, color: BLUE },
  tHeadVal: { width: 110, padding: '3 6', fontSize: 8, fontWeight: 700, color: BLUE, borderLeft: `0.5 solid #999`, textAlign: 'right' },
  divider: { borderTop: `0.5 solid #ccc`, marginTop: 10, marginBottom: 2 },
  footer: { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
})

interface Props {
  formData: FormData
  clientName: string
}

export function BulstradPDF({ formData, clientName }: Props) {
  const d = mapFormDataForInsurer(formData, 'bulstrad')
  // f(id) -> display value or '--'; skip(id) -> true if empty
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Property table rows: only show if has value
  const propRows: Array<[string, string]> = [
    ['1.1. Сгради', 'val_buildings'],
    ['1.2. Машини, съоръжения и оборудване', 'val_machinery'],
    ['1.3. Транспортни средства без ДКNo.', 'val_vehicles_no_reg'],
    ['Клауза 017 -- Електронна техника', 'val_electronics'],
    ['1.4. Инвентар', 'val_inventory'],
    ['1.5. Разходи за придобиване на ДМА', 'val_other_dma'],
    ['2.1-2.4 Материални запаси', 'val_stock'],
    ['3. Чужди имущества', 'val_third_party'],
    ['Клауза 021 -- Пари', 'val_cash'],
  ].filter(([, id]) => has(id)) as Array<[string, string]>

  return (
    <Document title={`Булстрад Имущество -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* -- Header -- */}
        <Text style={S.companyLine}>ЗЕАД "БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП"</Text>
        <Text style={S.companySubLine}>ЕИК 000694286 · гр. София 1000, пл. "Позитано" 5</Text>
        <Text style={S.titleLine}>
          ПРЕДЛОЖЕНИЕ за сключване на Комбинирана полица "Имущество"
        </Text>

        {/* -- т.1 Данни за Кандидата -- */}
        <Text style={S.sectionHead}>т.1  Данни за Кандидата за застраховане:</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Наименование:</Text>
          <Text style={S.val}>{f('company_name')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>ЕИК/ЕГН:</Text>
          <Text style={S.val2}>{f('eik')}</Text>
        </View>
        <View style={S.row}>
          <Text style={S.lbl}>Седалище и адрес на управление:</Text>
          <Text style={S.val}>{f('address')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Тел.:</Text>
          <Text style={S.val2}>{f('phone')}</Text>
          <Text style={S.lbl2}>е-mail:</Text>
          <Text style={S.val2}>{f('email')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Основна дейност:</Text>
          <Text style={S.val2}>{f('activity')}</Text>
          <Text style={S.lbl2}>Код по НКИД:</Text>
          <Text style={S.val2}>{f('nkid_code')}</Text>
        </View>

        {/* -- т.2 Период -- */}
        <Text style={S.sectionHead}>т.2  Период на застраховката:</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>от:</Text>
          <Text style={S.val2}>{fmtDateBG(f('period_from'))}</Text>
          <Text style={S.lbl2}>до:</Text>
          <Text style={S.val2}>{fmtDateBG(f('period_to'))}</Text>
        </View>

        {/* -- т.3 Адрес на имуществото -- */}
        <Text style={S.sectionHead}>т.3  Адрес на застрахованото имущество:</Text>
        <View style={S.row}>
          <Text style={S.lbl}>Адрес на имуществото:</Text>
          <Text style={S.val}>{f('property_address')}</Text>
        </View>
        {has('building_purpose') && (
          <View style={S.row}>
            <Text style={S.lbl}>Предназначение на сградата:</Text>
            <Text style={S.val}>{f('building_purpose')}</Text>
          </View>
        )}
        {has('object_activity') && (
          <View style={S.row}>
            <Text style={S.lbl}>Дейност в застрахования обект:</Text>
            <Text style={S.val}>{f('object_activity')}</Text>
          </View>
        )}
        {has('beneficiary') && (
          <View style={S.row}>
            <Text style={S.lbl}>Трето ползващо се лице:</Text>
            <Text style={S.val}>{f('beneficiary')}</Text>
          </View>
        )}

        {/* -- т.4 Имущество -- */}
        <Text style={S.sectionHead}>т.4  Имущество и застрахователни суми:</Text>
        <View style={S.table}>
          <View style={S.tHead}>
            <Text style={S.tHeadLabel}>Вид имущество</Text>
            <Text style={S.tHeadVal}>Застрах. сума ({f('currency')})</Text>
          </View>
          {propRows.map(([label, id]) => (
            <View key={id} style={S.tRow}>
              <Text style={S.tLabel}>{label}</Text>
              <Text style={S.tVal}>{f(id)}</Text>
            </View>
          ))}
          <View style={S.tRowLast}>
            <Text style={[S.tLabel, { fontWeight: 700 }]}>ОБЩО</Text>
            <Text style={[S.tVal, { fontWeight: 700 }]}>{f('val_total')}</Text>
          </View>
        </View>
        <View style={[S.row2, { marginTop: 4 }]}>
          {has('valuation_basis') && <>
            <Text style={S.lbl2}>Оценъчна база:</Text>
            <Text style={S.val2}>{f('valuation_basis')}</Text>
          </>}
          {has('payment_type') && <>
            <Text style={S.lbl2}>Начин на плащане:</Text>
            <Text style={S.val2}>{f('payment_type')}</Text>
          </>}
        </View>
        {has('custom_deductible') && (
          <View style={S.row2}>
            <Text style={S.lbl2}>Желаете ли самоучастие:</Text>
            <Text style={S.val2}>{f('custom_deductible')}</Text>
            {has('deductible_details') && <>
              <Text style={S.lbl2}>Размер:</Text>
              <Text style={S.val2}>{f('deductible_details')}</Text>
            </>}
          </View>
        )}

        {/* -- т.5 Данни за сградата -- */}
        <View style={S.divider} />
        <Text style={S.sectionHead}>т.5  Данни за сградата:</Text>
        {has('construction_type') && (
          <View style={S.row}>
            <Text style={S.lbl}>Носеща конструкция:</Text>
            <Text style={S.val}>{f('construction_type')}</Text>
          </View>
        )}
        {has('roof_type') && (
          <View style={S.row}>
            <Text style={S.lbl}>Покрив:</Text>
            <Text style={S.val}>{f('roof_type')}</Text>
          </View>
        )}
        {has('sandwich_panels') && (
          <View style={S.row}>
            <Text style={S.lbl}>Сандвич-панели в конструкцията:</Text>
            <Text style={S.val}>{f('sandwich_panels')}</Text>
          </View>
        )}
        {has('construction_year') && (
          <View style={S.row2}>
            <Text style={S.lbl2}>Период на строителство:</Text>
            <Text style={S.val2}>{f('construction_year')}</Text>
            {has('last_renovation') && <>
              <Text style={S.lbl2}>От последната реконструкция:</Text>
              <Text style={S.val2}>{f('last_renovation')}</Text>
            </>}
          </View>
        )}
        {has('floors') && (
          <View style={S.row2}>
            <Text style={S.lbl2}>Брой етажи:</Text>
            <Text style={S.val2}>{f('floors')}</Text>
            {has('commissioned') && <>
              <Text style={S.lbl2}>Въведена в експлоатация:</Text>
              <Text style={S.val2}>{f('commissioned')}</Text>
            </>}
          </View>
        )}
        {has('energy_cert') && (
          <View style={S.row}>
            <Text style={S.lbl}>Енергиен сертификат:</Text>
            <Text style={S.val}>{f('energy_cert')}</Text>
          </View>
        )}

        {/* -- Информация за оценка на риска -- */}
        <View style={S.divider} />
        <Text style={S.sectionHead}>Информация за оценка на риска:</Text>

        {/* Fire safety */}
        {has('fire_compliance') && (
          <View style={S.row}><Text style={S.lbl}>Мерките отговарят ли на ПБЗН:</Text><Text style={S.val}>{f('fire_compliance')}</Text></View>
        )}
        {has('fire_alarm') && (
          <View style={S.row}><Text style={S.lbl}>Пожароизвестяване (детектори дим/топлина):</Text><Text style={S.val}>{f('fire_alarm')}</Text></View>
        )}
        {has('sprinklers') && (
          <View style={S.row}><Text style={S.lbl}>Спринклерна инсталация:</Text><Text style={S.val}>{f('sprinklers')}</Text></View>
        )}
        {has('fire_extinguishers') && (
          <View style={S.row}><Text style={S.lbl}>Пожарогасители:</Text><Text style={S.val}>{f('fire_extinguishers')}</Text></View>
        )}
        {has('hydrants') && (
          <View style={S.row}><Text style={S.lbl}>Противопожарни кранове:</Text><Text style={S.val}>{f('hydrants')}</Text></View>
        )}
        {has('additional_water') && (
          <View style={S.row}><Text style={S.lbl}>Допълнителен водоем/резервоар:</Text><Text style={S.val}>{f('additional_water')}</Text></View>
        )}
        {has('detectors') && (
          <View style={S.row}><Text style={S.lbl}>CO/газови детектори:</Text><Text style={S.val}>{f('detectors')}</Text></View>
        )}
        {has('fire_station_distance') && (
          <View style={S.row}><Text style={S.lbl}>Разстояние до пожарна (до 1/1-3/3-5/5-10/над 10 км):</Text><Text style={S.val}>{f('fire_station_distance')}</Text></View>
        )}
        {has('last_inspection') && (
          <View style={S.row}><Text style={S.lbl}>Дата на последен преглед:</Text><Text style={S.val}>{f('last_inspection')}</Text></View>
        )}

        {/* Security */}
        {has('occupancy') && (
          <View style={S.row}><Text style={S.lbl}>Обектът се обитава:</Text><Text style={S.val}>{f('occupancy')}</Text></View>
        )}
        {has('alarm_system') && (
          <View style={S.row}><Text style={S.lbl}>Охранителна система (локална/СОТ):</Text><Text style={S.val}>{f('alarm_system')}</Text></View>
        )}
        {has('guard_type') && (
          <View style={S.row}><Text style={S.lbl}>Охрана (собствена/специализирана):</Text><Text style={S.val}>{f('guard_type')}</Text></View>
        )}
        {has('cctv') && (
          <View style={S.row}><Text style={S.lbl}>Телевизионни камери:</Text><Text style={S.val}>{f('cctv')}</Text></View>
        )}
        {has('other_security') && (
          <View style={S.row}><Text style={S.lbl}>Фотодатчици/обемни датчици/паник-бутон:</Text><Text style={S.val}>{f('other_security')}</Text></View>
        )}

        {/* Risk environment */}
        {has('hazardous_materials') && (
          <View style={S.row}><Text style={S.lbl}>Леснозапалими вещества:</Text><Text style={S.val}>{f('hazardous_materials')}</Text></View>
        )}
        {has('hazardous_desc') && (
          <View style={S.row}><Text style={S.lbl}>Вид опасни вещества:</Text><Text style={S.val}>{f('hazardous_desc')}</Text></View>
        )}
        {has('stored_materials_type') && (
          <View style={S.row}><Text style={S.lbl}>Вид съхранявани материали:</Text><Text style={S.val}>{f('stored_materials_type')}</Text></View>
        )}
        {has('underground_equipment') && (
          <View style={S.row}><Text style={S.lbl}>Машини под нивото на земята:</Text><Text style={S.val}>{f('underground_equipment')}</Text></View>
        )}
        {has('stock_floor_distance') && (
          <View style={S.row}><Text style={S.lbl}>Запаси на &lt;10 см от пода:</Text><Text style={S.val}>{f('stock_floor_distance')}</Text></View>
        )}
        {has('nearest_building_distance') && (
          <View style={S.row}><Text style={S.lbl}>Разстояние до най-близка сграда:</Text><Text style={S.val}>{f('nearest_building_distance')} м</Text></View>
        )}
        {has('water_basin_distance') && (
          <View style={S.row}><Text style={S.lbl}>Близост до воден басейн:</Text><Text style={S.val}>{f('water_basin_distance')}</Text></View>
        )}
        {has('landslide_area') && (
          <View style={S.row}><Text style={S.lbl}>Свлачищен район:</Text><Text style={S.val}>{f('landslide_area')}</Text></View>
        )}

        {/* Claims history */}
        {has('previous_claims') && (
          <View style={S.row}><Text style={S.lbl}>Щети (5 год.) Да/Не:</Text><Text style={S.val}>{f('previous_claims')}</Text></View>
        )}
        {has('claims_details') && (
          <View style={S.row}><Text style={S.lbl}>Дата, вид, размер:</Text><Text style={S.val}>{f('claims_details')}</Text></View>
        )}
        {has('existing_insurance') && (
          <View style={S.row}><Text style={S.lbl}>Действаща застраховка:</Text><Text style={S.val}>{f('existing_insurance')}</Text></View>
        )}
        {has('insurance_declined') && (
          <View style={S.row}><Text style={S.lbl}>Отказвано ли Ви е:</Text><Text style={S.val}>{f('insurance_declined')}</Text></View>
        )}
        {has('insurance_cancelled') && (
          <View style={S.row}><Text style={S.lbl}>Предсрочно прекратяване:</Text><Text style={S.val}>{f('insurance_cancelled')}</Text></View>
        )}
        {has('additional_info') && (
          <View style={S.row}><Text style={S.lbl}>Други факти за риска:</Text><Text style={S.val}>{f('additional_info')}</Text></View>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text>ЗЕАД "Булстрад Виена Иншурънс Груп" · Формуляр 2200-26</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}
