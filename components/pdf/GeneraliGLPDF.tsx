'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapGLFormDataForInsurer } from '@/lib/gl-mappings'
import type { GLFormData } from '@/lib/gl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const RED = '#C8102E'

const S = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.4,
    color: '#000',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerLogoText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: RED,
  },
  headerInsurerName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right',
  },
  headerRule: {
    borderBottom: '1 solid #000',
    marginBottom: 10,
  },

  /* Title */
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },

  /* Section headers */
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1 solid #000',
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 2,
  },

  /* General info box */
  infoBox: {
    border: '1 solid #000',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #000',
  },
  infoRowLast: {
    flexDirection: 'row',
  },
  infoCell: {
    fontSize: 8,
    lineHeight: 1.4,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRight: '0.5 solid #000',
  },
  infoCellLast: {
    fontSize: 8,
    lineHeight: 1.4,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 8,
    color: '#333',
  },
  infoValue: {
    fontSize: 8,
    fontWeight: 'bold',
  },

  /* Clause gray title bar */
  clauseTitleBar: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 3,
    paddingHorizontal: 5,
    marginTop: 8,
    marginBottom: 4,
    borderBottom: '0.5 solid #000',
    borderTop: '0.5 solid #000',
  },
  clauseTitleText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  /* Data rows */
  row: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-end',
  },
  lbl: {
    fontSize: 8,
    color: '#333',
    width: '42%',
  },
  val: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    borderBottom: '0.5 solid #000',
    paddingBottom: 1,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 3,
    alignItems: 'flex-end',
  },
  lbl2: {
    fontSize: 8,
    color: '#333',
    width: '26%',
  },
  val2: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    borderBottom: '0.5 solid #000',
    paddingBottom: 1,
  },

  /* Checkboxes */
  checkRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 18,
  },
  checkLabel: {
    fontSize: 8,
    color: '#000',
    flex: 1,
  },

  /* Signature area */
  sigRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 20,
  },
  sigCol: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 8,
    color: '#333',
    marginBottom: 30,
  },
  sigLine: {
    borderTop: '0.5 solid #000',
    paddingTop: 2,
  },
  sigName: {
    fontSize: 8,
    color: '#555',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#888',
  },
  footerCenter: {
    textAlign: 'center',
    fontSize: 8,
    color: '#888',
  },
  footerRight: {
    textAlign: 'right',
    fontSize: 8,
    color: '#888',
  },
})

interface Props {
  formData: GLFormData
  clientName: string
}

