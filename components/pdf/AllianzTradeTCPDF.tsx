'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { TCFormData } from '@/lib/tc-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const BLUE = '#003781'

// Usable width: 595 - 50 - 50 = 495pt
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
  logo: { fontSize: 13, fontWeight: 'bold', color: BLUE, marginBottom: 2 },
  currencyHeader: { fontSize: 9, fontWeight: 'bold', textAlign: 'right', marginBottom: 6 },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 6,
  },
  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottom: '1 solid #000',
    paddingBottom: 3,
    marginTop: 12,
    marginBottom: 6,
  },
  // Info rows
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { fontSize: 9, width: 200 },
  infoValue: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #999', paddingBottom: 1, minHeight: 12 },
  // Dual column info
  dualRow: { flexDirection: 'row', marginBottom: 3, gap: 10 },
  dualLabel: { fontSize: 9, width: 120 },
  dualValue: { fontSize: 9, fontWeight: 'bold', flex: 1, borderBottom: '0.5 solid #999', paddingBottom: 1, minHeight: 12 },
  // Table outer frame
  tableOuter: { border: '1 solid #000', marginBottom: 6 },
  // Table header row
  tableHeadRow: { flexDirection: 'row', backgroundColor: '#E8E8E8', borderBottom: '0.5 solid #000' },
  tableHeadCell: { fontSize: 8, fontWeight: 'bold', paddingVertical: 3, paddingHorizontal: 4 },
  // Table body row
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #000' },
  tableRowLast: { flexDirection: 'row' },
  tableCell: { fontSize: 8, paddingVertical: 3, paddingHorizontal: 4 },
  tableCellBold: { fontSize: 8, fontWeight: 'bold', paddingVertical: 3, paddingHorizontal: 4 },
  // Signature
  signatureRow: { flexDirection: 'row', gap: 20, marginTop: 24 },
  signatureBox: { flex: 1 },
  signatureLabel: { fontSize: 8, color: '#555', marginBottom: 20 },
  signatureLine: { borderTop: '0.5 solid #000', paddingTop: 3, fontSize: 9 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '0.5 solid #000',
    paddingTop: 4,
    fontSize: 7,
    color: '#555',
  },
  footerCenter: { fontSize: 7, color: '#555', textAlign: 'center', flex: 1 },
  footerRight: { fontSize: 7, color: '#555', textAlign: 'right' },
  note: { fontSize: 8, color: '#555', marginTop: 6, fontStyle: 'italic' },
})

// Border helpers for cells
const borderRight = { borderRight: '0.5 solid #000' as const }

// Main financial table column widths: 200 + 80 + 80 + 135 = 495
const COL_FIN = { label: 200, y2: 80, y1: 80, forecast: 135 }

// Loss history column widths: 100 + 100 + 100 + 100 + 95 = 495
const COL_LOSS = { year: 100, turnover: 100, losses: 100, count: 100, maxLoss: 95 }

// Buyer table column widths: 150 + 80 + 80 + 100 + 85 = 495
const COL_BUY = { name: 150, country: 80, pct: 80, limit: 100, terms: 85 }

// Market distribution column widths: 40 + 180 + 275 = 495
const COL_MKT = { num: 40, country: 180, turnover: 275 }

interface Props {
  formData: TCFormData
  clientName: string
}

