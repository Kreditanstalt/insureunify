'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapGLFormDataForInsurer } from '@/lib/gl-mappings'
import type { GLFormData } from '@/lib/gl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Roboto-Bold.ttf',    fontWeight: 'bold' },
  ],
})

const RED = '#C8102E'

const S = StyleSheet.create({
  page:       { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  header:     { marginBottom: 12 },
  companyLine: { fontSize: 13, fontWeight: 700, color: RED, textAlign: 'center' },
  subLine:    { fontSize: 8, color: '#555', textAlign: 'center', marginTop: 2 },
  title:      { fontSize: 11, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 14, borderTop: `1.5 solid ${RED}`, borderBottom: `1.5 solid ${RED}`, paddingVertical: 5 },
  sectionHead: { fontSize: 9.5, fontWeight: 700, marginTop: 12, marginBottom: 5, color: RED, textTransform: 'uppercase' },
  row:        { flexDirection: 'row', marginBottom: 3.5, alignItems: 'flex-end' },
  lbl:        { fontSize: 8.5, color: '#444', width: '42%' },
  val:        { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  row2:       { flexDirection: 'row', gap: 10, marginBottom: 3.5, alignItems: 'flex-end' },
  lbl2:       { fontSize: 8.5, color: '#444', width: '26%' },
  val2:       { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1 },
  checkRow:   { flexDirection: 'row', marginBottom: 3, alignItems: 'center', gap: 4 },
  checkbox:   { width: 10, height: 10, border: `1 solid #aaa`, fontSize: 8, textAlign: 'center', lineHeight: 1.2 },
  checkLabel: { fontSize: 8.5, color: '#333', flex: 1 },
  divider:    { borderTop: `0.5 solid #ddd`, marginTop: 8, marginBottom: 4 },
  footer:     { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${RED}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  pageNum:    { fontSize: 7, color: '#aaa', textAlign: 'center', marginTop: 2 },
  note:       { fontSize: 7.5, color: '#888', marginTop: 4, fontStyle: 'italic' },
})

interface Props { formData: GLFormData; clientName: string }

export function GeneraliGLPDF({ formData, clientName }: Props) {
  const d  = mapGLFormDataForInsurer(formData, 'generali')
  const f  = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '—')
  const has = (id: string) => f(id) !== '—'

  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const CLAUSES = [
    { id: 'gl_cover_employer',  label: 'Отговорност на работодателя' },
    { id: 'gl_cover_activity',  label: 'Отговорност за дейността' },
    { id: 'gl_cover_product',   label: 'Отговорност за продукта' },
    { id: 'gl_cover_tenant',    label: 'Отговорност на наемателя' },
    { id: 'gl_cover_pollution', label: 'Инцидентно замърсяване' },
    { id: 'gl_cover_repair',    label: 'Отговорност при ремонтна дейност' },
  ]

  return (
    <Document title={`Дженерали ОГО — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.companyLine}>ДЖЕНЕРАЛИ ЗАСТРАХОВАНЕ АД</Text>
          <Text style={S.subLine}>ЕИК 030269049 · гр. София 1504, бул. „Кн. Ал. Дондуков" 68</Text>
          <Text style={S.title}>ВЪПРОСНИК-ПРЕДЛОЖЕНИЕ ЗА ЗАСТРАХОВКА{'\n'}ОБЩА ГРАЖДАНСКА ОТГОВОРНОСТ (ОГО)</Text>
        </View>

        {/* Section I: Applicant */}
        <Text style={S.sectionHead}>I. ДАННИ ЗА КАНДИДАТА</Text>
        <View style={S.row}><Text style={S.lbl}>Наименование:</Text><Text style={S.val}>{f('gl_company_name')}</Text></View>
        <View style={S.row}><Text style={S.lbl}>ЕИК / ЕГН:</Text><Text style={S.val}>{f('gl_eik')}</Text></View>
        <View style={S.row}><Text style={S.lbl}>Адрес на управление:</Text><Text style={S.val}>{f('gl_address')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Тел / Факс.:</Text><Text style={S.val2}>{f('gl_phone')}</Text>
          <Text style={S.lbl2}>моб. тел.:</Text><Text style={S.val2}>{f('gl_mobile')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>e-mail:</Text><Text style={S.val2}>{f('gl_email')}</Text>
          <Text style={S.lbl2}>Web-site:</Text><Text style={S.val2}>{f('gl_website')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Представляван от:</Text><Text style={S.val}>{f('gl_representative')}</Text></View>
        <View style={S.row2}>
          <Text style={S.lbl2}>Длъжност:</Text><Text style={S.val2}>{f('gl_position')}</Text>
          <Text style={S.lbl2}>Год. на основаване:</Text><Text style={S.val2}>{f('gl_year_founded')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>Основна дейност:</Text><Text style={S.val}>{f('gl_activity')}</Text></View>

        {/* Section II: Coverage Selection */}
        <Text style={S.sectionHead}>II. ЖЕЛАНИ КЛАУЗИ (моля, отбележете)</Text>
        {CLAUSES.map((c) => (
          <View key={c.id} style={S.checkRow}>
            <View style={S.checkbox}>
              <Text>{has(c.id) && f(c.id) === 'Да' ? 'X' : ' '}</Text>
            </View>
            <Text style={S.checkLabel}>{c.label}</Text>
            <Text style={{ fontSize: 8, color: '#666', width: 40 }}>
              {has(c.id) ? f(c.id) : '—'}
            </Text>
          </View>
        ))}

        {/* Section III: Employer Liability */}
        <Text style={S.sectionHead}>III. КЛ. ОТГОВОРНОСТ НА РАБОТОДАТЕЛЯ</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>т.1 Брой служители:</Text><Text style={S.val2}>{f('gl_employees_count')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>т.2 Год. фонд РЗ (изм.):</Text><Text style={S.val2}>{f('gl_annual_wage_fund')}</Text>
          <Text style={S.lbl2}>Прогн. (насто.):</Text><Text style={S.val2}>{f('gl_wage_fund_forecast')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>т.3 Трудови злополуки (5 год.)?</Text><Text style={S.val}>{f('gl_work_accidents_5y')}</Text></View>
        <View style={S.row}><Text style={S.lbl}>т.4 Предявени искове?</Text><Text style={S.val}>{f('gl_claims_from_workers')}</Text></View>
        {has('gl_claims_details') && (
          <View style={S.row}><Text style={S.lbl}>т.5 Брой, размер, вид:</Text><Text style={S.val}>{f('gl_claims_details')}</Text></View>
        )}
        <View style={S.row}><Text style={S.lbl}>т.6 Работниците застраховани?</Text><Text style={S.val}>{f('gl_workers_insured')}</Text></View>
        {has('gl_prev_insurer') && (
          <View style={S.row}><Text style={S.lbl}>т.7 Предишен застраховател:</Text><Text style={S.val}>{f('gl_prev_insurer')}</Text></View>
        )}

        <View style={S.divider} />

        {/* Section IV: Activity Liability */}
        <Text style={S.sectionHead}>IV. КЛ. ОТГОВОРНОСТ ЗА ДЕЙНОСТТА</Text>
        {has('gl_activity_description') && (
          <View style={S.row}><Text style={S.lbl}>т.1 Подробна дейност:</Text><Text style={S.val}>{f('gl_activity_description')}</Text></View>
        )}
        <View style={S.row2}>
          <Text style={S.lbl2}>т.2 Год. оборот (изм.):</Text><Text style={S.val2}>{f('gl_annual_turnover')}</Text>
          <Text style={S.lbl2}>Прогн.:</Text><Text style={S.val2}>{f('gl_turnover_forecast')}</Text>
        </View>
        {has('gl_premises_address') && (
          <View style={S.row}><Text style={S.lbl}>т.3.1 Адрес на помещения:</Text><Text style={S.val}>{f('gl_premises_address')}</Text></View>
        )}
        {has('gl_premises_type') && (
          <View style={S.row}><Text style={S.lbl}>т.3.2 Вид помещение:</Text><Text style={S.val}>{f('gl_premises_type')}</Text></View>
        )}
        {has('gl_public_access') && (
          <View style={S.row}><Text style={S.lbl}>т.3.3 Достъп на външни лица:</Text><Text style={S.val}>{f('gl_public_access')}</Text></View>
        )}
        <View style={S.row2}>
          <Text style={S.lbl2}>т.3.4 Ел. инсталация:</Text><Text style={S.val2}>{f('gl_last_elec_inspection')}</Text>
          <Text style={S.lbl2}>ВиК:</Text><Text style={S.val2}>{f('gl_last_plumbing_check')}</Text>
        </View>
        <View style={S.row2}>
          <Text style={S.lbl2}>т.3.5 Отопление:</Text><Text style={S.val2}>{f('gl_heating_type')}</Text>
          <Text style={S.lbl2}>т.3.6 Пожарогасене:</Text><Text style={S.val2}>{f('gl_fire_equipment')}</Text>
        </View>
        <View style={S.row}><Text style={S.lbl}>т.3.10 Опасни материали?</Text><Text style={S.val}>{f('gl_hazardous_materials')}</Text></View>
        <View style={S.row}><Text style={S.lbl}>т.6 Щети на клиенти (5 год.)?</Text><Text style={S.val}>{f('gl_third_party_claims_5y')}</Text></View>

        <View style={S.divider} />

        {/* Section V: Contract */}
        <Text style={S.sectionHead}>V. ЛИМИТИ И САМОУЧАСТИЕ</Text>
        <View style={S.row2}>
          <Text style={S.lbl2}>Лимит едно събитие:</Text><Text style={S.val2}>{f('gl_single_limit')} {f('gl_currency')}</Text>
          <Text style={S.lbl2}>В агрегат:</Text><Text style={S.val2}>{f('gl_aggregate_limit')} {f('gl_currency')}</Text>
        </View>
        {has('gl_deductible') && (
          <View style={S.row}><Text style={S.lbl}>Самоучастие:</Text><Text style={S.val}>{f('gl_deductible')}</Text></View>
        )}

        <View style={S.divider} />
        <Text style={S.note}>Дата на попълване: {date} · Генерирано от InsureUnify</Text>

        {/* Signature */}
        <View style={{ marginTop: 16, flexDirection: 'row', gap: 40 }}>
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
          <Text>Дженерали Застраховане АД · ОГО Въпросник</Text>
          <Text>{clientName}</Text>
          <Text render={({ pageNumber, totalPages }) => `стр. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
