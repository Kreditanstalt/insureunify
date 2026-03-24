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

const BLUE = '#003781'

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

  /* ── Header ── */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLogoText: { fontSize: 11, fontWeight: 'bold', color: BLUE },
  headerInsurerName: { fontSize: 9, color: '#333', textAlign: 'right' },
  headerHr: { borderBottom: '1 solid #000', marginBottom: 10 },

  /* ── Title ── */
  title: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  subtitle: { fontSize: 9, textAlign: 'center', marginBottom: 14, fontStyle: 'italic', color: '#333' },

  /* ── Section headers ── */
  sectionHead: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1 solid #000',
    marginTop: 12,
    marginBottom: 6,
    paddingBottom: 2,
  },

  /* ── Applicant box ── */
  applicantBox: {
    border: '1 solid #000',
    padding: 8,
    marginBottom: 8,
  },
  boxRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-end',
  },
  boxLabel: { fontSize: 9, width: '35%', color: '#000' },
  boxValue: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #000', paddingBottom: 1 },

  /* ── Table styles ── */
  table: { marginTop: 4, marginBottom: 6 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #000', minHeight: 18, alignItems: 'center' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000', minHeight: 20, alignItems: 'center' },
  tableCell: { fontSize: 8, padding: 3, flex: 1 },
  tableCellBold: { fontSize: 8, fontWeight: 'bold', padding: 3, flex: 1 },

  /* ── Numbered list rows ── */
  numberedRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  numLabel: { fontSize: 9, width: 18 },
  numContent: { fontSize: 9, flex: 1 },

  /* ── Field rows ── */
  fieldRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  fieldLabel: { fontSize: 9, width: '50%' },
  fieldValue: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #000', paddingBottom: 1 },

  /* ── Checkboxes ── */
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, gap: 4 },
  checkText: { fontSize: 9 },
  inlineCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  /* ── Inline value box ── */
  valueBox: { borderBottom: '0.5 solid #000', paddingBottom: 1, minWidth: 50, fontSize: 9, fontWeight: 'bold', textAlign: 'center' },

  /* ── Statement ── */
  statement: { fontSize: 9, marginTop: 8, marginBottom: 8, lineHeight: 1.5 },

  /* ── Signature ── */
  signatureArea: { marginTop: 20, flexDirection: 'row', gap: 40 },
  signatureBlock: { flex: 1 },
  signatureLabel: { fontSize: 8, color: '#555', marginBottom: 24 },
  signatureLine: { borderTop: '0.5 solid #000', paddingTop: 2 },
  signatureName: { fontSize: 8, color: '#666' },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    fontSize: 8,
    color: '#888',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '0.5 solid #ccc',
    paddingTop: 3,
  },
  footerCenter: { fontSize: 8, color: '#888', textAlign: 'center' },
  footerRight: { fontSize: 8, color: '#888', textAlign: 'right' },
})

/* ── Helpers ── */

function Chk({ checked }: { checked: boolean }) {
  return <Text style={S.checkText}>{checked ? '[X]' : '[ ]'}</Text>
}

interface Props {
  formData: OAFormData
  clientName: string
}

