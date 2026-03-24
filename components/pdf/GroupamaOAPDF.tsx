'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapOAFormDataForInsurer } from '@/lib/oa-mappings'
import type { OAFormData } from '@/lib/oa-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const GREEN = '#00A94F'

const S = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#111',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
  },
  /* Header */
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logoText: { fontSize: 11, fontWeight: 'bold', color: GREEN },
  insurerName: { fontSize: 11, fontWeight: 'bold', color: GREEN, textAlign: 'right' },
  headerHr: { borderBottom: '1 solid #000', marginBottom: 10 },
  /* Title */
  title: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 14 },
  /* Section headers */
  sectionHead: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1 solid #000', marginTop: 12, marginBottom: 6, paddingBottom: 2, color: '#111' },
  /* Data rows */
  row: { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-end' },
  lbl: { fontSize: 9, color: '#444', width: '44%' },
  val: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #000', paddingBottom: 1 },
  row2: { flexDirection: 'row', gap: 10, marginBottom: 3, alignItems: 'flex-end' },
  lbl2: { fontSize: 9, color: '#444', width: '28%' },
  val2: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #000', paddingBottom: 1 },
  /* Checkboxes */
  checkRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'center', gap: 6 },
  checkbox: { fontSize: 8 },
  checkLabel: { fontSize: 8, color: '#333', flex: 1 },
  /* Package boxes */
  pkgBox: { border: '1 solid #000', padding: 8, marginBottom: 8 },
  pkgBoxActive: { border: `1 solid ${GREEN}`, padding: 8, marginBottom: 8, backgroundColor: '#f0faf4' },
  pkgTitle: { fontSize: 9, fontWeight: 'bold', marginBottom: 5 },
  /* Table for optional covers */
  table: { border: '1 solid #000', marginTop: 4 },
  tHeaderRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000' },
  tHeaderCell: { fontSize: 8, fontWeight: 'bold', padding: '3 6', flex: 1 },
  tHeaderCellSm: { fontSize: 8, fontWeight: 'bold', padding: '3 6', width: 60, textAlign: 'center', borderLeft: '0.5 solid #000' },
  tRow: { flexDirection: 'row', borderBottom: '0.5 solid #000' },
  tCell: { fontSize: 8, padding: '3 6', flex: 1 },
  tCellSm: { fontSize: 8, padding: '3 6', width: 60, textAlign: 'center', borderLeft: '0.5 solid #000' },
  /* Divider */
  divider: { borderTop: '0.5 solid #000', marginTop: 8, marginBottom: 6 },
  /* Signature */
  signRow: { flexDirection: 'row', gap: 40, marginTop: 20 },
  signBlock: { flex: 1 },
  signLabel: { fontSize: 8, color: '#555' },
  signLine: { borderTop: '0.5 solid #000', marginTop: 28, paddingTop: 2 },
  signName: { fontSize: 8, color: '#888' },
  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: '#888',
  },
  footerCenter: { textAlign: 'center', fontSize: 8, color: '#888' },
  footerRight: { textAlign: 'right', fontSize: 8, color: '#888' },
})

interface Props { formData: OAFormData; clientName: string }

