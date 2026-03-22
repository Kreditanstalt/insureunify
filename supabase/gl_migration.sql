-- ─────────────────────────────────────────────────────────────────────────────
-- InsureUnify — GL Migration
-- Обща гражданска отговорност (general_liability)
-- Insurers: Дженерали (generali) + Булстрад (bulstrad)
-- Source questionnaires:
--   1. Дженерали — „Въпросник-предложение ОГО"  (6 клаузи)
--   2. Булстрад  — „Въпросник Отговорност на работодателя" vpr-1330 (BG/EN, 2025)
-- ─────────────────────────────────────────────────────────────────────────────

-- Insurance class
INSERT INTO insurance_classes (id, name, description, is_active)
VALUES (
  'general_liability',
  'Обща гражданска отговорност',
  'ОГО, отговорност на работодателя, дейност, продукт, наемател',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ─── Секция 1: Данни за кандидата ────────────────────────────────────────────

INSERT INTO insurer_mappings
  (insurance_class_id, insurer_id, master_field_id, original_field_name, section_in_original, is_required, sort_order)
VALUES
  ('general_liability','generali','gl_company_name',   'Кандидат за застраховане',                    'Обща информация',          true,  1),
  ('general_liability','generali','gl_eik',            'ЕИК / ЕГН',                                  'Обща информация',          true,  2),
  ('general_liability','generali','gl_address',        'Адрес на управление',                         'Обща информация',          true,  3),
  ('general_liability','generali','gl_phone',          'Тел / Факс.',                                 'Обща информация',          true,  4),
  ('general_liability','generali','gl_mobile',         'моб. тел.',                                   'Обща информация',          false, 5),
  ('general_liability','generali','gl_email',          'e-mail',                                      'Обща информация',          true,  6),
  ('general_liability','generali','gl_representative', 'Представляван от',                            'Обща информация',          false, 7),
  ('general_liability','generali','gl_position',       'Длъжност',                                    'Обща информация',          false, 8),
  ('general_liability','generali','gl_activity',       'Основна дейност',                             'Обща информация',          true,  9),
  ('general_liability','generali','gl_year_founded',   'Година на основаване',                        'Обща информация',          false, 10),
  ('general_liability','generali','gl_website',        'Web-site',                                    'Обща информация',          false, 11),

  ('general_liability','bulstrad','gl_company_name',   'Застрахован / Insured',                       'Секция А',                 true,  1),
  ('general_liability','bulstrad','gl_eik',            'ЕИК, БУЛСТАТ / UIC',                          'Секция А',                 true,  2),
  ('general_liability','bulstrad','gl_address',        'Адрес / Address',                             'Секция А',                 true,  3),
  ('general_liability','bulstrad','gl_phone',          'Телефонен номер / Phone number',              'Секция А',                 true,  4),
  ('general_liability','bulstrad','gl_mobile',         'Мобилен телефон / Mobile phone',              'Секция А',                 false, 5),
  ('general_liability','bulstrad','gl_email',          'Електронна поща / e-mail',                    'Секция А',                 true,  6),
  ('general_liability','bulstrad','gl_representative', 'Имена на законен представител / Representative','Секция А',               false, 7),
  ('general_liability','bulstrad','gl_activity',       'Описание на Дейността / Description of insured activity','Секция В',     true,  9),
  ('general_liability','bulstrad','gl_activity_code',  'Код на Дейността по КИД / CEA/ISIC code',    'Секция В',                 false, 10),
  ('general_liability','bulstrad','gl_website',        'Уеб страница / Website',                      'Секция А',                 false, 11),

-- ─── Секция 2: Клаузи (само Дженерали) ─────────────────────────────────────

  ('general_liability','generali','gl_cover_employer', 'Желая покритие — Отговорност на работодателя','Клаузи',                  false, 15),
  ('general_liability','generali','gl_cover_activity', 'Желая покритие — Отговорност за дейността',  'Клаузи',                  false, 16),
  ('general_liability','generali','gl_cover_product',  'Желая покритие — Отговорност за продукта',   'Клаузи',                  false, 17),
  ('general_liability','generali','gl_cover_tenant',   'Желая покритие — Отговорност на наемателя',  'Клаузи',                  false, 18),
  ('general_liability','generali','gl_cover_pollution','Желая покритие — Инцидентно замърсяване',    'Клаузи',                  false, 19),
  ('general_liability','generali','gl_cover_repair',   'Желая покритие — Ремонтна дейност',          'Клаузи',                  false, 20),

-- ─── Секция 3: Отговорност на работодателя ──────────────────────────────────

  ('general_liability','generali','gl_employees_count',      'Брой на вашите служители и работници',         'Кл. Работодател, т.1', true,  21),
  ('general_liability','generali','gl_annual_wage_fund',     'Годишен фонд Работна заплата (изминала год.)', 'Кл. Работодател, т.2', true,  22),
  ('general_liability','generali','gl_wage_fund_forecast',   'Прогнозен фонд (настояща год.)',               'Кл. Работодател, т.2', false, 23),
  ('general_liability','generali','gl_work_accidents_5y',    'Случаи на трудова злополука (5 год.)?',        'Кл. Работодател, т.3', true,  24),
  ('general_liability','generali','gl_claims_from_workers',  'Предявени искове от увредени лица?',           'Кл. Работодател, т.4', true,  25),
  ('general_liability','generali','gl_claims_details',       'Брой, размер и вид на злополуката',            'Кл. Работодател, т.5', false, 26),
  ('general_liability','generali','gl_workers_insured',      'Застраховани ли са работниците?',              'Кл. Работодател, т.6', false, 27),
  ('general_liability','generali','gl_prev_insurer',         'Предишен застраховател',                       'Кл. Работодател, т.7', false, 28),

  ('general_liability','bulstrad','gl_employees_count',      'Общо / Total лица',                            'Секция В.3',           true,  21),
  ('general_liability','bulstrad','gl_employees_admin',      'Администрация / Administrative',               'Секция В.3',           false, 22),
  ('general_liability','bulstrad','gl_employees_production', 'Производство / Production',                    'Секция В.3',           false, 23),
  ('general_liability','bulstrad','gl_annual_wage_fund',     'Годишен фонд работна заплата / Annual wage fund','Секция В.4',         true,  24),
  ('general_liability','bulstrad','gl_wage_currency',        '☐ BGN ☐ EUR (фонд)',                           'Секция В.4',           true,  25),
  ('general_liability','bulstrad','gl_prev_insurance',       'Имали ли сте действаща/предишна застраховка',  'Секция Б, В.1',        true,  26),
  ('general_liability','bulstrad','gl_prev_labor_insurance', 'Задължителна з-ка Трудова злополука',          'Секция Б, В.2',        false, 27),
  ('general_liability','bulstrad','gl_workers_insured',      'Задължителна з-ка Трудова злополука',          'Секция Б, В.2',        false, 28),
  ('general_liability','bulstrad','gl_prev_insurer',         'Застраховател / Name of insurer',              'Секция Б, таблица',    false, 29),

-- ─── Секция 4: Отговорност за дейността + Приходи ──────────────────────────

  ('general_liability','generali','gl_activity_description', 'Опишете подробно вашата дейност',              'Кл. Дейност, т.1',     true,  31),
  ('general_liability','generali','gl_annual_turnover',      'Годишен търговски оборот (изминала год.)',      'Кл. Дейност, т.2',     true,  32),
  ('general_liability','generali','gl_turnover_forecast',    'Прогнозен оборот (настояща год.)',              'Кл. Дейност, т.2',     false, 33),
  ('general_liability','generali','gl_premises_address',     'Местонахождение на помещенията',                'Кл. Дейност, т.3.1',   false, 34),
  ('general_liability','generali','gl_premises_type',        'Вид помещение (сграда/площ) в m²',             'Кл. Дейност, т.3.2',   false, 35),
  ('general_liability','generali','gl_public_access',        'Достъп на външни лица',                        'Кл. Дейност, т.3.3',   false, 36),
  ('general_liability','generali','gl_last_elec_inspection', 'Последна проверка на ел. инсталация',          'Кл. Дейност, т.3.4.1', false, 37),
  ('general_liability','generali','gl_last_plumbing_check',  'Последна проверка на ВиК',                     'Кл. Дейност, т.3.4.2', false, 38),
  ('general_liability','generali','gl_heating_type',         'Начин на отопление',                           'Кл. Дейност, т.3.5',   false, 39),
  ('general_liability','generali','gl_fire_equipment',       'Средства за пожарогасене',                     'Кл. Дейност, т.3.6',   false, 40),
  ('general_liability','generali','gl_hazardous_materials',  'Експлозиви, химикали, радиоизотопи?',          'Кл. Дейност, т.3.10',  false, 41),
  ('general_liability','generali','gl_third_party_claims_5y','Щети на клиенти/посетители (5 год.)?',        'Кл. Дейност, т.6',     true,  42),

  ('general_liability','bulstrad','gl_annual_turnover',      'Годишен приход / Total annual turnover',       'Секция В.5',           true,  32),
  ('general_liability','bulstrad','gl_revenue_prev_year',    'Приход 2024',                                  'Секция В.5',           false, 40),
  ('general_liability','bulstrad','gl_revenue_current_year', 'Приход 2025',                                  'Секция В.5',           false, 41),
  ('general_liability','bulstrad','gl_revenue_next_year',    'Оценка 2026',                                  'Секция В.5',           false, 42),
  ('general_liability','bulstrad','gl_revenue_currency',     '☐ BGN ☐ EUR (приходи)',                        'Секция В.5',           true,  43),

-- ─── Секция 5: Лимити и договор ─────────────────────────────────────────────

  ('general_liability','generali','gl_single_limit',    'Лимит за едно събитие',                      'Опции лимити',           true,  51),
  ('general_liability','generali','gl_aggregate_limit', 'В агрегат',                                   'Опции лимити',           true,  52),
  ('general_liability','generali','gl_deductible',      'Самоучастие',                                 'т.9',                    false, 53),
  ('general_liability','generali','gl_currency',        'Валута',                                      'Опции лимити',           true,  54),

  ('general_liability','bulstrad','gl_single_limit',    'Единичен лимит / Limit per one occurrence',  'Секция Г',               true,  51),
  ('general_liability','bulstrad','gl_aggregate_limit', 'Агрегатен лимит / Aggregate limit',          'Секция Г',               true,  52),
  ('general_liability','bulstrad','gl_deductible',      'Самоучастие / Deductible',                    'Секция Г',               false, 53),
  ('general_liability','bulstrad','gl_currency',        '☐ BGN ☐ EUR (лимити)',                        'Секция Г',               true,  54),
  ('general_liability','bulstrad','gl_territory',       'Териториална валидност / Territorial validity','Секция Г',              true,  55),
  ('general_liability','bulstrad','gl_period_from',     'Начало / Inception date',                     'Секция Г',               true,  56),
  ('general_liability','bulstrad','gl_period_to',       'Край / Expiry date',                          'Секция Г',               true,  57),
  ('general_liability','bulstrad','gl_retroactive_date','Ретроактивна дата / Retroactive date',        'Секция Г',               false, 58)

ON CONFLICT (insurance_class_id, insurer_id, master_field_id) DO NOTHING;
