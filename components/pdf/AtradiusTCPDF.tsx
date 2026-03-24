'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { TCFormData } from '@/lib/tc-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',            fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf',     fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',        fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold',   fontStyle: 'italic' },
  ],
})

const RED = '#CC0000'
const USABLE_WIDTH = 495 // 595 - 50 - 50

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
  header: { marginBottom: 10 },
  logo: { fontSize: 16, fontWeight: 'bold', color: RED, marginBottom: 2 },
  companyInfo: { fontSize: 8, color: '#555', lineHeight: 1.4 },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
    paddingVertical: 6,
    borderTop: `1 solid ${RED}`,
    borderBottom: `1 solid ${RED}`,
  },
  /* Section headers */
  sec: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 6,
    borderBottom: '1 solid #000',
    paddingBottom: 3,
  },
  /* Label/value rows */
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  lbl: { fontSize: 8, color: '#444', width: 200 },
  val: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    borderBottom: '0.5 solid #bbb',
    paddingBottom: 1,
    minHeight: 12,
  },
  row2col: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  halfLbl: { fontSize: 8, color: '#444', width: 120 },
  halfVal: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
    borderBottom: '0.5 solid #bbb',
    paddingBottom: 1,
    minHeight: 12,
  },
  /* Tables */
  tHead: {
    flexDirection: 'row',
    backgroundColor: RED,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderTop: '1 solid #000',
    borderBottom: '1 solid #000',
  },
  tHdr: { fontSize: 8, fontWeight: 'bold', color: '#fff' },
  tRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottom: '0.5 solid #000',
  },
  tCell: { fontSize: 8, color: '#111' },
  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 50,
    right: 50,
    borderTop: `0.5 solid ${RED}`,
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 7,
    color: '#888',
  },
  footerCenter: { fontSize: 7, color: '#888', textAlign: 'center', flex: 1 },
  footerRight: { fontSize: 7, color: '#888', textAlign: 'right' },
  footerLeft: { fontSize: 7, color: '#888', width: 60 },
  /* Signature */
  signRow: { flexDirection: 'row', gap: 20, marginTop: 20 },
  signBox: { flex: 1, borderTop: '0.5 solid #999', paddingTop: 4 },
  signLbl: { fontSize: 8, color: '#888' },
  signVal: { fontSize: 9, marginTop: 2 },
  /* Declaration */
  declText: { fontSize: 8, color: '#333', marginTop: 4, fontStyle: 'italic', lineHeight: 1.4 },
  note: { fontSize: 8, color: '#888', marginTop: 4, fontStyle: 'italic' },
})

/* Bilingual label-value row */
function R({ lbl, val }: { lbl: string; val: string }) {
  return (
    <View style={S.row}>
      <Text style={S.lbl}>{lbl}</Text>
      <Text style={S.val}>{val || ' '}</Text>
    </View>
  )
}

/* Two-column label-value row */
function R2({ lbl1, val1, lbl2, val2 }: { lbl1: string; val1: string; lbl2: string; val2: string }) {
  return (
    <View style={S.row2col}>
      <Text style={S.halfLbl}>{lbl1}</Text>
      <Text style={S.halfVal}>{val1 || ' '}</Text>
      <Text style={S.halfLbl}>{lbl2}</Text>
      <Text style={S.halfVal}>{val2 || ' '}</Text>
    </View>
  )
}

/* Checkbox helper */
function chk(val: unknown): string {
  return val ? '[X]' : '[ ]'
}

interface Props { formData: TCFormData; clientName: string }

