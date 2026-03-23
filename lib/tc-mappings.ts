import type { TCFormData, TCInsurerKey } from './tc-schema'

export interface TCInsurerMappedData {
  insurer: TCInsurerKey
  fields:  Record<string, string>
}

export function mapTCFormDataForAll(
  form: TCFormData,
  insurers: TCInsurerKey[],
): Record<TCInsurerKey, TCInsurerMappedData> {
  const result = {} as Record<TCInsurerKey, TCInsurerMappedData>
  for (const key of insurers) {
    result[key] = { insurer: key, fields: mapForInsurer(form, key) }
  }
  return result
}

function mapForInsurer(f: TCFormData, insurer: TCInsurerKey): Record<string, string> {
  // Common fields for both insurers
  const common: Record<string, string> = {
    'Компания / Company':             f.tc_company_name,
    'ЕИК / National ID':              f.tc_eik,
    'Адрес / Address':                f.tc_address,
    'Лице за контакт / Contact':      f.tc_contact_person,
    'Длъжност / Position':            f.tc_position,
    'Телефон / Phone':                f.tc_phone,
    'Ел. поща / E-mail':              f.tc_email,
    'Дейност / Activity':             f.tc_activity,
    [`Оборот ${f.tc_year1} (хил. EUR)`]: f.tc_turnover_year1,
    [`Щети ${f.tc_year1} (хил. EUR)`]:   f.tc_losses_year1,
    [`Брой загуби ${f.tc_year1}`]:        f.tc_losses_count_year1,
    [`Макс. щета ${f.tc_year1}`]:         f.tc_max_loss_year1,
    [`Оборот ${f.tc_year2} (хил. EUR)`]: f.tc_turnover_year2,
    [`Щети ${f.tc_year2} (хил. EUR)`]:   f.tc_losses_year2,
    [`Брой загуби ${f.tc_year2}`]:        f.tc_losses_count_year2,
    [`Макс. щета ${f.tc_year2}`]:         f.tc_max_loss_year2,
    [`Оборот ${f.tc_year3} (хил. EUR)`]: f.tc_turnover_year3,
    [`Щети ${f.tc_year3} (хил. EUR)`]:   f.tc_losses_year3,
    [`Брой загуби ${f.tc_year3}`]:        f.tc_losses_count_year3,
    [`Макс. щета ${f.tc_year3}`]:         f.tc_max_loss_year3,
    'Прогнозен оборот (хил. EUR)':        f.tc_expected_turnover,
    'Застрахователен оборот (хил. EUR)':  f.tc_expected_insurable_turnover,
    'Вътрешен пазар (хил. EUR)':          f.tc_expected_domestic,
    'Експорт (хил. EUR)':                 f.tc_expected_export,
    'Пазар 1 — Държава':                  f.tc_market1_country,
    'Пазар 1 — Оборот (хил. EUR)':        f.tc_market1_turnover,
    'Пазар 2 — Държава':                  f.tc_market2_country,
    'Пазар 2 — Оборот (хил. EUR)':        f.tc_market2_turnover,
    'Пазар 3 — Държава':                  f.tc_market3_country,
    'Пазар 3 — Оборот (хил. EUR)':        f.tc_market3_turnover,
    '% публичен сектор':                  f.tc_public_sector_pct,
    '% вътрешногрупови':                  f.tc_intercompany_pct,
    'Сектор купувачи 1':                  f.tc_buyer_sector1,
    '% сектор 1':                         f.tc_buyer_sector1_pct,
    'Сектор купувачи 2':                  f.tc_buyer_sector2,
    '% сектор 2':                         f.tc_buyer_sector2_pct,
    'Купувач 1 — Наименование':           f.tc_buyer1_name,
    'Купувач 1 — Държава':               f.tc_buyer1_country,
    'Купувач 1 — ЕИК/VAT':              f.tc_buyer1_id,
    'Купувач 1 — Лимит (хил. EUR)':      f.tc_buyer1_limit,
    'Купувач 1 — Оборот (хил. EUR)':     f.tc_buyer1_turnover,
    'Купувач 2 — Наименование':           f.tc_buyer2_name,
    'Купувач 2 — Държава':               f.tc_buyer2_country,
    'Купувач 2 — ЕИК/VAT':              f.tc_buyer2_id,
    'Купувач 2 — Лимит (хил. EUR)':      f.tc_buyer2_limit,
    'Купувач 2 — Оборот (хил. EUR)':     f.tc_buyer2_turnover,
    'Купувач 3 — Наименование':           f.tc_buyer3_name,
    'Купувач 3 — Държава':               f.tc_buyer3_country,
    'Купувач 3 — ЕИК/VAT':              f.tc_buyer3_id,
    'Купувач 3 — Лимит (хил. EUR)':      f.tc_buyer3_limit,
    'Купувач 3 — Оборот (хил. EUR)':     f.tc_buyer3_turnover,
    'Купувач 4 — Наименование':           f.tc_buyer4_name,
    'Купувач 4 — Държава':               f.tc_buyer4_country,
    'Купувач 4 — ЕИК/VAT':              f.tc_buyer4_id,
    'Купувач 4 — Лимит (хил. EUR)':      f.tc_buyer4_limit,
    'Купувач 4 — Оборот (хил. EUR)':     f.tc_buyer4_turnover,
    'Купувач 5 — Наименование':           f.tc_buyer5_name,
    'Купувач 5 — Държава':               f.tc_buyer5_country,
    'Купувач 5 — ЕИК/VAT':              f.tc_buyer5_id,
    'Купувач 5 — Лимит (хил. EUR)':      f.tc_buyer5_limit,
    'Купувач 5 — Оборот (хил. EUR)':     f.tc_buyer5_turnover,
  }

  if (insurer === 'atradius') {
    return {
      ...common,
      'Икономическа Група / Group':         f.tc_group,
      'Текущ застраховател':                f.tc_current_insurer,
      'Изтичане на застраховка':            f.tc_current_expiry,
      '% аванси / Cash in advance':         f.tc_cash_advance_pct,
      'Стандартен срок (дни)':              f.tc_standard_terms,
      'Максимален срок (дни)':              f.tc_max_terms,
      'DSO (дни)':                          f.tc_dso,
    }
  }

  // allianz_trade
  return {
    ...common,
    'Застрахователен оборот последни 12м':  f.tc_expected_insurable_turnover,
    'Прогнозен застрахователен оборот':     f.tc_expected_insurable_turnover,
  }
}
