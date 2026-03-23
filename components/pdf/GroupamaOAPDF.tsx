'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapOAFormDataForInsurer } from '@/lib/oa-mappings'
import type { OAFormData } from '@/lib/oa-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf',    fontWeight: 'bold' },
  ],
})

const GREEN = '#00A94F'

const S = StyleSheet.create({
  page:        { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  header:      { marginBottom: 10 },
  companyLine: { fontSize: 12, fontWeight: 700, color: GREEN, textAlign: 'center' },
  subLine:     { fontSize: 7.5, color: '#555', textAlign: 'center', marginTop: 2 },
  title:       { fontSize: 10.5, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 12, borderTop: `1.5 solid ${GREEN}`, borderBottom: `1.5 solid ${GREEN}`, paddingVertical: 5 },
  sectionHead: { fontSize: 9.5, fontWeight: 700, marginTop: 11, marginBottom: 5, color: GREEN, textTransform: 'uppercase' },
  row:         { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-end' },
  lbl:         { fontSize: 8.5, color: '#444', width: '44%' },
  val:         { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2:        { flexDirection: 'row', gap: 10, marginBottom: 3.5, alignItems: 'flex-end' },
  lbl2:        { fontSize: 8.5, color: '#444', width: '28%' },
  val2:        { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  checkRow:    { flexDirection: 'row', marginBottom: 4, alignItems: 'center', gap: 6 },
  checkbox:    { width: 10, height: 10, border: `1 solid #aaa`, fontSize: 8, textAlign: 'center', lineHeight: 1.2 },
  checkLabel:  { fontSize: 8.5, color: '#333', flex: 1 },
  divider:     { borderTop: `0.5 solid #ddd`, marginTop: 8, marginBottom: 5 },
  footer:      { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${GREEN}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  note:        { fontSize: 7.5, color: '#888', marginTop: 4, fontStyle: 'italic' },
  pkgBox:      { border: `1 solid ${GREEN}`, borderRadius: 3, padding: 6, marginBottom: 6 },
  pkgTitle:    { fontSize: 9, fontWeight: 700, color: GREEN, marginBottom: 4 },
  optGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  optItem:     { flexDirection: 'row', gap: 3, alignItems: 'center', width: '48%' },
})

interface Props { formData: OAFormData; clientName: string }

export function GroupamaOAPDF({ formData, clientName }: Props) {
  const d   = mapOAFormDataForInsurer(formData, 'groupama')
  const f   = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '—')
  const has = (id: string) => formData[id] !== undefined && formData[id] !== ''
  const isYes = (id: string) => formData[id] === 'yes'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const isMandatory = formData.oa_insurance_type !== 'voluntary'

  const OPTIONAL_COVERS = [
    { id: 'oa_opt_medical_expenses',    label: 'Медицински разходи' },
    { id: 'oa_opt_fractures',           label: 'Фрактури' },
    { id: 'oa_opt_burns',               label: 'Изгаряния' },
    { id: 'oa_opt_medical_transport',   label: 'Медицинско транспортиране' },
    { id: 'oa_opt_surgery',             label: 'Оперативно лечение' },
    { id: 'oa_opt_dental',              label: 'Спешна стоматологична помощ' },
    { id: 'oa_opt_hospitalization',     label: 'Хоспитализация' },
    { id: 'oa_opt_recovery',            label: 'Възстановяване след хоспитализация' },
  ]

  return (
    <Document title={`Групама Трудова злополука — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.companyLine}>ГРУПАМА ЗАСТРАХОВАНЕ ЕАД</Text>
          <Text style={S.subLine}>ЕИК 131421443 · бул. „Цариградско шосе" 47А, бл. В, ет. 3, 1124 София</Text>
          <Text style={S.title}>ВЪПРОСНИК ЗА СКЛЮЧВАНЕ НА{'\n'}ГРУПОВА ЗАСТРАХОВКА „ЗЛОПОЛУКА"</Text>
        </View>

        {/* Section I: Applicant */}
        <Text style={S.sectionHead}>ДАННИ ЗА КАНДИДАТА ЗА ЗАСТРАХОВАНЕ</Text>
        <View style={S.row}><Text style={S.lbl}>Наименование:</Text><Text style={S.val}>{f('oa_company_name')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>ЕИК:</Text><Text style={S.val2}>{f('oa_eik')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Адрес за кореспонденция:</Text><Text style={S.val}>{f('oa_address')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>тел.:</Text><Text style={S.val2}>{f('oa_phone')}</Text>
          {has('oa_representative') && (
            <><Text style={S.lbl2}>Представляван от:</Text><Text style={S.val2}>{f('oa_representative')}</Text></>
          )}
        </View>
        <View style={S.row}><Text style={S.lbl}>Предмет на дейност:</Text><Text style={S.val}>{f('oa_activity')}</Text></View>

        <View style={S.divider} />

        {/* Section II: Insurance details */}
        <Text style={S.sectionHead}>ДАННИ ЗА ЗАСТРАХОВКАТА</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Брой лица:</Text><Text style={S.val2}>{f('oa_persons_count')}</Text>
          <Text style={S.lbl2}>Начало:</Text><Text style={S.val2}>{f('oa_period_from')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Срок (месеци):</Text><Text style={S.val2}>{f('oa_period_months') !== '—' ? f('oa_period_months') : '12'}</Text>
          <Text style={S.lbl2}>Валута:</Text><Text style={S.val2}>{f('oa_currency')}</Text>
        </View>

        <View style={S.divider} />

        {/* Section III: Packages */}
        <Text style={S.sectionHead}>ИЗБОР НА ПАКЕТ</Text>

        {/* Package A */}
        <View style={[S.pkgBox, isMandatory ? { borderColor: GREEN } : { borderColor: '#ddd' }]}>
          <Text style={S.pkgTitle}>
            {isMandatory ? '[X]' : '[ ]'} ПАКЕТ А — ЗАДЪЛЖИТЕЛНА застраховка (по Наредба ПМС № 24/2006)
          </Text>
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_death') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>Смърт и трайно намалена работоспособност от трудова злополука</Text>
          </View>
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_temporary_disability') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>Временна неработоспособност от трудова злополука</Text>
          </View>
          {has('oa_temp_disability_period') && (
            <View style={{ ...S.row, marginLeft: 16 }}>
              <Text style={{ fontSize: 8, color: '#666' }}>Период за ВН: {f('oa_temp_disability_period')}</Text>
            </View>
          )}
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_domestic_accident') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>От битова злополука (избираемо покритие)</Text>
          </View>
          <View style={S.row2}>
            <Text style={S.lbl2}>Общ фонд р.з.:</Text><Text style={S.val2}>{f('oa_monthly_wage_fund')}</Text>
            {has('oa_si_per_person') && (
              <><Text style={S.lbl2}>З.С. на лице:</Text><Text style={S.val2}>{f('oa_si_per_person')}</Text></>
            )}
          </View>
          {has('oa_si_basis') && (
            <View style={S.row}><Text style={S.lbl}>База:</Text><Text style={S.val}>{f('oa_si_basis')}</Text></View>
          )}
        </View>

        {/* Package B */}
        <View style={[S.pkgBox, !isMandatory ? { borderColor: GREEN } : { borderColor: '#ddd' }]}>
          <Text style={S.pkgTitle}>
            {!isMandatory ? '[X]' : '[ ]'} ПАКЕТ Б — ДОБРОВОЛНА застраховка
          </Text>
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_death') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>Смърт и трайно намалена работоспособност</Text>
          </View>
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_temporary_disability') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>Временна неработоспособност{has('oa_temp_disability_period') ? ` (${f('oa_temp_disability_period')})` : ''}</Text>
          </View>
          <View style={S.checkRow}>
            <View style={S.checkbox}><Text>{isYes('oa_cover_domestic_accident') ? 'X' : ' '}</Text></View>
            <Text style={S.checkLabel}>От битова злополука (избираемо)</Text>
          </View>
          {has('oa_si_per_person') && (
            <View style={S.row2}>
              <Text style={S.lbl2}>З.С. на едно лице:</Text><Text style={S.val2}>{f('oa_si_per_person')} {f('oa_currency')}</Text>
            </View>
          )}
        </View>

        <View style={S.divider} />

        {/* Section IV: Optional covers */}
        <Text style={S.sectionHead}>ДОПЪЛНИТЕЛНИ ПОКРИТИЯ</Text>
        <View style={S.optGrid}>
          {OPTIONAL_COVERS.map((c) => (
            <View key={c.id} style={S.optItem}>
              <View style={S.checkbox}><Text>{isYes(c.id) ? 'X' : ' '}</Text></View>
              <Text style={{ fontSize: 8, color: '#333' }}>{c.label}</Text>
            </View>
          ))}
        </View>
        {has('oa_opt_si_per_person') && (
          <View style={{ ...S.row, marginTop: 5 }}>
            <Text style={S.lbl}>З.С. за допълн. покрития (на лице):</Text>
            <Text style={S.val}>{f('oa_opt_si_per_person')} {f('oa_currency')}</Text>
          </View>
        )}

        <View style={S.divider} />
        <Text style={S.note}>Дата на попълване: {date} · Генерирано от InsureUnify</Text>

        {/* Signature */}
        <View style={{ marginTop: 14, flexDirection: 'row', gap: 40 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: '#555' }}>Кандидат (подпис и печат):</Text>
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
          <Text>Групама Застраховане ЕАД · Групова з-ка Злополука</Text>
          <Text>{clientName}</Text>
          <Text render={({ pageNumber, totalPages }) => `стр. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
