'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import type { InsurerMappedData } from '@/lib/mappings'
import type { InsurerKey } from '@/lib/schema'
import { INSURERS, MASTER_SCHEMA } from '@/lib/schema'

// DejaVu Sans — local TTF files, Cyrillic support
Font.register({
  family: 'DejaVu',
  fonts: [
    { src: '/fonts/DejaVuSans.ttf', fontWeight: 400 },
    { src: '/fonts/DejaVuSans-Bold.ttf', fontWeight: 700 },
  ],
})

// ─── Shared helpers ────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface TemplateProps {
  mappedData: InsurerMappedData
  clientName: string
}

// ─── Shared field-row renderer ─────────────────────────────────────────────────

function renderSections(
  mappedData: InsurerMappedData,
  rowStyle: object,
  rowEvenStyle: object,
  labelStyle: object,
  valueStyle: object,
  sectionTitleStyle: object,
) {
  return MASTER_SCHEMA.map((section) => {
    const fields = section.fields.filter((f) => mappedData[f.id])
    if (fields.length === 0) return null
    return (
      <View key={section.id}>
        <Text style={sectionTitleStyle}>{section.label}</Text>
        {fields.map((field, idx) => {
          const m = mappedData[field.id]
          if (!m) return null
          return (
            <View key={field.id} style={[rowStyle, idx % 2 === 1 ? rowEvenStyle : {}]}>
              <Text style={labelStyle}>{m.originalLabel}</Text>
              <Text style={valueStyle}>{m.displayValue}</Text>
            </View>
          )
        })}
      </View>
    )
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// БУЛСТРАД — официален синьо-бял формуляр, стил на правен документ
// ═══════════════════════════════════════════════════════════════════════════════

const BS = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 9,
    padding: '30 40 55 40',
    color: '#0a0a0a',
    backgroundColor: '#ffffff',
  },
  topBand: {
    backgroundColor: '#0B3D91',
    marginHorizontal: -40,
    marginTop: -30,
    paddingHorizontal: 40,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  bandTitle: { fontSize: 16, fontWeight: 700, color: '#ffffff' },
  bandSub: { fontSize: 7.5, color: '#bfcfef', marginTop: 2 },
  bandRight: { alignItems: 'flex-end' },
  bandLabel: { fontSize: 6.5, color: '#bfcfef', textTransform: 'uppercase' },
  bandValue: { fontSize: 9, fontWeight: 700, color: '#ffffff' },
  clientBox: {
    border: '1.5 solid #0B3D91',
    borderRadius: 3,
    padding: '7 10',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientLabel: { fontSize: 7, color: '#6b7280' },
  clientValue: { fontSize: 12, fontWeight: 700, color: '#0B3D91' },
  formRef: { fontSize: 8, color: '#374151' },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#0B3D91',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: '1 solid #0B3D91',
  },
  row: { flexDirection: 'row', paddingVertical: 3, borderBottom: '0.5 solid #e5e7eb' },
  rowEven: { backgroundColor: '#f0f4fb' },
  rowLabel: { width: '50%', color: '#374151', paddingRight: 8 },
  rowValue: { width: '50%', fontWeight: 700 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: '0.5 solid #0B3D91',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6b7280',
  },
  footerBold: { fontWeight: 700, color: '#0B3D91' },
})

function BulstradTemplate({ mappedData, clientName }: TemplateProps) {
  const insurer = INSURERS.bulstrad
  const date = today()
  return (
    <Document title={`Булстрад — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={BS.page}>
        {/* Blue top band */}
        <View style={BS.topBand}>
          <View>
            <Text style={BS.bandTitle}>БУЛСТРАД ВИЕНА ИНШУРЪНС ГРУП</Text>
            <Text style={BS.bandSub}>Застрахователна декларация / Имущество</Text>
            <Text style={BS.bandSub}>Формуляр № {insurer.formCode}</Text>
          </View>
          <View style={BS.bandRight}>
            <Text style={BS.bandLabel}>Дата на изготвяне</Text>
            <Text style={BS.bandValue}>{date}</Text>
          </View>
        </View>

        {/* Client box */}
        <View style={BS.clientBox}>
          <View>
            <Text style={BS.clientLabel}>Кандидат-застрахован</Text>
            <Text style={BS.clientValue}>{clientName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={BS.clientLabel}>Застраховател</Text>
            <Text style={BS.formRef}>Булстрад · Формуляр {insurer.formCode}</Text>
          </View>
        </View>

        {/* Fields */}
        {renderSections(mappedData, BS.row, BS.rowEven, BS.rowLabel, BS.rowValue, BS.sectionTitle)}

        {/* Footer */}
        <View style={BS.footer} fixed>
          <Text>
            <Text style={BS.footerBold}>Булстрад</Text> · Формуляр {insurer.formCode}
          </Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ЖЕНЕРАЛИ — модерен червено-бял формуляр
// ═══════════════════════════════════════════════════════════════════════════════

const GN = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 9,
    padding: '28 38 55 38',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 16,
  },
  headerLeft: {
    borderLeft: '4 solid #C8102E',
    paddingLeft: 10,
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#C8102E' },
  headerSub: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  headerLabel: { fontSize: 7, color: '#9ca3af', textTransform: 'uppercase' },
  headerDate: { fontSize: 10, fontWeight: 700, color: '#111827' },
  clientStrip: {
    backgroundColor: '#fff1f2',
    border: '1 solid #fecdd3',
    borderRadius: 4,
    padding: '8 12',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientLabel: { fontSize: 7, color: '#9f1239' },
  clientName: { fontSize: 13, fontWeight: 700, color: '#9f1239' },
  formBadge: {
    backgroundColor: '#C8102E',
    borderRadius: 3,
    padding: '3 7',
  },
  formBadgeText: { fontSize: 7, color: '#ffffff', fontWeight: 700 },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#C8102E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottom: '0.5 solid #fecdd3',
  },
  row: { flexDirection: 'row', paddingVertical: 3.5, borderBottom: '0.5 solid #f9fafb' },
  rowEven: { backgroundColor: '#fff5f5' },
  rowLabel: { width: '48%', color: '#6b7280', paddingRight: 8 },
  rowValue: { width: '52%', fontWeight: 700 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 38,
    right: 38,
    borderTop: '0.5 solid #fecdd3',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
  },
})

function GeneraliTemplate({ mappedData, clientName }: TemplateProps) {
  const insurer = INSURERS.generali
  const date = today()
  return (
    <Document title={`Женерали — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={GN.page}>
        {/* Header */}
        <View style={GN.header}>
          <View style={GN.headerLeft}>
            <Text style={GN.headerTitle}>Женерали</Text>
            <Text style={GN.headerSub}>Имущество на фирми и организации</Text>
            <Text style={GN.headerSub}>{insurer.formCode}</Text>
          </View>
          <View style={GN.headerRight}>
            <Text style={GN.headerLabel}>Дата</Text>
            <Text style={GN.headerDate}>{date}</Text>
          </View>
        </View>

        {/* Client strip */}
        <View style={GN.clientStrip}>
          <View>
            <Text style={GN.clientLabel}>Застраховащ</Text>
            <Text style={GN.clientName}>{clientName}</Text>
          </View>
          <View style={GN.formBadge}>
            <Text style={GN.formBadgeText}>ИМСБ</Text>
          </View>
        </View>

        {/* Fields */}
        {renderSections(mappedData, GN.row, GN.rowEven, GN.rowLabel, GN.rowValue, GN.sectionTitle)}

        {/* Footer */}
        <View style={GN.footer} fixed>
          <Text>Женерали · {insurer.formCode}</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ИНСТИНКТ — двуезичен зелен формуляр (БГ/EN)
// ═══════════════════════════════════════════════════════════════════════════════

const IN = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 9,
    padding: '28 38 55 38',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  headerBox: {
    border: '1.5 solid #1B6B3A',
    borderRadius: 4,
    padding: '10 14',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {},
  headerTitle: { fontSize: 16, fontWeight: 700, color: '#1B6B3A' },
  headerSub: { fontSize: 7.5, color: '#6b7280', marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  headerBadge: {
    backgroundColor: '#1B6B3A',
    borderRadius: 3,
    padding: '3 8',
    marginBottom: 4,
  },
  headerBadgeText: { fontSize: 8, color: '#ffffff', fontWeight: 700 },
  headerDate: { fontSize: 8, color: '#374151' },
  clientRow: {
    backgroundColor: '#f0fdf4',
    border: '1 solid #bbf7d0',
    borderRadius: 3,
    padding: '7 12',
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientLabel: { fontSize: 7, color: '#166534' },
  clientName: { fontSize: 12, fontWeight: 700, color: '#14532d' },
  bilingualNote: { fontSize: 7, color: '#9ca3af', fontStyle: 'italic' },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#1B6B3A',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottom: '1 solid #bbf7d0',
  },
  row: { flexDirection: 'row', paddingVertical: 3.5, borderBottom: '0.5 solid #f0fdf4' },
  rowEven: { backgroundColor: '#f0fdf4' },
  rowLabel: { width: '48%', color: '#374151', paddingRight: 8 },
  rowValue: { width: '52%', fontWeight: 700 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 38,
    right: 38,
    borderTop: '0.5 solid #bbf7d0',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
  },
})

function InstinctTemplate({ mappedData, clientName }: TemplateProps) {
  const insurer = INSURERS.instinct
  const date = today()
  return (
    <Document title={`Instinct — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={IN.page}>
        {/* Header box */}
        <View style={IN.headerBox}>
          <View style={IN.headerLeft}>
            <Text style={IN.headerTitle}>Инстинкт / Instinct</Text>
            <Text style={IN.headerSub}>All Risks Insurance / Застраховка Всички Рискове</Text>
            <Text style={IN.headerSub}>Form {insurer.formCode}</Text>
          </View>
          <View style={IN.headerRight}>
            <View style={IN.headerBadge}>
              <Text style={IN.headerBadgeText}>ALL RISKS</Text>
            </View>
            <Text style={IN.headerDate}>{date}</Text>
          </View>
        </View>

        {/* Client row */}
        <View style={IN.clientRow}>
          <View>
            <Text style={IN.clientLabel}>Застраховащ / Insured</Text>
            <Text style={IN.clientName}>{clientName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={IN.bilingualNote}>Формулярът е двуезичен</Text>
            <Text style={IN.bilingualNote}>Form is bilingual BG/EN</Text>
          </View>
        </View>

        {/* Fields */}
        {renderSections(mappedData, IN.row, IN.rowEven, IN.rowLabel, IN.rowValue, IN.sectionTitle)}

        {/* Footer */}
        <View style={IN.footer} fixed>
          <Text>Instinct · {insurer.formCode}</Text>
          <Text>InsureUnify · {date}</Text>
        </View>
      </Page>
    </Document>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dispatcher
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  insurerKey: InsurerKey
  mappedData: InsurerMappedData
  clientName: string
}

export function InsurerDocument({ insurerKey, mappedData, clientName }: Props) {
  switch (insurerKey) {
    case 'bulstrad':
      return <BulstradTemplate mappedData={mappedData} clientName={clientName} />
    case 'generali':
      return <GeneraliTemplate mappedData={mappedData} clientName={clientName} />
    case 'instinct':
      return <InstinctTemplate mappedData={mappedData} clientName={clientName} />
  }
}