export function GeneraliGLPDF({ formData, clientName }: Props) {
  const d = mapGLFormDataForInsurer(formData, 'generali')
  const f = (id: string) =>
    d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '--')
  const has = (id: string) => f(id) !== '--'
  const chk = (id: string) => (has(id) && f(id) === 'Да' ? '[X]' : '[ ]')

  const date = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const CLAUSES = [
    { id: 'gl_cover_employer', label: 'Отговорност на работодателя' },
    { id: 'gl_cover_activity', label: 'Отговорност за дейността' },
    { id: 'gl_cover_product', label: 'Отговорност за продукта' },
    { id: 'gl_cover_tenant', label: 'Отговорност на наемателя' },
    { id: 'gl_cover_pollution', label: 'Инцидентно замърсяване' },
    { id: 'gl_cover_repair', label: 'Отговорност при ремонтна дейност' },
  ]

  return (
    <Document title={`Дженерали ОГО -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <View style={S.headerRow} fixed>
          <Text style={S.headerLogoText}>GENERALI</Text>
          <Text style={S.headerInsurerName}>ДЖЕНЕРАЛИ ЗАСТРАХОВАНЕ АД</Text>
        </View>
        <View style={S.headerRule} fixed />

        {/* ── Title ── */}
        <Text style={S.title}>
          ВЪПРОСНИК-ПРЕДЛОЖЕНИЕ{'\n'}за застраховка &quot;ОБЩА ГРАЖДАНСКА ОТГОВОРНОСТ&quot;
        </Text>

        {/* ── Section I: General Info Box ── */}
        <Text style={S.sectionHeader}>I. ДАННИ ЗА КАНДИДАТА</Text>

        <View style={S.infoBox}>
          {/* Row 1 */}
          <View style={S.infoRow}>
            <View style={[S.infoCell, { width: '65%' }]}>
              <Text style={S.infoLabel}>Кандидат за застраховане:</Text>
              <Text style={S.infoValue}>{f('gl_company_name')}</Text>
            </View>
            <View style={[S.infoCellLast, { width: '35%' }]}>
              <Text style={S.infoLabel}>ЕИК/ЕГН:</Text>
              <Text style={S.infoValue}>{f('gl_eik')}</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View style={S.infoRow}>
            <View style={[S.infoCell, { width: '65%' }]}>
              <Text style={S.infoLabel}>Адрес на управление:</Text>
              <Text style={S.infoValue}>{f('gl_address')}</Text>
            </View>
            <View style={[S.infoCellLast, { width: '35%' }]}>
              <Text style={S.infoLabel}>Тел/Факс:</Text>
              <Text style={S.infoValue}>{f('gl_phone')}</Text>
            </View>
          </View>

          {/* Row 3 */}
          <View style={S.infoRow}>
            <View style={[S.infoCell, { width: '35%' }]}>
              <Text style={S.infoLabel}>Представляван от:</Text>
              <Text style={S.infoValue}>{f('gl_representative')}</Text>
            </View>
            <View style={[S.infoCell, { width: '20%' }]}>
              <Text style={S.infoLabel}>Длъжност:</Text>
              <Text style={S.infoValue}>{f('gl_position')}</Text>
            </View>
            <View style={[S.infoCell, { width: '20%' }]}>
              <Text style={S.infoLabel}>моб.:</Text>
              <Text style={S.infoValue}>{f('gl_mobile')}</Text>
            </View>
            <View style={[S.infoCellLast, { width: '25%' }]}>
              <Text style={S.infoLabel}>e-mail:</Text>
              <Text style={S.infoValue}>{f('gl_email')}</Text>
            </View>
          </View>

          {/* Row 4 -- full width */}
          <View style={S.infoRow}>
            <View style={[S.infoCellLast, { width: '100%' }]}>
              <Text style={S.infoLabel}>Основна дейност:</Text>
              <Text style={S.infoValue}>{f('gl_activity')}</Text>
            </View>
          </View>

          {/* Row 5 */}
          <View style={S.infoRowLast}>
            <View style={[S.infoCell, { width: '50%' }]}>
              <Text style={S.infoLabel}>Година на основаване:</Text>
              <Text style={S.infoValue}>{f('gl_year_founded')}</Text>
            </View>
            <View style={[S.infoCellLast, { width: '50%' }]}>
              <Text style={S.infoLabel}>Web-site:</Text>
              <Text style={S.infoValue}>{f('gl_website')}</Text>
            </View>
          </View>
        </View>

        {/* ── Section II: Coverage Selection ── */}
        <Text style={S.sectionHeader}>II. ЖЕЛАНИ КЛАУЗИ</Text>
        {CLAUSES.map((c) => (
          <View key={c.id} style={S.checkRow}>
            <Text style={S.checkbox}>{chk(c.id)}</Text>
            <Text style={S.checkLabel}>{c.label}</Text>
          </View>
        ))}

        {/* ── Section III: Employer Liability ── */}
        <View style={S.clauseTitleBar}>
          <Text style={S.clauseTitleText}>III. КЛ. ОТГОВОРНОСТ НА РАБОТОДАТЕЛЯ</Text>
        </View>
        {has('gl_employees_count') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.1 Брой служители:</Text>
            <Text style={S.val}>{f('gl_employees_count')}</Text>
          </View>
        )}
        {(has('gl_annual_wage_fund') || has('gl_wage_fund_forecast')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>т.2 Год. фонд РЗ (изм.):</Text>
            <Text style={S.val2}>{f('gl_annual_wage_fund')}</Text>
            <Text style={S.lbl2}>Прогн. (насто.):</Text>
            <Text style={S.val2}>{f('gl_wage_fund_forecast')}</Text>
          </View>
        )}
        {has('gl_work_accidents_5y') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.3 Трудови злополуки (5 год.)?</Text>
            <Text style={S.val}>{f('gl_work_accidents_5y')}</Text>
          </View>
        )}
        {has('gl_claims_from_workers') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.4 Предявени искове?</Text>
            <Text style={S.val}>{f('gl_claims_from_workers')}</Text>
          </View>
        )}
        {has('gl_claims_details') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.5 Брой, размер, вид:</Text>
            <Text style={S.val}>{f('gl_claims_details')}</Text>
          </View>
        )}
        {has('gl_workers_insured') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.6 Работниците застраховани?</Text>
            <Text style={S.val}>{f('gl_workers_insured')}</Text>
          </View>
        )}
        {has('gl_prev_insurer') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.7 Предишен застраховател:</Text>
            <Text style={S.val}>{f('gl_prev_insurer')}</Text>
          </View>
        )}

        {/* ── Section IV: Activity Liability ── */}
        <View style={S.clauseTitleBar}>
          <Text style={S.clauseTitleText}>IV. КЛ. ОТГОВОРНОСТ ЗА ДЕЙНОСТТА</Text>
        </View>
        {has('gl_activity_description') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.1 Подробна дейност:</Text>
            <Text style={S.val}>{f('gl_activity_description')}</Text>
          </View>
        )}
        {(has('gl_annual_turnover') || has('gl_turnover_forecast')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>т.2 Год. оборот (изм.):</Text>
            <Text style={S.val2}>{f('gl_annual_turnover')}</Text>
            <Text style={S.lbl2}>Прогн.:</Text>
            <Text style={S.val2}>{f('gl_turnover_forecast')}</Text>
          </View>
        )}
        {has('gl_premises_address') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.3.1 Адрес на помещения:</Text>
            <Text style={S.val}>{f('gl_premises_address')}</Text>
          </View>
        )}
        {has('gl_premises_type') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.3.2 Вид помещение:</Text>
            <Text style={S.val}>{f('gl_premises_type')}</Text>
          </View>
        )}
        {has('gl_public_access') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.3.3 Достъп на външни лица:</Text>
            <Text style={S.val}>{f('gl_public_access')}</Text>
          </View>
        )}
        {(has('gl_last_elec_inspection') || has('gl_last_plumbing_check')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>т.3.4 Ел. инсталация:</Text>
            <Text style={S.val2}>{f('gl_last_elec_inspection')}</Text>
            <Text style={S.lbl2}>ВиК:</Text>
            <Text style={S.val2}>{f('gl_last_plumbing_check')}</Text>
          </View>
        )}
        {(has('gl_heating_type') || has('gl_fire_equipment')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>т.3.5 Отопление:</Text>
            <Text style={S.val2}>{f('gl_heating_type')}</Text>
            <Text style={S.lbl2}>т.3.6 Пожарогасене:</Text>
            <Text style={S.val2}>{f('gl_fire_equipment')}</Text>
          </View>
        )}
        {has('gl_hazardous_materials') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.3.10 Опасни материали?</Text>
            <Text style={S.val}>{f('gl_hazardous_materials')}</Text>
          </View>
        )}
        {has('gl_third_party_claims_5y') && (
          <View style={S.row}>
            <Text style={S.lbl}>т.6 Щети на клиенти (5 год.)?</Text>
            <Text style={S.val}>{f('gl_third_party_claims_5y')}</Text>
          </View>
        )}

        {/* ── Section V: Limits ── */}
        <Text style={S.sectionHeader}>V. ЛИМИТИ И САМОУЧАСТИЕ</Text>
        {(has('gl_single_limit') || has('gl_aggregate_limit')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>Лимит едно събитие:</Text>
            <Text style={S.val2}>{f('gl_single_limit')} {f('gl_currency')}</Text>
            <Text style={S.lbl2}>В агрегат:</Text>
            <Text style={S.val2}>{f('gl_aggregate_limit')} {f('gl_currency')}</Text>
          </View>
        )}
        {has('gl_deductible') && (
          <View style={S.row}>
            <Text style={S.lbl}>Самоучастие:</Text>
            <Text style={S.val}>{f('gl_deductible')}</Text>
          </View>
        )}
        {has('gl_territory') && (
          <View style={S.row}>
            <Text style={S.lbl}>Териториална валидност:</Text>
            <Text style={S.val}>{f('gl_territory')}</Text>
          </View>
        )}
        {(has('gl_period_from') || has('gl_period_to')) && (
          <View style={S.row2}>
            <Text style={S.lbl2}>Начална дата:</Text>
            <Text style={S.val2}>{f('gl_period_from')}</Text>
            <Text style={S.lbl2}>Крайна дата:</Text>
            <Text style={S.val2}>{f('gl_period_to')}</Text>
          </View>
        )}
        {has('gl_retroactive_date') && (
          <View style={S.row}>
            <Text style={S.lbl}>Ретроактивна дата:</Text>
            <Text style={S.val}>{f('gl_retroactive_date')}</Text>
          </View>
        )}

        {/* ── Note ── */}
        <View style={{ marginTop: 8, marginBottom: 4 }}>
          <Text style={{ fontSize: 8, color: '#555', fontStyle: 'italic' }}>
            Дата на попълване: {date} -- Генерирано от InsureUnify
          </Text>
        </View>

        {/* ── Signature ── */}
        <View style={S.sigRow}>
          <View style={S.sigCol}>
            <Text style={S.sigLabel}>Кандидат (подпис и печат):</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.sigCol}>
            <Text style={S.sigLabel}>Застрахователен посредник:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}> </Text>
            </View>
          </View>
        </View>

        {/* ── Footer (fixed on every page) ── */}
        <View style={S.footer} fixed>
          <Text style={S.footerCenter}>
            ЕИК 030269049 -- София 1504, бул. &quot;Кн. Ал. Дондуков&quot; 68
          </Text>
          <Text
            style={S.footerRight}
            render={({ pageNumber, totalPages }) =>
              `Страница ${pageNumber} от ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  )
}