export function AtradiusTCPDF({ formData: f, clientName }: Props) {
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const buyers = [
    { name: f.tc_buyer1_name, country: f.tc_buyer1_country, id: f.tc_buyer1_id, limit: f.tc_buyer1_limit, turnover: f.tc_buyer1_turnover },
    { name: f.tc_buyer2_name, country: f.tc_buyer2_country, id: f.tc_buyer2_id, limit: f.tc_buyer2_limit, turnover: f.tc_buyer2_turnover },
    { name: f.tc_buyer3_name, country: f.tc_buyer3_country, id: f.tc_buyer3_id, limit: f.tc_buyer3_limit, turnover: f.tc_buyer3_turnover },
    { name: f.tc_buyer4_name, country: f.tc_buyer4_country, id: f.tc_buyer4_id, limit: f.tc_buyer4_limit, turnover: f.tc_buyer4_turnover },
    { name: f.tc_buyer5_name, country: f.tc_buyer5_country, id: f.tc_buyer5_id, limit: f.tc_buyer5_limit, turnover: f.tc_buyer5_turnover },
  ].filter(b => b.name)

  /* Turnover table column widths: 80 + 110 + 105 + 80 + 120 = 495 */
  const turnColYear = 80
  const turnColTurnover = 110
  const turnColLosses = 105
  const turnColCount = 80
  const turnColMax = 120

  /* Buyers table column widths: 150 + 70 + 90 + 90 + 95 = 495 */
  const buyColName = 150
  const buyColCountry = 70
  const buyColId = 90
  const buyColLimit = 90
  const buyColTurnover = 95

  return (
    <Document title={`Атрадиус -- Заявка -- ${clientName}`} author="InsureUnify">
      {/* ═══════════════════════════════ PAGE 1 ═══════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Header with Atradius logo text + company info */}
        <View style={S.header}>
          <Text style={S.logo}>Atradius</Text>
          <Text style={S.companyInfo}>
            Атрадиус Кредито и Каусион С.А. де Сегурос и Реасегурос, клон България КЧТ
          </Text>
          <Text style={S.companyInfo}>
            Бул. Д-р. Г. М. Димитров 79, ет. 3 | 1700 гр. София | ЕИК: 204708066
          </Text>
        </View>

        {/* Title */}
        <Text style={S.title}>
          ЗАЯВКА ЗА ЗАСТРАХОВАНЕ / PROPOSAL FORM{'\n'}ЗАСТРАХОВКА НА ТЪРГОВСКИ КРЕДИТ
        </Text>

        {/* Section 1: Client info */}
        <Text style={S.sec}>1. Клиент / Customer</Text>
        <R lbl="Компания / Company:" val={f.tc_company_name} />
        <R lbl="ЕИК / National ID:" val={f.tc_eik} />
        <R lbl="Адрес / Address:" val={f.tc_address} />
        <R lbl="Лице за контакт / Contact person:" val={f.tc_contact_person} />
        <R2 lbl1="Телефон / Phone:" val1={f.tc_phone} lbl2="E-mail:" val2={f.tc_email} />
        <R lbl="Икономически сектор / Trade sector:" val={f.tc_activity} />
        <R lbl="Икономическа група / Group:" val={f.tc_group} />
        <R2
          lbl1="Текущ застраховател / Current insurer:"
          val1={f.tc_current_insurer}
          lbl2="Изтичане / Expiry:"
          val2={f.tc_current_expiry}
        />

        {/* Section 2: Turnover & losses */}
        <Text style={S.sec}>2. Оборот и загуби / Turnover and Losses (хил. EUR с ДДС)</Text>
        <View style={S.tHead}>
          <Text style={[S.tHdr, { width: turnColYear }]}>Година / Year</Text>
          <Text style={[S.tHdr, { width: turnColTurnover }]}>Оборот / Turnover</Text>
          <Text style={[S.tHdr, { width: turnColLosses }]}>Щети / Losses</Text>
          <Text style={[S.tHdr, { width: turnColCount }]}>Брой / Count</Text>
          <Text style={[S.tHdr, { width: turnColMax }]}>Макс. щета / Max loss</Text>
        </View>
        {[
          { year: f.tc_year1, t: f.tc_turnover_year1, l: f.tc_losses_year1, c: f.tc_losses_count_year1, m: f.tc_max_loss_year1 },
          { year: f.tc_year2, t: f.tc_turnover_year2, l: f.tc_losses_year2, c: f.tc_losses_count_year2, m: f.tc_max_loss_year2 },
          { year: f.tc_year3, t: f.tc_turnover_year3, l: f.tc_losses_year3, c: f.tc_losses_count_year3, m: f.tc_max_loss_year3 },
        ].map((row, i) => (
          <View key={i} style={S.tRow}>
            <Text style={[S.tCell, { width: turnColYear, fontWeight: 'bold' }]}>{row.year || '--'}</Text>
            <Text style={[S.tCell, { width: turnColTurnover }]}>{row.t || '--'}</Text>
            <Text style={[S.tCell, { width: turnColLosses }]}>{row.l || '--'}</Text>
            <Text style={[S.tCell, { width: turnColCount }]}>{row.c || '--'}</Text>
            <Text style={[S.tCell, { width: turnColMax }]}>{row.m || '--'}</Text>
          </View>
        ))}
        <R2
          lbl1="Прогнозен оборот / Expected turnover:"
          val1={f.tc_expected_turnover}
          lbl2="Застрах. оборот / Insurable:"
          val2={f.tc_expected_insurable_turnover}
        />

        {/* Section 3: Market distribution */}
        <Text style={S.sec}>3. Разпределение на оборота / Turnover Distribution</Text>
        {[
          { c: f.tc_market1_country, t: f.tc_market1_turnover },
          { c: f.tc_market2_country, t: f.tc_market2_turnover },
          { c: f.tc_market3_country, t: f.tc_market3_turnover },
        ].filter(m => m.c).map((m, i) => (
          <R2
            key={i}
            lbl1={`Държава ${i + 1} / Country:`}
            val1={m.c}
            lbl2="Оборот хил. EUR:"
            val2={m.t || '--'}
          />
        ))}

        {/* Section 4: Buyers structure */}
        <Text style={S.sec}>4. Структура на продажбите / Buyers Structure</Text>
        <R2
          lbl1="% Публичен сектор / Public sector:"
          val1={f.tc_public_sector_pct ? `${f.tc_public_sector_pct}%` : '--'}
          lbl2="% Вътрешногрупови / Intercompany:"
          val2={f.tc_intercompany_pct ? `${f.tc_intercompany_pct}%` : '--'}
        />
        {f.tc_buyer_sector1 && (
          <R lbl={`Сектор 1 / Sector 1: ${f.tc_buyer_sector1}`} val={f.tc_buyer_sector1_pct ? `${f.tc_buyer_sector1_pct}%` : '--'} />
        )}
        {f.tc_buyer_sector2 && (
          <R lbl={`Сектор 2 / Sector 2: ${f.tc_buyer_sector2}`} val={f.tc_buyer_sector2_pct ? `${f.tc_buyer_sector2_pct}%` : '--'} />
        )}

        {/* Footer page 1 */}
        <View style={S.footer} fixed>
          <Text style={S.footerLeft}> </Text>
          <Text style={S.footerCenter}>Атрадиус</Text>
          <Text style={S.footerRight} render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>

      {/* ═══════════════════════════════ PAGE 2 ═══════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Section 6: Payment terms */}
        <Text style={S.sec}>6. Условия на плащане / Payment Terms</Text>
        <R2
          lbl1="% Аванси / Cash in advance:"
          val1={f.tc_cash_advance_pct ? `${f.tc_cash_advance_pct}%` : '--'}
          lbl2="DSO (дни / days):"
          val2={f.tc_dso ? `${f.tc_dso} дни` : '--'}
        />
        <R2
          lbl1="Стандартен срок / Standard terms:"
          val1={f.tc_standard_terms ? `${f.tc_standard_terms} дни` : '--'}
          lbl2="Макс. срок / Max terms:"
          val2={f.tc_max_terms ? `${f.tc_max_terms} дни` : '--'}
        />

        {/* Section 7: Top buyers */}
        <Text style={S.sec}>7. Основни купувачи / Top Buyers to be Insured</Text>
        <Text style={S.note}>Атрадиус ще провери безплатно до 10 купувача в рамките на офертата.</Text>

        {buyers.length > 0 ? (
          <>
            <View style={[S.tHead, { marginTop: 6 }]}>
              <Text style={[S.tHdr, { width: buyColName }]}>Наименование / Name</Text>
              <Text style={[S.tHdr, { width: buyColCountry }]}>Държава / Country</Text>
              <Text style={[S.tHdr, { width: buyColId }]}>ЕИК / VAT</Text>
              <Text style={[S.tHdr, { width: buyColLimit }]}>Лимит EUR / Limit EUR</Text>
              <Text style={[S.tHdr, { width: buyColTurnover }]}>Оборот EUR / Turnover EUR</Text>
            </View>
            {buyers.map((b, i) => (
              <View key={i} style={S.tRow}>
                <Text style={[S.tCell, { width: buyColName }]}>{b.name}</Text>
                <Text style={[S.tCell, { width: buyColCountry }]}>{b.country || '--'}</Text>
                <Text style={[S.tCell, { width: buyColId }]}>{b.id || '--'}</Text>
                <Text style={[S.tCell, { width: buyColLimit }]}>{b.limit || '--'}</Text>
                <Text style={[S.tCell, { width: buyColTurnover }]}>{b.turnover || '--'}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={S.note}>Няма въведени купувачи / No buyers entered.</Text>
        )}

        {/* Section 8: Declaration + signature */}
        <Text style={[S.sec, { marginTop: 20 }]}>8. Декларация / Our Declaration</Text>
        <Text style={S.declText}>
          С настоящата Заявка за застраховане, предоставяме своето съгласие да използвате името на компанията ни
          като доставчик, с цел получаване на финансова информация от купувачите. Декларираме, че поемаме
          отговорност за истинността и достоверността на подадената информация.
        </Text>
        <Text style={[S.declText, { marginTop: 2 }]}>
          With this Proposal Form, we give our consent for you to use our company name as a supplier in order
          to obtain financial information from the buyers. We declare that we take responsibility for the
          truthfulness and accuracy of the information provided.
        </Text>

        <View style={S.signRow}>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Име / Name:</Text>
            <Text style={S.signVal}>{f.tc_contact_person || ' '}</Text>
          </View>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Подпис / Signature:</Text>
            <Text style={S.signVal}> </Text>
          </View>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Дата / Date:</Text>
            <Text style={S.signVal}>{date}</Text>
          </View>
        </View>

        {/* Footer page 2 */}
        <View style={S.footer} fixed>
          <Text style={S.footerLeft}> </Text>
          <Text style={S.footerCenter}>Атрадиус</Text>
          <Text style={S.footerRight} render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
