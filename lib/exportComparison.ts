import * as XLSX from 'xlsx'

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
  file_name?: string
  extracted_data?: ExtractedData
  is_recommended?: boolean
}

interface Comparison {
  client_name?: string
  insurance_class?: string
}

function getUniqueCoverages(offers: Offer[]): string[] {
  const all = offers.flatMap((o) => o.extracted_data?.coverages ?? [])
  return Array.from(new Set(all))
}

export function exportComparisonToExcel(comparison: Comparison, offers: Offer[]) {
  const wb = XLSX.utils.book_new()

  // Sheet 1 — Comparison table
  const rows: (string | number | null)[][] = [
    ['СРАВНЕНИЕ НА ЗАСТРАХОВАТЕЛНИ ОФЕРТИ'],
    ['Клиент:', comparison.client_name ?? ''],
    ['Клас:', comparison.insurance_class ?? ''],
    ['Дата:', new Date().toLocaleDateString('bg-BG')],
    [],
    ['', ...offers.map((o) => o.insurer_name)],
    ['Годишна премия (лв)', ...offers.map((o) => o.extracted_data?.premium_annual ?? '-')],
    ['Месечна премия (лв)', ...offers.map((o) => o.extracted_data?.premium_monthly ?? '-')],
    ['Застрахователна сума', ...offers.map((o) => o.extracted_data?.insured_sum ?? '-')],
    ['Самоучастие', ...offers.map((o) => o.extracted_data?.deductible ?? '-')],
    ['Валидна до', ...offers.map((o) => o.extracted_data?.valid_until ?? '-')],
    ['Начин на плащане', ...offers.map((o) => o.extracted_data?.payment_terms ?? '-')],
    [],
    ['ПОКРИТИЯ'],
    ...getUniqueCoverages(offers).map((coverage) => [
      coverage,
      ...offers.map((o) =>
        o.extracted_data?.coverages?.some((c) =>
          c.toLowerCase().includes(coverage.toLowerCase()),
        )
          ? 'ДА'
          : '-',
      ),
    ]),
    [],
    ['ПРЕПОРЪКА', ...offers.map((o) => (o.is_recommended ? '⭐ ПРЕПОРЪЧАНА' : ''))],
  ]

  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 30 }, ...offers.map(() => ({ wch: 20 }))]
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: offers.length } }]
  XLSX.utils.book_append_sheet(wb, ws, 'Сравнение')

  // Sheet 2+ — Raw data per offer
  offers.forEach((offer) => {
    const offerRows: (string | number | null)[][] = [
      ['Застраховател', offer.insurer_name],
      ['Файл', offer.file_name ?? ''],
      ['Годишна премия', offer.extracted_data?.premium_annual ?? '-'],
      ['Месечна премия', offer.extracted_data?.premium_monthly ?? '-'],
      ['Застрахователна сума', offer.extracted_data?.insured_sum ?? '-'],
      ['Самоучастие', offer.extracted_data?.deductible ?? '-'],
      ['Валидна до', offer.extracted_data?.valid_until ?? '-'],
      ['Плащане', offer.extracted_data?.payment_terms ?? '-'],
      [],
      ['Покрития'],
      ...(offer.extracted_data?.coverages ?? []).map((c) => ['', c]),
      [],
      ['Изключения'],
      ...(offer.extracted_data?.exclusions ?? []).map((e) => ['', e]),
      [],
      ['Специални условия'],
      ...(offer.extracted_data?.special_conditions ?? []).map((s) => ['', s]),
    ]
    const ws2 = XLSX.utils.aoa_to_sheet(offerRows)
    ws2['!cols'] = [{ wch: 25 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(wb, ws2, offer.insurer_name.substring(0, 31))
  })

  const safeName = (comparison.client_name ?? 'export').replace(/[/\\?%*:|"<>]/g, '-')
  const dateStr = new Date().toLocaleDateString('bg-BG').replace(/\//g, '-')
  XLSX.writeFile(wb, `Сравнение_${safeName}_${dateStr}.xlsx`)
}