export function GroupamaOAPDF({ formData, clientName }: Props) {
  const d = mapOAFormDataForInsurer(formData, 'groupama')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => formData[id] !== undefined && formData[id] !== ''
  const isYes = (id: string) => formData[id] === 'yes'
  const chk = (checked: boolean) => checked ? '[X]' : '[ ]'

  const isMandatory = formData.oa_insurance_type !== 'voluntary'

  const OPTIONAL_COVERS = [
    { id: 'oa_opt_medical_expenses',  label: 'Медицински разходи' },
    { id: 'oa_opt_fractures',         label: 'Фрактури' },
    { id: 'oa_opt_burns',             label: 'Изгаряния' },
    { id: 'oa_opt_medical_transport', label: 'Медицинско транспортиране' },
    { id: 'oa_opt_surgery',           label: 'Оперативно лечение' },
    { id: 'oa_opt_dental',            label: 'Спешна стоматологична помощ' },
    { id: 'oa_opt_hospitalization',   label: 'Хоспитализация' },
    { id: 'oa_opt_recovery',          label: 'Възстановяване след хоспитализация' },
  ]

  return (
    <Document title={`Групама Трудова злополука -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.headerRow}>
          <Text style={S.logoText}>ГРУПАМА ЗАСТРАХОВАНЕ ЕАД</Text>
          <Text style={S.insurerName}>Групама</Text>
        </View>
        <View style={S.headerHr} />

        {/* ── Title ── */}
        <Text style={S.title}>
          {'ВЪПРОСНИК ЗА СКЛЮЧВАНЕ НА ГРУПОВА ЗАСТРАХОВКА "ЗЛОПОЛУКА"'}
        </Text>

        {/* ── Section: Applicant ── */}
        <Text style={S.sectionHead}>ДАННИ ЗА КАНДИДАТА</Text>
        <View style={S.row}><Text style={S.lbl}>Наименование:</Text><Text style={S.val}>{f('oa_company_name')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>ЕИК:</Text><Text style={S.val2}>{f('oa_eik')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Адрес за кореспонденция:</Text><Text style={S.val}>{f('oa_address')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Телефон:</Text><Text style={S.val2}>{f('oa_phone')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Представляван от:</Text><Text style={S.val}>{f('oa_representative')}</Text></View>
        <View style={S.row}><Text style={S.lbl}>Предмет на дейност:</Text><Text style={S.val}>{f('oa_activity')}</Text></View>

        {/* ── Section: Insurance details ── */}
        <Text style={S.sectionHead}>ДАННИ ЗА ЗАСТРАХОВКАТА</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Брой лица:</Text><Text style={S.val2}>{f('oa_persons_count')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Начало:</Text><Text style={S.val2}>{f('oa_period_from')}</Text>
          <Text style={S.lbl2}>Край:</Text><Text style={S.val2}>{f('oa_period_to')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Срок (месеци):</Text><Text style={S.val2}>{f('oa_period_months') !== '--' ? f('oa_period_months') : '12'}</Text>
          <Text style={S.lbl2}>Валута:</Text><Text style={S.val2}>{f('oa_currency')}</Text>
        </View>

        {/* ── Section: Package selection ── */}
        <Text style={S.sectionHead}>ИЗБОР НА ПАКЕТ</Text>

        {/* Package A - Mandatory */}
        <View style={isMandatory ? S.pkgBoxActive : S.pkgBox}>
          <Text style={S.pkgTitle}>
            {chk(isMandatory)} ПАКЕТ А -- ЗАДЪЛЖИТЕЛНА застраховка (по Наредба ПМС No. 24/2006)
          </Text>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_death'))}</Text>
            <Text style={S.checkLabel}>Смърт от трудова злополука</Text>
          </View>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_permanent_disability'))}</Text>
            <Text style={S.checkLabel}>Трайно намалена работоспособност от трудова злополука</Text>
          </View>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_temporary_disability'))}</Text>
            <Text style={S.checkLabel}>Временна неработоспособност от трудова злополука</Text>
          </View>
          {has('oa_temp_disability_period') && (
            <View style={{ marginLeft: 20, marginBottom: 3 }}>
              <Text style={{ fontSize: 8, color: '#666' }}>Период за ВН: {f('oa_temp_disability_period')}</Text>
            </View>
          )}
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_domestic_accident'))}</Text>
            <Text style={S.checkLabel}>От битова злополука (избираемо покритие)</Text>
          </View>
          <View style={S.divider} />
          <View style={S.row2}>
            <Text style={S.lbl2}>Общ фонд р.з.:</Text><Text style={S.val2}>{f('oa_monthly_wage_fund')}</Text>
          </View>
          {has('oa_si_per_person') && (
            <View style={S.row2}>
              <Text style={S.lbl2}>З.С. на лице:</Text><Text style={S.val2}>{f('oa_si_per_person')}</Text>
            </View>
          )}
        </View>

        {/* Package B - Voluntary */}
        <View style={!isMandatory ? S.pkgBoxActive : S.pkgBox}>
          <Text style={S.pkgTitle}>
            {chk(!isMandatory)} ПАКЕТ Б -- ДОБРОВОЛНА застраховка
          </Text>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_death'))}</Text>
            <Text style={S.checkLabel}>Смърт от злополука</Text>
          </View>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_permanent_disability'))}</Text>
            <Text style={S.checkLabel}>Трайно намалена работоспособност</Text>
          </View>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_temporary_disability'))}</Text>
            <Text style={S.checkLabel}>Временна неработоспособност{has('oa_temp_disability_period') ? ` (${f('oa_temp_disability_period')})` : ''}</Text>
          </View>
          <View style={S.checkRow}>
            <Text style={S.checkbox}>{chk(isYes('oa_cover_domestic_accident'))}</Text>
            <Text style={S.checkLabel}>От битова злополука (избираемо)</Text>
          </View>
          <View style={S.divider} />
          <View style={S.row2}>
            <Text style={S.lbl2}>Общ фонд р.з.:</Text><Text style={S.val2}>{f('oa_monthly_wage_fund')}</Text>
          </View>
          {has('oa_si_per_person') && (
            <View style={S.row2}>
              <Text style={S.lbl2}>З.С. на лице:</Text><Text style={S.val2}>{f('oa_si_per_person')} {f('oa_currency')}</Text>
            </View>
          )}
        </View>

        {/* ── Section: Optional covers ── */}
        <Text style={S.sectionHead}>ДОПЪЛНИТЕЛНИ ПОКРИТИЯ</Text>
        <View style={S.table}>
          <View style={S.tHeaderRow}>
            <Text style={S.tHeaderCell}>Покритие</Text>
            <Text style={S.tHeaderCellSm}>Избрано</Text>
          </View>
          {OPTIONAL_COVERS.map((c) => (
            <View key={c.id} style={S.tRow}>
              <Text style={S.tCell}>{c.label}</Text>
              <Text style={S.tCellSm}>{chk(isYes(c.id))}</Text>
            </View>
          ))}
        </View>
        {has('oa_opt_si_per_person') && (
          <View style={{ ...S.row, marginTop: 6 }}>
            <Text style={S.lbl}>З.С. за допълн. покрития (на лице):</Text>
            <Text style={S.val}>{f('oa_opt_si_per_person')} {f('oa_currency')}</Text>
          </View>
        )}

        {/* ── Signature ── */}
        <View style={S.signRow}>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Кандидат (подпис и печат):</Text>
            <View style={S.signLine}>
              <Text style={S.signName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.signBlock}>
            <Text style={S.signLabel}>Застрахователен посредник:</Text>
            <View style={S.signLine} />
          </View>
        </View>

        {/* ── Footer (fixed) ── */}
        <View style={S.footer} fixed>
          <Text> </Text>
          <Text style={S.footerCenter}>ЕИК 131421443 · бул. "Цариградско шосе" 47А, бл. В, ет. 3, 1124 София</Text>
          <Text style={S.footerRight} render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
