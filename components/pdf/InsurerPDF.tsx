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

const S = StyleSheet.create({
  page: {
    fontFamily: 'DejaVu',
    fontSize: 9,
    padding: '30 40 50 40',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  // ── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    marginBottom: 14,
    borderBottom: '2.5 solid black', // color set inline
  },
  headerLeft: { flexDirection: 'column', gap: 2 },
  headerName: { fontSize: 22, fontWeight: 700 },
  headerSub: { fontSize: 8, color: '#6b7280' },
  headerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  headerLabel: { fontSize: 7, color: '#9ca3af', textTransform: 'uppercase' },
  headerValue: { fontSize: 9, fontWeight: 700 },
  // ── Client box ──────────────────────────────────────────────────
  clientBox: {
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
    borderRadius: 4,
    padding: '8 10',
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientName: { fontSize: 13, fontWeight: 700 },
  clientLabel: { fontSize: 7, color: '#6b7280' },
  // ── Section ─────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottom: '0.5 solid #d1d5db',
  },
  // ── Row ─────────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    paddingVertical: 3.5,
    borderBottom: '0.5 solid #f3f4f6',
  },
  rowEven: { backgroundColor: '#fafafa' },
  rowLabel: { width: '45%', color: '#6b7280', paddingRight: 8 },
  rowValue: { width: '55%', fontWeight: 700 },
  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#9ca3af',
    borderTop: '0.5 solid #e5e7eb',
    paddingTop: 5,
  },
})

interface Props {
  insurerKey: InsurerKey
  mappedData: InsurerMappedData
  clientName: string
}

export function InsurerDocument({ insurerKey, mappedData, clientName }: Props) {
  const insurer = INSURERS[insurerKey]
  const today = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <Document title={`${insurer.name} — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={[S.header, { borderColor: insurer.color }]}>
          <View style={S.headerLeft}>
            <Text style={[S.headerName, { color: insurer.color }]}>
              {insurer.name}
            </Text>
            <Text style={S.headerSub}>Формуляр: {insurer.formCode}</Text>
            <Text style={S.headerSub}>InsureUnify</Text>
          </View>
          <View style={S.headerRight}>
            <Text style={S.headerLabel}>Дата на генериране</Text>
            <Text style={S.headerValue}>{today}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={S.clientBox}>
          <View>
            <Text style={S.clientLabel}>Клиент</Text>
            <Text style={S.clientName}>{clientName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={S.clientLabel}>Застраховател</Text>
            <Text style={[S.clientName, { fontSize: 10, color: insurer.color }]}>
              {insurer.name}
            </Text>
          </View>
        </View>

        {/* Fields grouped by section */}
        {MASTER_SCHEMA.map((section) => {
          const sectionFields = section.fields.filter((f) => mappedData[f.id])
          if (sectionFields.length === 0) return null

          return (
            <View key={section.id}>
              <Text style={S.sectionTitle}>{section.label}</Text>
              {sectionFields.map((field, idx) => {
                const mapped = mappedData[field.id]
                if (!mapped) return null
                return (
                  <View
                    key={field.id}
                    style={[S.row, idx % 2 === 1 ? S.rowEven : {}]}
                  >
                    <Text style={S.rowLabel}>{mapped.originalLabel}</Text>
                    <Text style={S.rowValue}>{mapped.displayValue}</Text>
                  </View>
                )
              })}
            </View>
          )
        })}

        {/* Footer — fixed on every page */}
        <View style={S.footer} fixed>
          <Text>
            {insurer.name} · {insurer.formCode}
          </Text>
          <Text>InsureUnify · {today}</Text>
        </View>
      </Page>
    </Document>
  )
}