export function AllianzOAPDF({ formData, clientName }: Props) {
  const d = mapOAFormDataForInsurer(formData, 'allianz')
  const f = (id: string) =>
    d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '____')
  const isYes = (id: string) => formData[id] === 'yes'
  const isNo = (id: string) => formData[id] === 'no'
  const has = (id: string) => formData[id] !== undefined && formData[id] !== ''

  return (
    <Document title={`Алианц Трудова злополука - ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* ═══ HEADER ═══ */}
        <View style={S.headerRow}>
          <Text style={S.headerLogoText}>ЗАД АЛИАНЦ БЪЛГАРИЯ</Text>
          <Text style={S.headerInsurerName}>ЗАД Алианц България АД</Text>
        </View>
        <View style={S.headerHr} />

        {/* ═══ TITLE ═══ */}
        <Text style={S.title}>
          ВЪПРОСНИК-ЗАЯВЛЕНИЕ{'\n'}за сключване на задължителна застраховка{'\n'}&quot;ТРУДОВА ЗЛОПОЛУКА&quot;
        </Text>
        <Text style={S.subtitle}>
          съгласно Наредба за задължително застраховане, приета с ПМС No. 24/06.02.2006г.
        </Text>

        {/* ═══ ЗАСТРАХОВАЩ BOX ═══ */}
        <Text style={S.sectionHead}>ДАННИ ЗА ЗАСТРАХОВАЩИЯ</Text>
        <View style={S.applicantBox}>
          <View style={S.boxRow}>
            <Text style={S.boxLabel}>Наименование на фирмата:</Text>
            <Text style={S.boxValue}>{f('oa_company_name')}</Text>
          </View>
          <View style={S.boxRow}>
            <Text style={S.boxLabel}>ЕИК:</Text>
            <Text style={S.boxValue}>{f('oa_eik')}</Text>
          </View>
          <View style={S.boxRow}>
            <Text style={S.boxLabel}>Адрес (гр./с., ул., No.):</Text>
            <Text style={S.boxValue}>{f('oa_address')}</Text>
          </View>
          <View style={S.boxRow}>
            <Text style={S.boxLabel}>Телефон:</Text>
            <Text style={S.boxValue}>{f('oa_phone')}</Text>
          </View>
        </View>

        {/* ═══ STATEMENT ═══ */}
        <Text style={S.statement}>
          С настоящето заявявам желание да застраховам {f('oa_persons_count')} лица — служители на трудов договор.
        </Text>

        {/* ═══ ПОКРИТИ РИСКОВЕ ═══ */}
        <Text style={S.sectionHead}>ПОКРИТИ РИСКОВЕ</Text>

        {/* 1. Смърт от трудова злополука */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>1.</Text>
          <View style={{ flex: 1 }}>
            <Text style={S.numContent}>Смърт от трудова злополука</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_cover_death')} />
                <Text style={S.checkText}> съгл. Наредбата</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={isNo('oa_cover_death')} />
                <Text style={S.checkText}> Доброволен лимит: {has('oa_temp_disability_limit') ? f('oa_temp_disability_limit') : '____'} лв.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Трайно намалена работоспособност */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>2.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={S.numContent}>Трайно намалена работоспособност — </Text>
              <Text style={S.valueBox}>{has('oa_cover_permanent_disability') && isYes('oa_cover_permanent_disability') ? '100' : '___'}</Text>
              <Text style={S.checkText}>% от з.с.</Text>
            </View>
          </View>
        </View>

        {/* 3. Временна неработоспособност */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>3.</Text>
          <View style={{ flex: 1 }}>
            <Text style={S.numContent}>Временна неработоспособност</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_cover_temporary_disability') && !has('oa_temp_disability_limit')} />
                <Text style={S.checkText}> Съгл. Наредбата</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={has('oa_temp_disability_limit')} />
                <Text style={S.checkText}> Добр. лимит: {has('oa_temp_disability_limit') ? f('oa_temp_disability_limit') : '____'} лв.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══ ТЕРИТОРИЯ ═══ */}
        <Text style={S.sectionHead}>ТЕРИТОРИЯ</Text>
        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 6 }}>
          <View style={S.inlineCheckRow}>
            <Chk checked={formData.oa_territory === 'bg' || formData.oa_territory === 'bg_plus'} />
            <Text style={S.checkText}> Р България</Text>
          </View>
          <View style={S.inlineCheckRow}>
            <Chk checked={formData.oa_territory === 'abroad' || formData.oa_territory === 'bg_plus'} />
            <Text style={S.checkText}> чужбина</Text>
          </View>
        </View>

        {/* ═══ МЕСЕЧЕН ФОНД РАБОТНА ЗАПЛАТА ═══ */}
        <Text style={S.sectionHead}>МЕСЕЧЕН ФОНД РАБОТНА ЗАПЛАТА</Text>
        <View style={S.fieldRow}>
          <Text style={S.fieldLabel}>Месечен фонд работна заплата:</Text>
          <Text style={S.fieldValue}>{f('oa_monthly_wage_fund')} лева</Text>
        </View>

        {/* ═══ МБЗ > 27 000 ЛВ. ═══ */}
        <Text style={S.sectionHead}>{'МБЗ > 27 000 ЛВ.'}</Text>
        <View style={{ flexDirection: 'row', gap: 20, marginBottom: 6 }}>
          <View style={S.inlineCheckRow}>
            <Chk checked={isNo('oa_high_salary')} />
            <Text style={S.checkText}> НЕ</Text>
          </View>
          <View style={S.inlineCheckRow}>
            <Chk checked={isYes('oa_high_salary')} />
            <Text style={S.checkText}> ДА</Text>
          </View>
        </View>

        {/* ═══ ИНФОРМАЦИЯ ЗА ДЕЙНОСТТА ═══ */}
        <Text style={S.sectionHead}>ИНФОРМАЦИЯ ЗА ДЕЙНОСТТА</Text>

        {/* 1. Основна дейност */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>1.</Text>
          <View style={{ flex: 1 }}>
            <View style={S.fieldRow}>
              <Text style={S.fieldLabel}>Основна дейност:</Text>
              <Text style={S.fieldValue}>{f('oa_activity')}</Text>
            </View>
            <View style={S.fieldRow}>
              <Text style={S.fieldLabel}>Код по НКИД:</Text>
              <Text style={S.fieldValue}>{f('oa_activity_code')}</Text>
            </View>
          </View>
        </View>

        {/* 2. Спомагателни дейности */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>2.</Text>
          <View style={{ flex: 1 }}>
            <View style={S.fieldRow}>
              <Text style={S.fieldLabel}>Спомагателни дейности + НКИД:</Text>
              <Text style={S.fieldValue}>{f('oa_secondary_activity')}</Text>
            </View>
          </View>
        </View>

        {/* 3. Големи аварии */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>3.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={S.checkText}>Настъпвали ли са големи аварии (последните 10 год.)?</Text>
              <View style={S.inlineCheckRow}>
                <Chk checked={isNo('oa_major_accidents_10y')} />
                <Text style={S.checkText}> НЕ</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_major_accidents_10y')} />
                <Text style={S.checkText}> ДА</Text>
              </View>
            </View>
            {has('oa_accidents_details') && (
              <View style={S.fieldRow}>
                <Text style={S.fieldLabel}>Описание:</Text>
                <Text style={S.fieldValue}>{f('oa_accidents_details')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 4. Регистрирани ТЗ */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>4.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={S.checkText}>Регистрирани трудови злополуки (3 год.)?</Text>
              <View style={S.inlineCheckRow}>
                <Chk checked={isNo('oa_registered_accidents_3y')} />
                <Text style={S.checkText}> НЕ</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_registered_accidents_3y')} />
                <Text style={S.checkText}> ДА</Text>
              </View>
            </View>
            {/* Accident counts table */}
            <View style={S.table}>
              <View style={S.tableHeaderRow}>
                <Text style={{ ...S.tableCell, fontWeight: 'bold' }}>Общ брой</Text>
                <Text style={{ ...S.tableCell, fontWeight: 'bold' }}>Смърт бр.</Text>
                <Text style={{ ...S.tableCell, fontWeight: 'bold' }}>Инвалидност бр.</Text>
                <Text style={{ ...S.tableCell, fontWeight: 'bold' }}>Вр. НТ бр.</Text>
              </View>
              <View style={S.tableRow}>
                <Text style={S.tableCellBold}>
                  {(Number(formData.oa_accidents_death_count || 0) +
                    Number(formData.oa_accidents_disability_count || 0) +
                    Number(formData.oa_accidents_temp_count || 0)) || '____'}
                </Text>
                <Text style={S.tableCellBold}>{f('oa_accidents_death_count')}</Text>
                <Text style={S.tableCellBold}>{f('oa_accidents_disability_count')}</Text>
                <Text style={S.tableCellBold}>{f('oa_accidents_temp_count')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Предписания от контролни органи */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>5.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={S.checkText}>Предписания от контролни органи (3 год.)?</Text>
              <View style={S.inlineCheckRow}>
                <Chk checked={isNo('oa_safety_prescriptions')} />
                <Text style={S.checkText}> НЕ</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_safety_prescriptions')} />
                <Text style={S.checkText}> ДА</Text>
              </View>
            </View>
            {has('oa_safety_details') && (
              <View style={S.fieldRow}>
                <Text style={S.fieldLabel}>Срокове и изпълнение:</Text>
                <Text style={S.fieldValue}>{f('oa_safety_details')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 6. Работа на смени */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>6.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Text style={S.checkText}>Работа на смени?</Text>
              <View style={S.inlineCheckRow}>
                <Chk checked={isNo('oa_shift_work')} />
                <Text style={S.checkText}> НЕ</Text>
              </View>
              <View style={S.inlineCheckRow}>
                <Chk checked={isYes('oa_shift_work')} />
                <Text style={S.checkText}> ДА</Text>
              </View>
              {has('oa_shifts_count') && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                  <Text style={S.checkText}>Брой смени:</Text>
                  <Text style={S.valueBox}>{f('oa_shifts_count')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 7. Макс. концентрация */}
        <View style={S.numberedRow}>
          <Text style={S.numLabel}>7.</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={S.checkText}>Макс. концентрация на работна сила:</Text>
              <Text style={S.valueBox}>{f('oa_max_concentration')}</Text>
              <Text style={S.checkText}> лица</Text>
            </View>
          </View>
        </View>

        {/* ═══ SIGNATURE ═══ */}
        <View style={S.signatureArea}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>Застраховащ (подпис и печат):</Text>
            <View style={S.signatureLine}>
              <Text style={S.signatureName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>Застрахователен посредник:</Text>
            <View style={S.signatureLine} />
          </View>
        </View>

        {/* ═══ FOOTER (fixed) ═══ */}
        <View style={S.footer} fixed>
          <Text style={S.footerCenter}>
            {'ЕИК 040638060 \u00B7 бул. "Кн. Ал. Дондуков" 59, София 1504'}
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
