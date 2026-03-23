// ─── Търговски кредит (Trade Credit) ─────────────────────────────────────────

export type TCInsurerKey = 'atradius' | 'allianz_trade'

export const TC_INSURERS: Record<TCInsurerKey, { name: string; color: string; logo: string }> = {
  atradius:      { name: 'Атрадиус',     color: '#CC0000', logo: '/logos/atradius.svg' },
  allianz_trade: { name: 'Алианц Трейд', color: '#003781', logo: '/logos/allianz_trade.svg' },
}

export interface TCFormData {
  // ── Основни данни ──────────────────────────────────────────────────────────
  tc_company_name:    string
  tc_eik:             string
  tc_address:         string
  tc_contact_person:  string
  tc_position:        string
  tc_phone:           string
  tc_email:           string
  tc_activity:        string
  tc_group:           string   // Икономическа група

  // ── Застрахователна история ────────────────────────────────────────────────
  tc_current_insurer: string
  tc_current_expiry:  string   // Изтичане на текущата застраховка

  // ── Оборот и загуби (последни 3 години) ────────────────────────────────────
  tc_year1:                string  // напр. 2023
  tc_turnover_year1:       string  // хил. EUR
  tc_losses_year1:         string
  tc_losses_count_year1:   string
  tc_max_loss_year1:       string

  tc_year2:                string
  tc_turnover_year2:       string
  tc_losses_year2:         string
  tc_losses_count_year2:   string
  tc_max_loss_year2:       string

  tc_year3:                string
  tc_turnover_year3:       string
  tc_losses_year3:         string
  tc_losses_count_year3:   string
  tc_max_loss_year3:       string

  // ── Прогнозен оборот ───────────────────────────────────────────────────────
  tc_expected_turnover:          string  // Прогнозен общ оборот
  tc_expected_insurable_turnover: string  // Прогнозен застрахователен оборот
  tc_expected_domestic:          string  // Вътрешен пазар
  tc_expected_export:            string  // Експорт

  // ── Разпределение на оборота по пазари ────────────────────────────────────
  tc_market1_country:  string
  tc_market1_turnover: string
  tc_market2_country:  string
  tc_market2_turnover: string
  tc_market3_country:  string
  tc_market3_turnover: string

  // ── Структура на продажбите ────────────────────────────────────────────────
  tc_public_sector_pct:   string  // % към публичен сектор
  tc_intercompany_pct:    string  // % вътрешногрупови
  tc_buyer_sector1:       string
  tc_buyer_sector1_pct:   string
  tc_buyer_sector2:       string
  tc_buyer_sector2_pct:   string

  // ── Условия на плащане ─────────────────────────────────────────────────────
  tc_cash_advance_pct:    string  // % аванси
  tc_standard_terms:      string  // стандартен срок (дни)
  tc_max_terms:           string  // максимален срок (дни)
  tc_dso:                 string  // DSO дни

  // ── Основни купувачи (топ 5) ───────────────────────────────────────────────
  tc_buyer1_name:    string
  tc_buyer1_country: string
  tc_buyer1_id:      string
  tc_buyer1_limit:   string  // '000 EUR
  tc_buyer1_turnover: string

  tc_buyer2_name:    string
  tc_buyer2_country: string
  tc_buyer2_id:      string
  tc_buyer2_limit:   string
  tc_buyer2_turnover: string

  tc_buyer3_name:    string
  tc_buyer3_country: string
  tc_buyer3_id:      string
  tc_buyer3_limit:   string
  tc_buyer3_turnover: string

  tc_buyer4_name:    string
  tc_buyer4_country: string
  tc_buyer4_id:      string
  tc_buyer4_limit:   string
  tc_buyer4_turnover: string

  tc_buyer5_name:    string
  tc_buyer5_country: string
  tc_buyer5_id:      string
  tc_buyer5_limit:   string
  tc_buyer5_turnover: string
}

export const TC_INITIAL: TCFormData = {
  tc_company_name: '', tc_eik: '', tc_address: '', tc_contact_person: '',
  tc_position: '', tc_phone: '', tc_email: '', tc_activity: '', tc_group: '',
  tc_current_insurer: '', tc_current_expiry: '',
  tc_year1: String(new Date().getFullYear() - 1),
  tc_turnover_year1: '', tc_losses_year1: '', tc_losses_count_year1: '', tc_max_loss_year1: '',
  tc_year2: String(new Date().getFullYear() - 2),
  tc_turnover_year2: '', tc_losses_year2: '', tc_losses_count_year2: '', tc_max_loss_year2: '',
  tc_year3: String(new Date().getFullYear() - 3),
  tc_turnover_year3: '', tc_losses_year3: '', tc_losses_count_year3: '', tc_max_loss_year3: '',
  tc_expected_turnover: '', tc_expected_insurable_turnover: '',
  tc_expected_domestic: '', tc_expected_export: '',
  tc_market1_country: 'България', tc_market1_turnover: '',
  tc_market2_country: '', tc_market2_turnover: '',
  tc_market3_country: '', tc_market3_turnover: '',
  tc_public_sector_pct: '', tc_intercompany_pct: '',
  tc_buyer_sector1: '', tc_buyer_sector1_pct: '',
  tc_buyer_sector2: '', tc_buyer_sector2_pct: '',
  tc_cash_advance_pct: '', tc_standard_terms: '', tc_max_terms: '', tc_dso: '',
  tc_buyer1_name: '', tc_buyer1_country: '', tc_buyer1_id: '', tc_buyer1_limit: '', tc_buyer1_turnover: '',
  tc_buyer2_name: '', tc_buyer2_country: '', tc_buyer2_id: '', tc_buyer2_limit: '', tc_buyer2_turnover: '',
  tc_buyer3_name: '', tc_buyer3_country: '', tc_buyer3_id: '', tc_buyer3_limit: '', tc_buyer3_turnover: '',
  tc_buyer4_name: '', tc_buyer4_country: '', tc_buyer4_id: '', tc_buyer4_limit: '', tc_buyer4_turnover: '',
  tc_buyer5_name: '', tc_buyer5_country: '', tc_buyer5_id: '', tc_buyer5_limit: '', tc_buyer5_turnover: '',
}

export const TC_REQUIRED: (keyof TCFormData)[] = [
  'tc_company_name', 'tc_eik', 'tc_contact_person', 'tc_phone',
  'tc_expected_insurable_turnover',
]
