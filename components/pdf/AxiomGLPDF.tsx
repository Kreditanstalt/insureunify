'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { GL_SCHEMA } from '@/lib/gl-schema'
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

const PURPLE = '#6B21A8'
const PURPLE_LIGHT = '#f3e8ff'

const S = StyleSheet.create({
  /* Page */
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
    marginBottom: 4,
  },
  headerLogo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
  },
  headerInsurer: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PURPLE,
    textAlign: 'right',
  },
  headerHr: {
    borderBottom: `1 solid ${PURPLE}`,
    marginBottom: 10,
  },

  /* Title */
  titleBlock: {
    textAlign: 'center',
    marginBottom: 14,
  },
  titleLine: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    color: PURPLE,
  },
  subtitleLine: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    color: PURPLE,
    marginTop: 2,
  },
  subSubtitleLine: {
    fontSize: 9,
    textAlign: 'center',
    color: '#555',
    marginTop: 2,
  },
  formCode: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
    marginTop: 3,
  },

  /* Section headers */
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: PURPLE,
    borderBottom: `1 solid ${PURPLE}`,
    paddingBottom: 3,
    marginTop: 12,
    marginBottom: 8,
  },

  /* Table */
  table: {
    border: `1 solid ${PURPLE}`,
    marginBottom: 6,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: PURPLE_LIGHT,
    borderBottom: `0.5 solid ${PURPLE}`,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #ccc',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  cellLabel: {
    fontSize: 8,
    padding: 4,
    width: '40%',
    borderRight: '0.5 solid #ccc',
  },
  cellValue: {
    fontSize: 8,
    padding: 4,
    flex: 1,
    fontWeight: 'bold',
  },
  cellHeaderLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 4,
    width: '40%',
    borderRight: `0.5 solid ${PURPLE}`,
    color: PURPLE,
  },
  cellHeaderValue: {
    fontSize: 8,
    fontWeight: 'bold',
    padding: 4,
    flex: 1,
    color: PURPLE,
  },

  /* Declaration */
  declaration: {
    fontSize: 8,
    color: '#333',
    marginTop: 14,
    lineHeight: 1.5,
  },

  /* Signatures */
  sigRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 20,
  },
  sigBlock: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 8,
    color: '#555',
    marginBottom: 28,
  },
  sigLine: {
    borderTop: `0.5 solid ${PURPLE}`,
    paddingTop: 3,
  },
  sigName: {
    fontSize: 8,
    color: '#666',
  },

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
    borderTop: `0.5 solid ${PURPLE}`,
    paddingTop: 4,
  },
  footerCenter: {
    fontSize: 8,
    color: '#888',
    textAlign: 'center',
  },
  footerRight: {
    fontSize: 8,
    color: '#888',
    textAlign: 'right',
  },
})

interface Props {
  formData: GLFormData
  clientName: string
}

export function AxiomGLPDF({ formData, clientName }: Props) {
  const d = mapGLFormDataForInsurer(formData, 'axiom')
  const f = (id: string) =>
    d[id]?.displayValue ?? (formData[id] !== undefined && formData[id] !== '' ? String(formData[id]) : '')

  const date = new Date().toLocaleDateString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  /* Collect sections with at least one non-empty field */
  const sectionsWithData = GL_SCHEMA.map((section) => {
    const fieldsWithValues = section.fields.filter((field) => {
      const val = f(field.id)
      return val !== '' && val !== '--'
    })
    return { ...section, fields: fieldsWithValues }
  }).filter((section) => section.fields.length > 0)

  return (
    <Document title={`Аксиом ОГО — ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        {/* -- HEADER -- */}
        <View style={S.headerRow} fixed>
          <Text style={S.headerLogo}>InsureUnify</Text>
          <Text style={S.headerInsurer}>АКСИОМ</Text>
        </View>
        <View style={S.headerHr} fixed />

        {/* -- TITLE -- */}
        <View style={S.titleBlock}>
          <Text style={S.titleLine}>ПРЕДЛОЖЕНИЕ за сключване на застрахователен договор</Text>
          <Text style={S.subtitleLine}>ОБЩА ГРАЖДАНСКА ОТГОВОРНОСТ — КЛАУЗА С2</Text>
          <Text style={S.subSubtitleLine}>Юридически/физически лица — непроизводствени дейности</Text>
          <Text style={S.formCode}>Формуляр: ОГО-С2 · Дата: {date}</Text>
        </View>

        {/* -- SECTIONS -- */}
        {sectionsWithData.map((section) => (
          <View key={section.id} wrap={false}>
            <Text style={S.sectionHeader}>{section.label}</Text>
            <View style={S.table}>
              <View style={S.tableRowHeader}>
                <Text style={S.cellHeaderLabel}>Поле</Text>
                <Text style={S.cellHeaderValue}>Стойност</Text>
              </View>
              {section.fields.map((field, idx) => {
                const isLast = idx === section.fields.length - 1
                return (
                  <View key={field.id} style={isLast ? S.tableRowLast : S.tableRow}>
                    <Text style={S.cellLabel}>{field.label}</Text>
                    <Text style={S.cellValue}>{f(field.id)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        ))}

        {/* -- DECLARATION -- */}
        <Text style={S.declaration}>
          Декларирам, че посочените по-горе данни са верни и пълни. Запознат/а съм с условията
          на застраховката и приемам Общите условия на застрахователя.
        </Text>

        {/* -- SIGNATURES -- */}
        <View style={S.sigRow}>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Застрахован (подпис):</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{clientName}</Text>
            </View>
          </View>
          <View style={S.sigBlock}>
            <Text style={S.sigLabel}>Дата:</Text>
            <View style={S.sigLine}>
              <Text style={S.sigName}>{date}</Text>
            </View>
          </View>
        </View>

        {/* -- FOOTER (fixed) -- */}
        <View style={S.footer} fixed>
          <Text> </Text>
          <Text style={S.footerCenter}>Аксиом · ОГО-С2</Text>
          <Text
            style={S.footerRight}
            render={({ pageNumber, totalPages }) => `Страница ${pageNumber} от ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
