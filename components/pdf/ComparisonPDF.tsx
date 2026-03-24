'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf', fontWeight: 'bold', fontStyle: 'normal' },
  ],
})

const S = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 8, lineHeight: 1.4, color: '#1f2937', backgroundColor: '#fff', padding: 40 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 9, color: '#6b7280', textAlign: 'center', marginBottom: 16 },
  meta: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
  table: { marginTop: 12 },
  headerRow: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderBottom: '1 solid #d1d5db' },
  row: { flexDirection: 'row', borderBottom: '0.5 solid #e5e7eb' },
  recommendedRow: { flexDirection: 'row', borderBottom: '0.5 solid #e5e7eb', backgroundColor: '#f0fdf4' },
  labelCell: { width: 120, padding: 5, fontWeight: 'bold', fontSize: 7, borderRight: '0.5 solid #e5e7eb' },
  headerCell: { flex: 1, padding: 5, fontWeight: 'bold', fontSize: 7, textAlign: 'center', borderRight: '0.5 solid #e5e7eb' },
  cell: { flex: 1, padding: 5, fontSize: 7, textAlign: 'center', borderRight: '0.5 solid #e5e7eb' },
  recommendedHeader: { flex: 1, padding: 5, fontWeight: 'bold', fontSize: 7, textAlign: 'center', borderRight: '0.5 solid #e5e7eb', backgroundColor: '#dcfce7', color: '#166534' },
  sectionTitle: { fontSize: 9, fontWeight: 'bold', marginTop: 16, marginBottom: 4, color: '#374151' },
  coverageRow: { flexDirection: 'row', borderBottom: '0.5 solid #f3f4f6' },
  coverageLabel: { width: 120, padding: 3, fontSize: 6.5, borderRight: '0.5 solid #e5e7eb' },
  coverageCell: { flex: 1, padding: 3, fontSize: 6.5, textAlign: 'center', borderRight: '0.5 solid #e5e7eb' },
  footer: { position: 'absolute', bottom: 25, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5 solid #e5e7eb', paddingTop: 6 },
  footerText: { fontSize: 6.5, color: '#9ca3af' },
})

interface ExtractedData {
  premium_annual?: number | null
  premium_monthly?: number | null
  insured_sum?: number | null
  deductible?: string | null
  valid_until?: string | null
  payment_terms?: string | null
  coverages?: string[]
  exclusions?: string[]
  special_conditions?: string[]
  [key: string]: unknown
}

interface Offer {
  insurer_name: string
  extracted_data?: ExtractedData
  is_recommended?: boolean
}

interface Props {
  clientName: string
  insuranceClass: string
  offers: Offer[]
  brokerName?: string
  brokerCompany?: string
}

const CLASS_LABELS: Record<string, string> = {
  property: 'Имущество',
  general_liability: 'ОГО',
  occupational_accident: 'Трудова злополука',
  professional_liability: 'Проф. отговорност',
  trade_credit: 'Търговски кредит',
}

const fmtVal = (v: unknown): string => {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'number') return v.toLocaleString('bg-BG')
  return String(v)
}

export function ComparisonPDF({ clientName, insuranceClass, offers, brokerName, brokerCompany }: Props) {
  const dateStr = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric' })
  const classLabel = CLASS_LABELS[insuranceClass] ?? insuranceClass

  // Collect unique coverages
  const allCoverages = Array.from(new Set(offers.flatMap((o) => o.extracted_data?.coverages ?? [])))

  const MAIN_ROWS: { label: string; key: keyof ExtractedData; suffix?: string }[] = [
    { label: 'Годишна премия', key: 'premium_annual', suffix: ' лв' },
    { label: 'Месечна премия', key: 'premium_monthly', suffix: ' лв' },
    { label: 'Застрахователна сума', key: 'insured_sum', suffix: ' лв' },
    { label: 'Самоучастие', key: 'deductible' },
    { label: 'Начин на плащане', key: 'payment_terms' },
    { label: 'Валидна до', key: 'valid_until' },
  ]

  return (
    <Document>
      <Page size="A4" orientation={offers.length > 3 ? 'landscape' : 'portrait'} style={S.page}>
        <Text style={S.title}>СРАВНЕНИЕ НА ЗАСТРАХОВАТЕЛНИ ОФЕРТИ</Text>
        <Text style={S.subtitle}>{classLabel}</Text>
        <Text style={S.meta}>Клиент: {clientName}</Text>
        <Text style={S.meta}>Дата: {dateStr}</Text>
        <Text style={S.meta}>Брой оферти: {offers.length}</Text>

        {/* Main comparison table */}
        <View style={S.table}>
          {/* Header */}
          <View style={S.headerRow}>
            <Text style={S.labelCell}></Text>
            {offers.map((o, i) => (
              <Text key={i} style={o.is_recommended ? S.recommendedHeader : S.headerCell}>
                {o.insurer_name}{o.is_recommended ? ' ⭐' : ''}
              </Text>
            ))}
          </View>

          {/* Main data rows */}
          {MAIN_ROWS.map((row) => (
            <View key={row.key} style={S.row}>
              <Text style={S.labelCell}>{row.label}</Text>
              {offers.map((o, i) => {
                const val = o.extracted_data?.[row.key]
                return (
                  <Text key={i} style={S.cell}>
                    {fmtVal(val)}{val != null && row.suffix ? row.suffix : ''}
                  </Text>
                )
              })}
            </View>
          ))}
        </View>

        {/* Coverages section */}
        {allCoverages.length > 0 && (
          <>
            <Text style={S.sectionTitle}>Покрития</Text>
            <View style={S.table}>
              <View style={S.headerRow}>
                <Text style={S.labelCell}>Покритие</Text>
                {offers.map((o, i) => (
                  <Text key={i} style={S.headerCell}>{o.insurer_name}</Text>
                ))}
              </View>
              {allCoverages.map((cov, ci) => (
                <View key={ci} style={S.coverageRow}>
                  <Text style={S.coverageLabel}>{cov}</Text>
                  {offers.map((o, i) => (
                    <Text key={i} style={S.coverageCell}>
                      {o.extracted_data?.coverages?.some((c) => c.toLowerCase().includes(cov.toLowerCase())) ? 'ДА' : '-'}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Recommendation */}
        {offers.some((o) => o.is_recommended) && (
          <View style={{ marginTop: 12, padding: 8, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#166534' }}>
              Препоръчана оферта: {offers.find((o) => o.is_recommended)?.insurer_name}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>{brokerCompany ?? 'InsureUnify'}{brokerName ? ` · ${brokerName}` : ''}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
