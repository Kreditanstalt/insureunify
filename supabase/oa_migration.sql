-- ═══════════════════════════════════════════════════════════════════════════
-- OA Migration — Трудова злополука (Occupational Accident)
-- ═══════════════════════════════════════════════════════════════════════════

-- New insurers
INSERT INTO insurers (id, name, short_name, form_title, form_code, color) VALUES
  ('allianz',  'ЗАД Алианц България',     'Алианц', 'Задължителна з-ка Трудова злополука', 'VAPROSNIK_0142',   '#003781'),
  ('groupama', 'Групама Застраховане ЕАД', 'Групама', 'Групова застраховка Злополука',       'Групама-Злополука', '#00A94F')
ON CONFLICT (id) DO NOTHING;

-- New insurance class
INSERT INTO insurance_classes (id, name, description, is_active) VALUES
  ('occupational_accident', 'Трудова злополука', 'Задължителна и доброволна застраховка злополука на работници и служители', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Секция 1: Данни за застраховащия ────────────────────────────────────────
INSERT INTO insurer_mappings (insurance_class_id, insurer_id, master_field_id, original_field_name, section_in_original, is_required, sort_order) VALUES
  ('occupational_accident', 'allianz',  'oa_company_name',      'Застраховащ (наименование на фирмата)',       'Заглавна',        true,  1),
  ('occupational_accident', 'allianz',  'oa_eik',               'ЕИК',                                         'Заглавна',        true,  2),
  ('occupational_accident', 'allianz',  'oa_address',           'Адрес (гр./с., ул., №)',                      'Заглавна',        true,  3),
  ('occupational_accident', 'allianz',  'oa_phone',             'Тел.',                                        'Заглавна',        true,  4),
  ('occupational_accident', 'allianz',  'oa_activity',          'Основна дейност на фирмата',                  'Информация т.1',  true,  5),
  ('occupational_accident', 'allianz',  'oa_activity_code',     'Код по НКИД',                                 'Информация т.1',  false, 6),
  ('occupational_accident', 'allianz',  'oa_secondary_activity','Спомагателни дейности + Код по НКИД',         'Информация т.2',  false, 7),

  ('occupational_accident', 'groupama', 'oa_company_name',      'Кандидат за Застраховане',                    'Данни',           true,  1),
  ('occupational_accident', 'groupama', 'oa_eik',               'ЕИК',                                         'Данни',           true,  2),
  ('occupational_accident', 'groupama', 'oa_address',           'Адрес за кореспонденция',                     'Данни',           true,  3),
  ('occupational_accident', 'groupama', 'oa_phone',             'тел.',                                        'Данни',           true,  4),
  ('occupational_accident', 'groupama', 'oa_representative',    'Представляван от',                            'Данни',           false, 5),
  ('occupational_accident', 'groupama', 'oa_activity',          'Предмет на дейност',                          'Данни',           true,  6),

-- ─── Секция 2: Данни за застраховката ────────────────────────────────────────
  ('occupational_accident', 'allianz',  'oa_persons_count',     'Брой лица - служители на трудов договор',     'Заглавна',        true,  10),
  ('occupational_accident', 'allianz',  'oa_period_from',       'от 00.00 часа на ___ г.',                     'Срок',            true,  11),
  ('occupational_accident', 'allianz',  'oa_period_to',         'до 24.00 часа на ___ г.',                     'Срок',            false, 12),
  ('occupational_accident', 'allianz',  'oa_currency',          'Лева',                                        'Покрити рискове', true,  13),
  ('occupational_accident', 'allianz',  'oa_territory',         'Р България / Чужбина',                        'Територия',       false, 14),

  ('occupational_accident', 'groupama', 'oa_persons_count',     '___ лица (от поименен списък)',               'Застраховка',     true,  10),
  ('occupational_accident', 'groupama', 'oa_period_from',       'Начало',                                      'Застраховка',     true,  11),
  ('occupational_accident', 'groupama', 'oa_period_months',     'За срок от ___ месеца (от 1 до 12)',          'Застраховка',     false, 12),
  ('occupational_accident', 'groupama', 'oa_currency',          'Лева / Евро',                                 'Застраховка',     true,  13),
  ('occupational_accident', 'groupama', 'oa_insurance_type',    'Пакет А (задължителна) / Пакет Б (доброволна)','Покрития',       true,  14),

-- ─── Секция 3: Покрити рискове ────────────────────────────────────────────────
  ('occupational_accident', 'allianz',  'oa_cover_death',               'Смърт от трудова злополука — съгласно Наредбата (т.1)', 'Покрити рискове т.1', true,  20),
  ('occupational_accident', 'allianz',  'oa_cover_permanent_disability','Трайно намалена работоспособност — % от з.с. (т.2)',     'Покрити рискове т.2', false, 21),
  ('occupational_accident', 'allianz',  'oa_cover_temporary_disability','Временна неработоспособност (т.3)',                      'Покрити рискове т.3', true,  22),
  ('occupational_accident', 'allianz',  'oa_temp_disability_limit',     'Доброволен лимит (500/1000/1500/2000 лв.)',              'Покрити рискове т.3', false, 23),
  ('occupational_accident', 'allianz',  'oa_monthly_wage_fund',         'Месечен фонд работна заплата',                          'Заглавна',            true,  24),
  ('occupational_accident', 'allianz',  'oa_high_salary',               'Има ли МБЗ/1 лице > 27 000 лв? НЕ/ДА',                 'Заглавна',            false, 25),

  ('occupational_accident', 'groupama', 'oa_cover_death',               'Смърт и трайно намалена работоспособност',              'Пакет А/Б',           true,  20),
  ('occupational_accident', 'groupama', 'oa_cover_temporary_disability','Временна неработоспособност',                           'Пакет А/Б',           true,  22),
  ('occupational_accident', 'groupama', 'oa_temp_disability_period',    'над 11 дни / над 21 дни / над 31 дни',                  'Пакет Б',             false, 23),
  ('occupational_accident', 'groupama', 'oa_cover_domestic_accident',   'От битова злополука (избираемо)',                       'Пакет А/Б',           false, 24),
  ('occupational_accident', 'groupama', 'oa_monthly_wage_fund',         'Общ фонд работна заплата',                              'Пакет А',             true,  25),
  ('occupational_accident', 'groupama', 'oa_si_per_person',             'Застрахователна сума на едно лице',                     'Пакет А/Б',           false, 26),
  ('occupational_accident', 'groupama', 'oa_si_basis',                  'База: Общ фонд р.з. / Една МБЗ',                       'Пакет А',             false, 27),

-- ─── Секция 4: Допълнителни покрития (само Групама) ──────────────────────────
  ('occupational_accident', 'groupama', 'oa_opt_medical_expenses',  'Медицински разходи',                  'Допълнителни покрития', false, 30),
  ('occupational_accident', 'groupama', 'oa_opt_fractures',         'Фрактури',                            'Допълнителни покрития', false, 31),
  ('occupational_accident', 'groupama', 'oa_opt_burns',             'Изгаряния',                           'Допълнителни покрития', false, 32),
  ('occupational_accident', 'groupama', 'oa_opt_medical_transport', 'Медицинско транспортиране',           'Допълнителни покрития', false, 33),
  ('occupational_accident', 'groupama', 'oa_opt_surgery',           'Оперативно лечение',                  'Допълнителни покрития', false, 34),
  ('occupational_accident', 'groupama', 'oa_opt_dental',            'Спешна стоматологична помощ',         'Допълнителни покрития', false, 35),
  ('occupational_accident', 'groupama', 'oa_opt_hospitalization',   'Хоспитализация',                      'Допълнителни покрития', false, 36),
  ('occupational_accident', 'groupama', 'oa_opt_recovery',          'Възстановяване след хоспитализация',  'Допълнителни покрития', false, 37),
  ('occupational_accident', 'groupama', 'oa_opt_si_per_person',     'З.С. за допълнителни покрития (на лице)', 'Допълнителни покрития', false, 38),

-- ─── Секция 5: Оценка на риска (само Алианц) ─────────────────────────────────
  ('occupational_accident', 'allianz', 'oa_major_accidents_10y',       'Големи аварии (10 год.)? НЕ/ДА',                           'Информация т.3', true,  40),
  ('occupational_accident', 'allianz', 'oa_accidents_details',          'Описание на авариите',                                      'Информация т.3', false, 41),
  ('occupational_accident', 'allianz', 'oa_registered_accidents_3y',   'Регистрирани трудови злополуки (3 год.)? НЕ/ДА',           'Информация т.4', true,  42),
  ('occupational_accident', 'allianz', 'oa_accidents_death_count',      'Довели до смърт ___ бр.',                                   'Информация т.4', false, 43),
  ('occupational_accident', 'allianz', 'oa_accidents_disability_count', 'Довели до инвалидност ___ бр.',                             'Информация т.4', false, 44),
  ('occupational_accident', 'allianz', 'oa_accidents_temp_count',       'Временна нетрудоспособност ___ бр.',                        'Информация т.4', false, 45),
  ('occupational_accident', 'allianz', 'oa_safety_prescriptions',       'Правени ли са предписания от контролни органи? НЕ/ДА',     'Информация т.5', true,  46),
  ('occupational_accident', 'allianz', 'oa_safety_details',             'Срокове и степен на изпълнение',                            'Информация т.5', false, 47),
  ('occupational_accident', 'allianz', 'oa_shift_work',                 'Работа на смени? НЕ/ДА',                                   'Информация т.6', false, 48),
  ('occupational_accident', 'allianz', 'oa_shifts_count',               'Брой работни смени',                                        'Информация т.6', false, 49),
  ('occupational_accident', 'allianz', 'oa_max_concentration',          'Максимален брой работници на едно място',                   'Информация т.7', false, 50);