export function AllianzTradeTCPDF({ formData: f, clientName }: Props) {
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const buyers = [
    { name: f.tc_buyer1_name, country: f.tc_buyer1_country, pct: f.tc_buyer1_turnover, limit: f.tc_buyer1_limit, terms: f.tc_buyer1_id },
    { name: f.tc_buyer2_name, country: f.tc_buyer2_country, pct: f.tc_buyer2_turnover, limit: f.tc_buyer2_limit, terms: f.tc_buyer2_id },
    { name: f.tc_buyer3_name, country: f.tc_buyer3_country, pct: f.tc_buyer3_turnover, limit: f.tc_buyer3_limit, terms: f.tc_buyer3_id },
    { name: f.tc_buyer4_name, country: f.tc_buyer4_country, pct: f.tc_buyer4_turnover, limit: f.tc_buyer4_limit, terms: f.tc_buyer4_id },
    { name: f.tc_buyer5_name, country: f.tc_buyer5_country, pct: f.tc_buyer5_turnover, limit: f.tc_buyer5_limit, terms: f.tc_buyer5_id },
  ]

  const lossRows = [
    { y: f.tc_year1, t: f.tc_turnover_year1, l: f.tc_losses_year1, c: f.tc_losses_count_year1, m: f.tc_max_loss_year1 },
    { y: f.tc_year2, t: f.tc_turnover_year2, l: f.tc_losses_year2, c: f.tc_losses_count_year2, m: f.tc_max_loss_year2 },
    { y: f.tc_year3, t: f.tc_turnover_year3, l: f.tc_losses_year3, c: f.tc_losses_count_year3, m: f.tc_max_loss_year3 },
  ]

  const markets = [
    { country: f.tc_market1_country, turnover: f.tc_market1_turnover },
    { country: f.tc_market2_country, turnover: f.tc_market2_turnover },
    { country: f.tc_market3_country, turnover: f.tc_market3_turnover },
  ]

  const v = (val: string | undefined) => val || ''

  return (
    <Document title={`Алианц Трейд - Търговски кредит - ${clientName}`} author="InsureUnify">
      {/* ══════════ PAGE 1 ══════════ */}
      <Page size="A4" style={S.page}>
        {/* Logo + Currency */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <Text style={S.logo}>Allianz Trade</Text>
          <Text style={S.currencyHeader}>Валута / Currency: EUR</Text>
        </View>

        {/* Title */}
        <Text style={S.title}>ВЪПРОСНИК ЗА ЗАСТРАХОВАНЕ НА ТЪРГОВСКИ КРЕДИТЕН РИСК</Text>

        {/* Section 1: Company info */}
        <Text style={S.sectionHeader}>1. ДАННИ ЗА КОМПАНИЯТА</Text>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>Наименование / Company name:</Text>
          <Text style={S.infoValue}>{v(f.tc_company_name)}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>ЕИК / Registration No:</Text>
          <Text style={S.infoValue}>{v(f.tc_eik)}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>Адрес / Address:</Text>
          <Text style={S.infoValue}>{v(f.tc_address)}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>Дейност / Activity:</Text>
          <Text style={S.infoValue}>{v(f.tc_activity)}</Text>
        </View>
        <View style={S.infoRow}>
          <Text style={S.infoLabel}>Икономическа група / Group:</Text>
          <Text style={S.infoValue}>{v(f.tc_group)}</Text>
        </View>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>Лице за контакт:</Text>
          <Text style={S.dualValue}>{v(f.tc_contact_person)}</Text>
          <Text style={[S.dualLabel, { width: 80 }]}>Длъжност:</Text>
          <Text style={S.dualValue}>{v(f.tc_position)}</Text>
        </View>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>Тел. / Phone:</Text>
          <Text style={S.dualValue}>{v(f.tc_phone)}</Text>
          <Text style={[S.dualLabel, { width: 80 }]}>Email:</Text>
          <Text style={S.dualValue}>{v(f.tc_email)}</Text>
        </View>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>Настоящ застраховател:</Text>
          <Text style={S.dualValue}>{v(f.tc_current_insurer)}</Text>
          <Text style={[S.dualLabel, { width: 80 }]}>Изтича:</Text>
          <Text style={S.dualValue}>{v(f.tc_current_expiry)}</Text>
        </View>

        {/* Section 2: Financial data table */}
        <Text style={S.sectionHeader}>2. ФИНАНСОВИ ДАННИ / FINANCIAL DATA</Text>
        <View style={S.tableOuter}>
          {/* Header row */}
          <View style={S.tableHeadRow}>
            <Text style={[S.tableHeadCell, { width: COL_FIN.label }, borderRight]}>Въпросник</Text>
            <Text style={[S.tableHeadCell, { width: COL_FIN.y2, textAlign: 'center' }, borderRight]}>Година -2</Text>
            <Text style={[S.tableHeadCell, { width: COL_FIN.y1, textAlign: 'center' }, borderRight]}>Година -1</Text>
            <Text style={[S.tableHeadCell, { width: COL_FIN.forecast, textAlign: 'center' }]}>Текуща година (прогноза)</Text>
          </View>
          {/* Общ оборот */}
          <View style={S.tableRow}>
            <Text style={[S.tableCellBold, { width: COL_FIN.label }, borderRight]}>Общ оборот / Total turnover (EUR)</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y2, textAlign: 'center' }, borderRight]}>{v(f.tc_turnover_year2)}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y1, textAlign: 'center' }, borderRight]}>{v(f.tc_turnover_year1)}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.forecast, textAlign: 'center' }]}>{v(f.tc_expected_turnover)}</Text>
          </View>
          {/* Вътрешен оборот */}
          <View style={S.tableRow}>
            <Text style={[S.tableCellBold, { width: COL_FIN.label }, borderRight]}>Вътрешен оборот / Domestic turnover</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y2, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y1, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.forecast, textAlign: 'center' }]}>{v(f.tc_expected_domestic)}</Text>
          </View>
          {/* Износ */}
          <View style={S.tableRow}>
            <Text style={[S.tableCellBold, { width: COL_FIN.label }, borderRight]}>Износ / Export turnover</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y2, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y1, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.forecast, textAlign: 'center' }]}>{v(f.tc_expected_export)}</Text>
          </View>
          {/* Застрахователен оборот */}
          <View style={S.tableRowLast}>
            <Text style={[S.tableCellBold, { width: COL_FIN.label }, borderRight]}>Застрахователен оборот / Insurable turnover</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y2, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.y1, textAlign: 'center' }, borderRight]}>{}</Text>
            <Text style={[S.tableCell, { width: COL_FIN.forecast, textAlign: 'center' }]}>{v(f.tc_expected_insurable_turnover)}</Text>
          </View>
        </View>

        {/* Additional info */}
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>% Публичен сектор:</Text>
          <Text style={S.dualValue}>{f.tc_public_sector_pct ? `${f.tc_public_sector_pct}%` : ''}</Text>
          <Text style={[S.dualLabel, { width: 130 }]}>% Вътрешногрупови:</Text>
          <Text style={S.dualValue}>{f.tc_intercompany_pct ? `${f.tc_intercompany_pct}%` : ''}</Text>
        </View>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>Сектор купувачи 1:</Text>
          <Text style={S.dualValue}>{v(f.tc_buyer_sector1)} {f.tc_buyer_sector1_pct ? `(${f.tc_buyer_sector1_pct}%)` : ''}</Text>
          <Text style={[S.dualLabel, { width: 130 }]}>Сектор купувачи 2:</Text>
          <Text style={S.dualValue}>{v(f.tc_buyer_sector2)} {f.tc_buyer_sector2_pct ? `(${f.tc_buyer_sector2_pct}%)` : ''}</Text>
        </View>

        {/* Section 3: Loss history */}
        <Text style={S.sectionHeader}>3. ИСТОРИЯ НА ЗАГУБИТЕ / LOSS HISTORY</Text>
        <View style={S.tableOuter}>
          <View style={S.tableHeadRow}>
            <Text style={[S.tableHeadCell, { width: COL_LOSS.year, textAlign: 'center' }, borderRight]}>Година / Year</Text>
            <Text style={[S.tableHeadCell, { width: COL_LOSS.turnover, textAlign: 'center' }, borderRight]}>Оборот (EUR)</Text>
            <Text style={[S.tableHeadCell, { width: COL_LOSS.losses, textAlign: 'center' }, borderRight]}>Щети (EUR)</Text>
            <Text style={[S.tableHeadCell, { width: COL_LOSS.count, textAlign: 'center' }, borderRight]}>Брой щети</Text>
            <Text style={[S.tableHeadCell, { width: COL_LOSS.maxLoss, textAlign: 'center' }]}>Макс. щета (EUR)</Text>
          </View>
          {lossRows.map((row, i) => (
            <View key={i} style={i < lossRows.length - 1 ? S.tableRow : S.tableRowLast}>
              <Text style={[S.tableCellBold, { width: COL_LOSS.year, textAlign: 'center' }, borderRight]}>{v(row.y)}</Text>
              <Text style={[S.tableCell, { width: COL_LOSS.turnover, textAlign: 'center' }, borderRight]}>{v(row.t)}</Text>
              <Text style={[S.tableCell, { width: COL_LOSS.losses, textAlign: 'center' }, borderRight]}>{v(row.l)}</Text>
              <Text style={[S.tableCell, { width: COL_LOSS.count, textAlign: 'center' }, borderRight]}>{v(row.c)}</Text>
              <Text style={[S.tableCell, { width: COL_LOSS.maxLoss, textAlign: 'center' }]}>{v(row.m)}</Text>
            </View>
          ))}
        </View>

        {/* Footer page 1 */}
        <View style={S.footer} fixed>
          <Text>{' '}</Text>
          <Text style={S.footerCenter}>Allianz Trade Bulgaria - Застраховане на търговски кредитен риск</Text>
          <Text style={S.footerRight} render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>

      {/* ══════════ PAGE 2 ══════════ */}
      <Page size="A4" style={S.page}>
        {/* Section 4: Market distribution */}
        <Text style={S.sectionHeader}>4. РАЗПРЕДЕЛЕНИЕ ПО ПАЗАРИ / MARKET DISTRIBUTION</Text>
        <View style={S.tableOuter}>
          <View style={S.tableHeadRow}>
            <Text style={[S.tableHeadCell, { width: COL_MKT.num, textAlign: 'center' }, borderRight]}>№</Text>
            <Text style={[S.tableHeadCell, { width: COL_MKT.country }, borderRight]}>Държава / Country</Text>
            <Text style={[S.tableHeadCell, { width: COL_MKT.turnover, textAlign: 'center' }]}>Оборот (EUR) / Turnover</Text>
          </View>
          {markets.map((m, i) => (
            <View key={i} style={i < markets.length - 1 ? S.tableRow : S.tableRowLast}>
              <Text style={[S.tableCellBold, { width: COL_MKT.num, textAlign: 'center' }, borderRight]}>{i + 1}</Text>
              <Text style={[S.tableCell, { width: COL_MKT.country }, borderRight]}>{v(m.country)}</Text>
              <Text style={[S.tableCell, { width: COL_MKT.turnover, textAlign: 'center' }]}>{v(m.turnover)}</Text>
            </View>
          ))}
        </View>

        {/* Section 5: Payment terms */}
        <Text style={S.sectionHeader}>5. УСЛОВИЯ НА ПЛАЩАНЕ / PAYMENT TERMS</Text>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>Стандартен срок (дни):</Text>
          <Text style={S.dualValue}>{v(f.tc_standard_terms)}</Text>
          <Text style={[S.dualLabel, { width: 130 }]}>Максимален срок (дни):</Text>
          <Text style={S.dualValue}>{v(f.tc_max_terms)}</Text>
        </View>
        <View style={S.dualRow}>
          <Text style={S.dualLabel}>DSO (дни):</Text>
          <Text style={S.dualValue}>{v(f.tc_dso)}</Text>
          <Text style={[S.dualLabel, { width: 130 }]}>% Аванси / Cash advance %:</Text>
          <Text style={S.dualValue}>{f.tc_cash_advance_pct ? `${f.tc_cash_advance_pct}%` : ''}</Text>
        </View>

        {/* Section 6: Top 5 buyers */}
        <Text style={S.sectionHeader}>6. ОСНОВНИ КУПУВАЧИ / TOP 5 BUYERS</Text>
        <View style={S.tableOuter}>
          <View style={S.tableHeadRow}>
            <Text style={[S.tableHeadCell, { width: COL_BUY.name }, borderRight]}>Клиент / Buyer</Text>
            <Text style={[S.tableHeadCell, { width: COL_BUY.country, textAlign: 'center' }, borderRight]}>Държава / Country</Text>
            <Text style={[S.tableHeadCell, { width: COL_BUY.pct, textAlign: 'center' }, borderRight]}>% от оборота</Text>
            <Text style={[S.tableHeadCell, { width: COL_BUY.limit, textAlign: 'center' }, borderRight]}>Кредитен лимит EUR</Text>
            <Text style={[S.tableHeadCell, { width: COL_BUY.terms, textAlign: 'center' }]}>Срок плащане дни</Text>
          </View>
          {buyers.map((b, i) => (
            <View key={i} style={i < buyers.length - 1 ? S.tableRow : S.tableRowLast}>
              <Text style={[S.tableCell, { width: COL_BUY.name }, borderRight]}>{v(b.name)}</Text>
              <Text style={[S.tableCell, { width: COL_BUY.country, textAlign: 'center' }, borderRight]}>{v(b.country)}</Text>
              <Text style={[S.tableCell, { width: COL_BUY.pct, textAlign: 'center' }, borderRight]}>{v(b.pct)}</Text>
              <Text style={[S.tableCell, { width: COL_BUY.limit, textAlign: 'center' }, borderRight]}>{v(b.limit)}</Text>
              <Text style={[S.tableCell, { width: COL_BUY.terms, textAlign: 'center' }]}>{v(b.terms)}</Text>
            </View>
          ))}
        </View>

        {/* Signature section */}
        <Text style={[S.sectionHeader, { marginTop: 20 }]}>ПОДПИС / SIGNATURE</Text>
        <View style={S.signatureRow}>
          <View style={S.signatureBox}>
            <Text style={S.signatureLabel}>Подготвено от / Prepared by:</Text>
            <Text style={S.signatureLine}>{v(f.tc_contact_person)}</Text>
          </View>
          <View style={S.signatureBox}>
            <Text style={S.signatureLabel}>Подпис / Signature:</Text>
            <Text style={S.signatureLine}>{' '}</Text>
          </View>
          <View style={S.signatureBox}>
            <Text style={S.signatureLabel}>Дата / Date:</Text>
            <Text style={S.signatureLine}>{date}</Text>
          </View>
        </View>

        <Text style={S.note}>
          Декларирам, че предоставената информация е вярна и пълна. Наясно съм, че невярна или непълна информация може да доведе до отказ от покритие.
        </Text>

        {/* Footer page 2 */}
        <View style={S.footer} fixed>
          <Text>{' '}</Text>
          <Text style={S.footerCenter}>Allianz Trade Bulgaria - Застраховане на търговски кредитен риск</Text>
          <Text style={S.footerRight} render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
