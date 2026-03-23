'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { TCFormData } from '@/lib/tc-schema'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf',       fontWeight: 'normal', fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Oblique.ttf', fontWeight: 'normal', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf',  fontWeight: 'bold',   fontStyle: 'normal' },
    { src: 'https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-BoldOblique.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})

const RED = '#CC0000'

const S = StyleSheet.create({
  page:      { fontFamily: 'Roboto', fontSize: 9, color: '#111', backgroundColor: '#fff', paddingTop: 36, paddingBottom: 50, paddingHorizontal: 42 },
  formCode:  { fontSize: 7.5, color: '#888', textAlign: 'right', marginBottom: 4 },
  header:    { marginBottom: 10 },
  logo:      { fontSize: 14, fontWeight: 700, color: RED, marginBottom: 2 },
  subLine:   { fontSize: 8, color: '#555', marginTop: 1 },
  title:     { fontSize: 10, fontWeight: 700, textAlign: 'center', marginTop: 10, marginBottom: 12, borderTop: `1.5 solid ${RED}`, borderBottom: `1.5 solid ${RED}`, paddingVertical: 5 },
  sec:       { fontSize: 9.5, fontWeight: 700, color: RED, marginTop: 10, marginBottom: 5, borderBottom: `0.5 solid ${RED}`, paddingBottom: 2, textTransform: 'uppercase' },
  row:       { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-end' },
  lbl:       { fontSize: 8, color: '#555', width: '42%' },
  lblBi:     { fontSize: 7.5, color: '#888', width: '42%', fontStyle: 'italic' },
  val:       { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1, minHeight: 12 },
  row4:      { flexDirection: 'row', gap: 8, marginBottom: 4 },
  col4lbl:   { fontSize: 8, color: '#555', flex: 1 },
  col4val:   { fontSize: 9, fontWeight: 700, flex: 1, borderBottom: `0.5 solid #bbb`, paddingBottom: 1, minHeight: 12 },
  tHead:     { flexDirection: 'row', backgroundColor: '#f5f5f5', paddingVertical: 3, paddingHorizontal: 4, marginBottom: 1, borderTop: `0.5 solid #ccc`, borderBottom: `0.5 solid #ccc` },
  tRow:      { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4, borderBottom: `0.3 solid #eee` },
  tHdr:      { fontSize: 7.5, fontWeight: 700, color: '#555' },
  tCell:     { fontSize: 8.5, color: '#111' },
  footer:    { position: 'absolute', bottom: 18, left: 42, right: 42, borderTop: `0.5 solid ${RED}`, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7, color: '#888' },
  sign:      { flexDirection: 'row', gap: 20, marginTop: 16 },
  signBox:   { flex: 1, borderTop: `0.5 solid #999`, paddingTop: 3 },
  signLbl:   { fontSize: 7.5, color: '#888' },
  note:      { fontSize: 7.5, color: '#888', marginTop: 8, fontStyle: 'italic' },
})

function R({ lbl, lblBi, val }: { lbl: string; lblBi?: string; val: string }) {
  return (
    <View style={S.row}>
      <View style={{ width: '42%' }}>
        <Text style={S.lbl}>{lbl}</Text>
        {lblBi && <Text style={S.lblBi}>{lblBi}</Text>}
      </View>
      <Text style={S.val}>{val || ' '}</Text>
    </View>
  )
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

  return (
    <Document title={`Атрадиус -- Заявка -- ${clientName}`} author="InsureUnify">
      <Page size="A4" style={S.page}>

        <Text style={S.formCode}>Формуляр: Proposal Form · Дата: {date}</Text>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.logo}>Atradius</Text>
          <Text style={S.subLine}>Атрадиус Кредито и Каусион С.А. де Сегурос и Реасегурос, клон България КЧТ</Text>
          <Text style={S.subLine}>Бул. Д-р. Г. М. Димитров 79, ет. 3 · 1700 гр. София · ЕИК: 204708066</Text>
          <Text style={S.title}>ЗАЯВКА ЗА ЗАСТРАХОВАНЕ / PROPOSAL FORM{'\n'}ЗАСТРАХОВКА НА ТЪРГОВСКИ КРЕДИТ</Text>
        </View>

        {/* 1. Client */}
        <Text style={S.sec}>1/ Клиент / Customer</Text>
        <R lbl="Компания / Company" lblBi="Данъчен номер / National ID:" val={`${f.tc_company_name}${f.tc_eik ? `  ·  ЕИК: ${f.tc_eik}` : ''}`} />
        <R lbl="Адрес / Address:" lblBi="Лице за контакт / Contact person:" val={`${f.tc_address || ' '}  ·  ${f.tc_contact_person || ' '}`} />
        <R lbl="Икономически сектор / Trade sector:" val={f.tc_activity} />
        <R lbl="Икономическа Група / Group:" val={f.tc_group} />
        <View style={S.row4}>
          <Text style={S.col4lbl}>Телефон / Phone:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_phone || ' '}</Text>
          <Text style={S.col4lbl}>E-mail:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_email || ' '}</Text>
        </View>
        <View style={S.row4}>
          <Text style={S.col4lbl}>Текущ застраховател:</Text>
          <Text style={[S.col4val, { flex: 2 }]}>{f.tc_current_insurer || ' '}</Text>
          <Text style={S.col4lbl}>Изтичане:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_current_expiry || ' '}</Text>
        </View>

        {/* 2. Turnover & losses */}
        <Text style={S.sec}>2/ Търговски оборот и загуби (хил. EUR с ДДС) / Turnover and Losses incl. VAT</Text>
        <View style={S.tHead}>
          <Text style={[S.tHdr, { flex: 1 }]}>Година / Year</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Оборот хил. EUR / Turnover</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Щети хил. EUR / Losses</Text>
          <Text style={[S.tHdr, { flex: 1.5 }]}>Брой / No.</Text>
          <Text style={[S.tHdr, { flex: 2 }]}>Макс. щета / Highest loss</Text>
        </View>
        {[
          { year: f.tc_year1, t: f.tc_turnover_year1, l: f.tc_losses_year1, c: f.tc_losses_count_year1, m: f.tc_max_loss_year1 },
          { year: f.tc_year2, t: f.tc_turnover_year2, l: f.tc_losses_year2, c: f.tc_losses_count_year2, m: f.tc_max_loss_year2 },
          { year: f.tc_year3, t: f.tc_turnover_year3, l: f.tc_losses_year3, c: f.tc_losses_count_year3, m: f.tc_max_loss_year3 },
        ].map((row, i) => (
          <View key={i} style={S.tRow}>
            <Text style={[S.tCell, { flex: 1, fontWeight: 700 }]}>{row.year}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.t || '--'}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.l || '--'}</Text>
            <Text style={[S.tCell, { flex: 1.5 }]}>{row.c || '--'}</Text>
            <Text style={[S.tCell, { flex: 2 }]}>{row.m || '--'}</Text>
          </View>
        ))}
        <View style={[S.row4, { marginTop: 6 }]}>
          <Text style={S.col4lbl}>Прогнозен оборот / Expected turnover:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_expected_turnover || ' '}</Text>
          <Text style={S.col4lbl}>Застрах. оборот / Insurable:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_expected_insurable_turnover || ' '}</Text>
        </View>

        {/* 3. Market distribution */}
        <Text style={S.sec}>3/ Разпределение на оборота / Turnover Distribution</Text>
        {[
          { c: f.tc_market1_country, t: f.tc_market1_turnover },
          { c: f.tc_market2_country, t: f.tc_market2_turnover },
          { c: f.tc_market3_country, t: f.tc_market3_turnover },
        ].filter(m => m.c).map((m, i) => (
          <View key={i} style={S.row4}>
            <Text style={[S.col4lbl, { flex: 2 }]}>Държава {i + 1} / Country:</Text>
            <Text style={[S.col4val, { flex: 2 }]}>{m.c}</Text>
            <Text style={S.col4lbl}>Оборот хил. EUR:</Text>
            <Text style={[S.col4val, { flex: 1 }]}>{m.t || '--'}</Text>
          </View>
        ))}

        {/* 4. Buyers structure */}
        <Text style={S.sec}>4/ Структура на продажбите / Buyers Structure</Text>
        <View style={S.row4}>
          <Text style={S.col4lbl}>% Публичен сектор:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_public_sector_pct ? `${f.tc_public_sector_pct}%` : '--'}</Text>
          <Text style={S.col4lbl}>% Вътрешногрупови:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_intercompany_pct ? `${f.tc_intercompany_pct}%` : '--'}</Text>
        </View>
        {f.tc_buyer_sector1 && (
          <R lbl={`Сектор 1: ${f.tc_buyer_sector1}`} val={f.tc_buyer_sector1_pct ? `${f.tc_buyer_sector1_pct}% от оборота` : '--'} />
        )}
        {f.tc_buyer_sector2 && (
          <R lbl={`Сектор 2: ${f.tc_buyer_sector2}`} val={f.tc_buyer_sector2_pct ? `${f.tc_buyer_sector2_pct}% от оборота` : '--'} />
        )}

        {/* Footer p1 */}
        <View style={S.footer} fixed>
          <Text>InsureUnify · Търговски кредит · Атрадиус</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={S.page}>
        <Text style={S.formCode}>Формуляр: Proposal Form · Дата: {date}</Text>

        {/* 5. Payment terms */}
        <Text style={S.sec}>6/ Условия на плащане / Payment Terms</Text>
        <View style={S.row4}>
          <Text style={S.col4lbl}>% Аванси / Cash in advance:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_cash_advance_pct ? `${f.tc_cash_advance_pct}%` : '--'}</Text>
          <Text style={S.col4lbl}>DSO (дни):</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_dso ? `${f.tc_dso} дни` : '--'}</Text>
        </View>
        <View style={S.row4}>
          <Text style={S.col4lbl}>Стандартен срок / Standard terms:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_standard_terms ? `${f.tc_standard_terms} дни` : '--'}</Text>
          <Text style={S.col4lbl}>Макс. срок / Max terms:</Text>
          <Text style={[S.col4val, { flex: 1 }]}>{f.tc_max_terms ? `${f.tc_max_terms} дни` : '--'}</Text>
        </View>

        {/* 6. Top buyers */}
        <Text style={S.sec}>7/ Основни купувачи / Top Buyers to be Insured</Text>
        <Text style={S.note}>Атрадиус ще провери безплатно до 10 купувача в рамките на офертата.</Text>
        {buyers.length > 0 ? (
          <>
            <View style={[S.tHead, { marginTop: 6 }]}>
              <Text style={[S.tHdr, { flex: 3 }]}>Наименование и адрес / Name & Address</Text>
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

        {/* Declaration */}
        <Text style={[S.sec, { marginTop: 20 }]}>8/ Декларация / Our Declaration</Text>
        <Text style={S.note}>
          С настоящата Заявка за застраховане, предоставяме своето съгласие да използвате името на компанията ни
          като доставчик, с цел получаване на финансова информация от купувачите. Декларираме, че поемаме
          отговорност за истинността и достоверността на подадената информация.
        </Text>

        <View style={[S.sign, { marginTop: 24 }]}>
          <View style={S.signBox}>
            <Text style={S.signLbl}>Име / Name:</Text>
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
          <Text>InsureUnify · Търговски кредит · Атрадиус</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
