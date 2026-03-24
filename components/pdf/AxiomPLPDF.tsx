'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { mapPLFormDataForInsurer } from '@/lib/pl-mappings'
import type { PLFormData } from '@/lib/pl-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const DARK_BLUE = '#1E2D6B'

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

  // Header
  companyName: { fontSize: 13, fontWeight: 'bold', color: DARK_BLUE, textAlign: 'center' },
  companyDetails: { fontSize: 8, color: '#333', textAlign: 'center', marginTop: 2 },
  title: { fontSize: 13, fontWeight: 'bold', color: DARK_BLUE, textAlign: 'center', marginTop: 12, marginBottom: 12 },

  // Section headers
  sectionHeader: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#000', borderBottomStyle: 'solid', paddingBottom: 3, marginTop: 14, marginBottom: 8 },

  // Table structure
  tableOuter: { borderWidth: 1, borderColor: '#000', borderStyle: 'solid', marginBottom: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', borderBottomStyle: 'solid', minHeight: 18 },
  tableRowLast: { flexDirection: 'row', minHeight: 18 },
  cellLabel: { fontSize: 8, padding: 4, borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid' },
  cellValue: { fontSize: 8, padding: 4, flex: 1 },
  cellLabelGray: { fontSize: 8, padding: 4, borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid', backgroundColor: '#E8E8E8' },

  // Full-width row
  fullRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', borderBottomStyle: 'solid', minHeight: 18 },
  fullLabel: { fontSize: 8, padding: 4, width: '40%', borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid', backgroundColor: '#E8E8E8' },
  fullValue: { fontSize: 8, padding: 4, flex: 1 },

  // Two-column row
  halfLabel: { fontSize: 8, padding: 4, width: '25%', borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid', backgroundColor: '#E8E8E8' },
  halfValue: { fontSize: 8, padding: 4, flex: 1, borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid' },
  halfValueLast: { fontSize: 8, padding: 4, flex: 1 },

  // Yes/No question
  questionRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', borderBottomStyle: 'solid', minHeight: 18, alignItems: 'center' },
  questionLabel: { fontSize: 8, padding: 4, flex: 1, borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid' },
  questionChecks: { flexDirection: 'row', width: 140, padding: 4, justifyContent: 'space-around' },
  checkText: { fontSize: 8 },

  // Detail row
  detailRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#000', borderBottomStyle: 'solid', minHeight: 16 },
  detailLabel: { fontSize: 8, padding: 4, width: '25%', borderRightWidth: 0.5, borderRightColor: '#000', borderRightStyle: 'solid', fontStyle: 'italic', backgroundColor: '#E8E8E8' },
  detailValue: { fontSize: 8, padding: 4, flex: 1, fontStyle: 'italic' },

  // Declaration
  declaration: { fontSize: 8, fontStyle: 'italic', marginTop: 14, lineHeight: 1.4 },

  // Signature
  signatureRow: { flexDirection: 'row', marginTop: 30, gap: 40 },
  signatureBlock: { flex: 1 },
  signatureLabel: { fontSize: 8, marginBottom: 4 },
  signatureLine: { borderBottomWidth: 0.5, borderBottomColor: '#000', borderBottomStyle: 'solid', height: 30 },

  // Note
  noteText: { fontSize: 8, color: '#333', marginTop: 2 },
})

interface Props {
  formData: PLFormData
  clientName: string
}

export function AxiomPLPDF({ formData, clientName }: Props) {
  const d = mapPLFormDataForInsurer(formData, 'axiom')
  const f = (id: string) => d[id]?.displayValue ?? (formData[id] !== undefined ? String(formData[id]) : '')
  const isYes = (id: string) => f(id) === 'Да'
  const isNo = (id: string) => f(id) === 'Не'

  const cb = (checked: boolean) => checked ? '[X]' : '[ ]'

  return (
    <Document title={`Аксиом ПО -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* ── Header ── */}
        <Text style={S.companyName}>ЗК АКСИОМ АД</Text>
        <Text style={S.companyDetails}>
          ЕИК: 131039664 | бул. &quot;Витоша&quot; 150, бл. 70, ет. 1, 1408 София
        </Text>
        <Text style={S.title}>
          ПРЕДЛОЖЕНИЕ-ВЪПРОСНИК ЗА ЗАСТРАХОВКА ПРОФЕСИОНАЛНА ОТГОВОРНОСТ / PROFESSIONAL LIABILITY
        </Text>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION I - ДАННИ ЗА ЗАСТРАХОВАЩИЯ / POLICYHOLDER DATA
           ══════════════════════════════════════════════════════════════════════ */}
        <Text style={S.sectionHeader}>I. Данни за ЗАСТРАХОВАЩИЯ / POLICYHOLDER DATA</Text>

        <View style={S.tableOuter}>
          {/* 1. Name - full width */}
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>1. Име / наименование / Name:</Text>
            <Text style={S.fullValue}>{f('pl_company_name')}</Text>
          </View>

          {/* 2. Address + phone + email */}
          <View style={S.fullRow}>
            <Text style={[S.halfLabel, { width: '20%' }]}>2. Адрес/Address:</Text>
            <Text style={[S.halfValue, { flex: 2 }]}>{f('pl_address')}</Text>
            <Text style={[S.halfLabel, { width: '15%' }]}>телефон/phone:</Text>
            <Text style={S.halfValue}>{f('pl_phone')}</Text>
            <Text style={[S.halfLabel, { width: '10%' }]}>E-mail:</Text>
            <Text style={S.halfValueLast}>{f('pl_email')}</Text>
          </View>

          {/* 3. EIK + Profession */}
          <View style={S.tableRowLast}>
            <Text style={[S.halfLabel, { width: '20%' }]}>3. ЕИК/ЕГН / CID:</Text>
            <Text style={S.halfValue}>{f('pl_eik')}</Text>
            <Text style={[S.halfLabel, { width: '25%' }]}>Предмет на дейност / Profession:</Text>
            <Text style={S.halfValueLast}>{f('pl_activity')}</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION II - ДАННИ ЗА ЗАСТРАХОВАНИЯ / INSURED DATA
           ══════════════════════════════════════════════════════════════════════ */}
        <Text style={S.sectionHeader}>II. Данни за ЗАСТРАХОВАНИЯ / INSURED DATA</Text>

        <View style={S.tableOuter}>
          {/* 4. Name */}
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>4. Име / наименование / Name:</Text>
            <Text style={S.fullValue}>{f('pl_insured_name')}</Text>
          </View>

          {/* Address + phone + email */}
          <View style={S.fullRow}>
            <Text style={[S.halfLabel, { width: '20%' }]}>Адрес/Address:</Text>
            <Text style={[S.halfValue, { flex: 2 }]}>{f('pl_insured_address')}</Text>
            <Text style={[S.halfLabel, { width: '15%' }]}>телефон/phone:</Text>
            <Text style={S.halfValue}>{f('pl_phone')}</Text>
            <Text style={[S.halfLabel, { width: '10%' }]}>E-mail:</Text>
            <Text style={S.halfValueLast}>{f('pl_email')}</Text>
          </View>

          {/* EIK + Profession */}
          <View style={S.fullRow}>
            <Text style={[S.halfLabel, { width: '20%' }]}>ЕИК/ЕГН / CID:</Text>
            <Text style={S.halfValue}>{f('pl_insured_eik')}</Text>
            <Text style={[S.halfLabel, { width: '25%' }]}>Предмет на дейност / Profession:</Text>
            <Text style={S.halfValueLast}>{f('pl_insured_profession')}</Text>
          </View>

          {/* Start date of practice + number of insured persons */}
          <View style={S.fullRow}>
            <Text style={[S.halfLabel, { width: '35%' }]}>5. Начална дата на упражняване на дейността / Start date of practice:</Text>
            <Text style={S.halfValue}>{f('pl_activity_start_date')}</Text>
            <Text style={[S.halfLabel, { width: '25%' }]}>Брой застраховани лица / Number of insured:</Text>
            <Text style={S.halfValueLast}>{f('pl_employees_count')}</Text>
          </View>

          {/* Member of professional org */}
          <View style={S.tableRowLast}>
            <Text style={[S.questionLabel, { backgroundColor: '#E8E8E8' }]}>
              6. Член на професионална организация? / Member of professional organization?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_professional_org'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_professional_org'))} ДА/Yes</Text>
            </View>
          </View>
        </View>

        {f('pl_professional_org_name') ? (
          <Text style={S.noteText}>Наименование / Name: {f('pl_professional_org_name')}</Text>
        ) : null}

        {/* ── Questions 7-12 ── */}
        <View style={[S.tableOuter, { marginTop: 8 }]}>
          {/* 7 */}
          <View style={S.questionRow}>
            <Text style={S.questionLabel}>
              7. Имали ли сте до сега сключена застраховка ПО? / Previous PL insurance?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_prev_insurance'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_prev_insurance'))} ДА/Yes</Text>
            </View>
          </View>

          {/* 8 */}
          <View style={S.questionRow}>
            <Text style={S.questionLabel}>
              8. Изплащано ли е обезщетение по застраховка ПО? / Compensation paid under PL insurance?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_claims_paid'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_claims_paid'))} ДА/Yes</Text>
            </View>
          </View>
          {f('pl_claims_details') ? (
            <View style={S.detailRow}>
              <Text style={S.detailLabel}>Подробности / Details:</Text>
              <Text style={S.detailValue}>{f('pl_claims_details')}</Text>
            </View>
          ) : null}

          {/* 9 */}
          <View style={S.questionRow}>
            <Text style={S.questionLabel}>
              9. Отказвано ли Ви е сключване на застраховка ПО? / PL insurance refused?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_insurance_declined'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_insurance_declined'))} ДА/Yes</Text>
            </View>
          </View>

          {/* 10 */}
          <View style={S.questionRow}>
            <Text style={S.questionLabel}>
              10. Имате ли валидна застраховка ПО при друга компания? / Valid PL insurance elsewhere?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_valid_other_insurance'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_valid_other_insurance'))} ДА/Yes</Text>
            </View>
          </View>

          {/* 11 */}
          <View style={S.questionRow}>
            <Text style={S.questionLabel}>
              11. Предявявани ли са искове / съдебни дела (последните 3 години)? / Claims last 3 years?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_pending_claims'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_pending_claims'))} ДА/Yes</Text>
            </View>
          </View>
          {f('pl_pending_claims_details') ? (
            <View style={S.detailRow}>
              <Text style={S.detailLabel}>Описание / Description:</Text>
              <Text style={S.detailValue}>{f('pl_pending_claims_details')}</Text>
            </View>
          ) : null}

          {/* 12 */}
          <View style={S.tableRowLast}>
            <Text style={[S.questionLabel, { flex: 1, padding: 4 }]}>
              12. Известни ли са Ви обстоятелства за бъдещи искове? / Circumstances for future claims?
            </Text>
            <View style={S.questionChecks}>
              <Text style={S.checkText}>{cb(isNo('pl_known_circumstances'))} НЕ/No</Text>
              <Text style={S.checkText}>{cb(isYes('pl_known_circumstances'))} ДА/Yes</Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION III - ЖЕЛАНО ПОКРИТИЕ / DESIRED COVERAGE
           ══════════════════════════════════════════════════════════════════════ */}
        <Text style={S.sectionHeader}>III. Желано покритие / DESIRED COVERAGE</Text>

        <View style={S.tableOuter}>
          {/* Limit of liability */}
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>Лимит на отговорност (единичен) / Limit per occurrence:</Text>
            <Text style={S.fullValue}>
              {f('pl_single_limit')}{f('pl_currency') ? ` ${f('pl_currency')}` : ''}
            </Text>
          </View>
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>Лимит на отговорност (агрегатен) / Aggregate limit:</Text>
            <Text style={S.fullValue}>
              {f('pl_aggregate_limit')}{f('pl_currency') ? ` ${f('pl_currency')}` : ''}
            </Text>
          </View>

          {/* Period from / to */}
          <View style={S.fullRow}>
            <Text style={[S.halfLabel, { width: '20%' }]}>Период от / Period from:</Text>
            <Text style={S.halfValue}>{f('pl_period_from')}</Text>
            <Text style={[S.halfLabel, { width: '20%' }]}>Период до / Period to:</Text>
            <Text style={S.halfValueLast}>{f('pl_period_to')}</Text>
          </View>

          {/* Retroactive date */}
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>Ретроактивна дата / Retroactive date:</Text>
            <Text style={S.fullValue}>{f('pl_retroactive_date')}</Text>
          </View>

          {/* Deductible */}
          <View style={S.fullRow}>
            <Text style={S.fullLabel}>Самоучастие / Deductible:</Text>
            <Text style={S.fullValue}>{f('pl_deductible')}</Text>
          </View>

          {/* Payment type */}
          <View style={S.tableRowLast}>
            <Text style={[S.fullLabel, { borderBottomWidth: 0 }]}>Начин на плащане / Payment type:</Text>
            <Text style={S.fullValue}>{f('pl_payment_type')}</Text>
          </View>
        </View>

        {/* ── Declaration ── */}
        <Text style={S.declaration}>
          Декларирам, че предоставената информация е вярна и пълна. Известно ми е, че неточна или
          непълна информация може да доведе до отказ от изплащане на обезщетение или до прекратяване
          на застрахователния договор. Запознат/а съм с условията за застраховане и ги приемам. /
          I declare that the information provided is true and complete. I am aware that inaccurate or
          incomplete information may result in denial of claims or termination of the insurance contract.
          I have read and accept the insurance conditions.
        </Text>

        {/* ── Signature ── */}
        <View style={S.signatureRow}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>Дата / Date:</Text>
            <View style={S.signatureLine} />
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>Подпис / Signature:</Text>
            <View style={S.signatureLine} />
          </View>
        </View>

      </Page>
    </Document>
  )
}
