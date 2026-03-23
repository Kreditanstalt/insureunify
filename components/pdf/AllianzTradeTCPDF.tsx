'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { TCFormData } from '@/lib/tc-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Roboto-Regular.ttf`, fontWeight: 'normal' },
    { src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Roboto-Bold.ttf`, fontWeight: 'bold' },
  ],
})

const BLUE = '#003781'

const S = StyleSheet.create({
  page:     { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  formCode: { fontSize: 7.5, color: '#888', textAlign: 'right', marginBottom: 4 },
  header:   { marginBottom: 10 },
  logo:     { fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 2 },
  subLine:  { fontSize: 8, color: '#555', marginTop: 1 },
  title:    { fontSize: 10, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 12, borderTop: `1.5 solid ${BLUE}`, borderBottom: `1.5 solid ${BLUE}`, paddingVertical: 5 },
  sec:      { fontSize: 9.5, fontWeight: 700, color: BLUE, marginTop: 10, marginBottom: 5, borderBottom: `0.5 solid ${BLUE}`, paddingBottom: 2, textTransform: 'uppercase' },
  row:      { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  lbl:      { fontSize: 8, color: '#555', width: '45%' },
  lblBi:    { fontSize: 7.5, color: '#888', width: '45%', fontStyle: 'italic' },
  val:      { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1, minHeight: 12 },
  row4:     { flexDirection: 'row', gap: 8, marginBottom: 4 },
  c4lbl:    { fontSize: 8, color: '#555', flex: 1 },
  c4val:    { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1, minHeight: 12 },
  tHead:    { flexDirection: 'row', backgroundColor: '#eef2ff', paddingVertical: 3, paddingHorizontal: 4, marginBottom: 1, borderTop: `0.5 solid #c7d2fe`, borderBottom: `0.5 solid #c7d2fe` },
  tRow:     { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4, borderBottom: `0.3 solid #eee` },
  tHdr:     { fontSize: 7.5, fontWeight: 700, color: BLUE },
  tCell:    { fontSize: 8.5, color: '#111' },
  footer:   { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${BLUE}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  sign:     { flexDirection: 'row', gap: 20, marginTop: 16 },
  signBox:  { flex: 1, borderTop: `0.5 solid #999`, paddingTop: 3 },
  signLbl:  { fontSize: 7.5, color: '#888' },
  note:     { fontSize: 7.5, color: '#888', marginTop: 6, fontStyle: 'italic' },
  box:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  checkbox: { width: 9, height: 9, border: `1 solid #aaa`, fontSize: 7, textAlign: 'center' },
})

function R({ lbl, lblBi, val }: { lbl: string; lblBi?: string; val: string }) {
  return (
    <View style={S.row}>
      <View style={{ width: '45%' }}>
        <Text style={S.lbl}>{lbl}</Text>
        {lblBi && <Text style={S.lblBi}>{lblBi}</Text>}
      </View>
      <Text style={S.val}>{val || ' '}</Text>
    </View>
  )
}

interface Props { formData: TCFormData; clientName: string }

export function AllianzTradeTCPDF({ formData: f, clientName }: Props) {
  const date = new Date().toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const buyers = [
    { name: f.tc_buyer1_name, country: f.tc_buyer1_country, id: f.tc_buyer1_id, limit: f.tc_buyer1_limit, turnover: f.tc_buyer1_turnover },
    { name: f.tc_buyer2_name, country: f.tc_buyer2_country, id: f.tc_buyer2_id, limit: f.tc_buyer2_limit, turnover: f.tc_buyer2_turnover },
    { name: f.tc_buyer3_name, country: f.tc_buyer3_country, id: f.tc_buyer3_id, limit: f.tc_buyer3_limit, turnover: f.tc_buyer3_turnover },
    { name: f.tc_buyer4_name, country: f.tc_buyer4_country, id: f.tc_buyer4_id, limit: f.tc_buyer4_limit, turnover: f.tc_buyer4_turnover },
    { name: f.tc_buyer5_name, country: f.tc_buyer5_country, id: f.tc_buyer5_id, limit: f.tc_buyer5_limit, turnover: f.tc_buyer5_turnover },
  ].filter(b => b.name)

  return (
    <Document title={`Алианц Трейд -- Въпросник -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        <Text style={S.formCode}>Валута: EUR · Дата: {date}</Text>

        <View style={S.header}>
          <Text style={S.logo}>Allianz Trade</Text>
          <Text style={S.subLine}>Allianz Trade Bulgaria · бул. "Тодор Александров" 12, ет. 1, 1000 София</Text>
          <Text style={S.title}>
            ВЪПРОСНИК ЗА ПРЕДЛОЖЕНИЕ -- ЗАСТРАХОВКА ТЪРГОВСКИ КРЕДИТ{'\n'}
            QUESTIONNAIRE FOR AN OFFER REGARDING TRADE CREDIT INSURANCE
          </Text>
        </View>

        {/* 1. General info */}
        <Text style={S.sec}>1. Основна информация / General Information</Text>
        <R lbl="Наименование на компанията / Name:" lblBi="ЕИК / Main legal ID:" val={`${f.tc_company_name || ' '}${f.tc_eik ? `  ·  ${f.tc_eik}` : ''}`} />
        <R lbl="Описание на дейността / Activity description:" val={f.tc_activity} />
        <R lbl="Адрес / Address:" val={f.tc_address} />
        <R lbl="Лице за контакт / Person in charge:" val={f.tc_contact_person} />
        <View style={S.row4}>
          <Text style={S.c4lbl}>Длъжност / Position:</Text>
          <Text style={[S.c4val, { flex: 1.5 }]}>{f.tc_position || ' '}</Text>
          <Text style={S.c4lbl}>Тел / Tel:</Text>
          <Text style={[S.c4val, { flex: 1 }]}>{f.tc_phone || ' '}</Text>
          <Text style={S.c4lbl}>Email:</Text>
          <Text style={[S.c4val, { flex: 1.5 }]}>{f.tc_email || ' '}</Text>
        </View>

        {/* 2. Business structure */}
        <Text style={S.sec}>2. Структура на продажбите / Business Structure</Text>
        <View style={S.tHead}>
          <Text style={[S.tHdr, { flex: 3 }]}> </Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Последни 12 мес.</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Прогноза 12 мес.</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Прогноза застрах.</Text>
        </View>
        <View style={S.tRow}>
          <Text style={[S.tCell, { flex: 3, fontSize: 8 }]}>Общ оборот / Total sales:</Text>
          <Text style={[S.tCell, { flex: 2 }]}>{f.tc_turnover_year1 || '--'}</Text>
          <Text style={[S.tCell, { flex: 2 }]}>{f.tc_expected_turnover || '--'}</Text>
          <Text style={[S.tCell, { flex: 2 }]}>{f.tc_expected_insurable_turnover || '--'}</Text>
        </View>
        <View style={S.tRow}>
          <Text style={[S.tCell, { flex: 3, fontSize: 8 }]}>Вътрешен пазар / Domestic:</Text>
          <Text style={[S.tCell, { flex: 2 }]}>--</Text>
          <Text style={[S.tCell, { flex: 2 }]}>{f.tc_expected_domestic || '--'}</Text>
          <Text style={[S.tCell, { flex: 2 }]}>--</Text>
        </View>
        <View style={S.tRow}>
          <Text style={[S.tCell, { flex: 3, fontSize: 8 }]}>Експорт / Export:</Text>
          <Text style={[S.tCell, { flex: 2 }]}>--</Text>
          <Text style={[S.tCell, { flex: 2 }]}>{f.tc_expected_export || '--'}</Text>
          <Text style={[S.tCell, { flex: 2 }]}>--</Text>
        </View>

        {/* Loss history */}
        <Text style={[S.sec, { marginTop: 10 }]}>История на загубите / Loss History</Text>
        <View style={S.tHead}>
          <Text style={[S.tHdr, { flex: 1 }]}>Година</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Оборот (хил. EUR)</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Щети (хил. EUR)</Text>
          <Text style={[S.tHdr, { flex: 1.5 }]}>Брой</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Макс. щета</Text>
        </View>
        {[
          { y: f.tc_year1, t: f.tc_turnover_year1, l: f.tc_losses_year1, c: f.tc_losses_count_year1, m: f.tc_max_loss_year1 },
          { y: f.tc_year2, t: f.tc_turnover_year2, l: f.tc_losses_year2, c: f.tc_losses_count_year2, m: f.tc_max_loss_year2 },
          { y: f.tc_year3, t: f.tc_turnover_year3, l: f.tc_losses_year3, c: f.tc_losses_count_year3, m: f.tc_max_loss_year3 },
        ].map((row, i) => (
          <View key={i} style={S.tRow}>
            <Text style={[S.tCell, { flex: 1, fontWeight: 700 }]}>{row.y}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.t || '--'}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.l || '--'}</Text>
            <Text style={[S.tCell, { flex: 1.5 }]}>{row.c || '--'}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.m || '--'}</Text>
          </View>
        ))}

        <View style={S.footer} fixed>
          <Text>InsureUnify · Търговски кредит · Алианц Трейд</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={S.page}>
        <Text style={S.formCode}>Валута: EUR · Дата: {date}</Text>

        {/* Market distribution */}
        <Text style={S.sec}>Разпределение по пазари / Market Distribution</Text>
        {[
          { c: f.tc_market1_country, t: f.tc_market1_turnover },
          { c: f.tc_market2_country, t: f.tc_market2_turnover },
          { c: f.tc_market3_country, t: f.tc_market3_turnover },
        ].filter(m => m.c).map((m, i) => (
          <View key={i} style={S.row4}>
            <Text style={[S.c4lbl, { flex: 2 }]}>Държава {i + 1}:</Text>
            <Text style={[S.c4val, { flex: 2 }]}>{m.c}</Text>
            <Text style={S.c4lbl}>Оборот (хил. EUR):</Text>
            <Text style={[S.c4val, { flex: 1 }]}>{m.t || '--'}</Text>
          </View>
        ))}

        {/* Payment terms */}
        <Text style={S.sec}>Условия на плащане / Payment Terms</Text>
        <View style={S.row4}>
          <Text style={S.c4lbl}>Стандартен срок (дни):</Text>
          <Text style={[S.c4val, { flex: 1 }]}>{f.tc_standard_terms || '--'}</Text>
          <Text style={S.c4lbl}>Максимален срок (дни):</Text>
          <Text style={[S.c4val, { flex: 1 }]}>{f.tc_max_terms || '--'}</Text>
        </View>
        <View style={S.row4}>
          <Text style={S.c4lbl}>DSO (дни):</Text>
          <Text style={[S.c4val, { flex: 1 }]}>{f.tc_dso || '--'}</Text>
          <Text style={S.c4lbl}>% Аванси:</Text>
          <Text style={[S.c4val, { flex: 1 }]}>{f.tc_cash_advance_pct ? `${f.tc_cash_advance_pct}%` : '--'}</Text>
        </View>

        {/* Top buyers */}
        <Text style={S.sec}>Основни купувачи / Top Buyers</Text>
        {buyers.length > 0 ? (
          <>
            <View style={S.tHead}>
              <Text style={[S.tHdr, { flex: 3 }]}>Наименование / Name</Text>
              <Text style={[S.tHdr, { flex: 1.5 }]}>Държава</Text>
              <Text style={[S.tHdr, { flex: 2 }]}>ЕИК / VAT</Text>
              <Text style={[S.tHdr, { flex: 2 }]}>Лимит '000 EUR</Text>
              <Text style={[S.tHdr, { flex: 2 }]}>Оборот '000 EUR</Text>
            </View>
            {buyers.map((b, i) => (
              <View key={i} style={S.tRow}>
                <Text style={[S.tCell, { flex: 3 }]}>{b.name}</Text>
                <Text style={[S.tCell, { flex: 1.5 }]}>{b.country || '--'}</Text>
                <Text style={[S.tCell, { flex: 2 }]}>{b.id || '--'}</Text>
                <Text style={[S.tCell, { flex: 2 }]}>{b.limit || '--'}</Text>
                <Text style={[S.tCell, { flex: 2 }]}>{b.turnover || '--'}</Text>
              </View>
            ))}
          </>
        ) : (
          <Text style={S.note}>Няма въведени купувачи.</Text>
        )}

        {/* Signature */}
        <View style={[S.sign, { marginTop: 24 }]}>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Подготвено от / Prepared by:</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>{f.tc_contact_person || ' '}</Text>
          </View>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Подпис / Signature:</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}> </Text>
          </View>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Дата / Date:</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>{date}</Text>
          </View>
        </View>

        <View style={S.footer} fixed>
          <Text>InsureUnify · Търговски кредит · Алианц Трейд</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
