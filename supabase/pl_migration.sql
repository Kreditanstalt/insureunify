-- ────────────────────────────────────────────────────────────────────────────
-- InsureUnify — Миграция: Професионална отговорност (professional_liability)
-- Изпълни в Supabase SQL Editor
-- ────────────────────────────────────────────────────────────────────────────

-- 1. Нови застрахователи
INSERT INTO insurers (id, name, short_name, form_title, form_code, color)
VALUES
  ('axiom',   'ЗК Аксиом АД',   'Аксиом',  'Професионална отговорност',         'PL-Application', '#6B21A8'),
  ('euroins', 'ЗД Евроинс АД',  'Евроинс', 'Професионална отговорност кл.08',   'ПО-кл.08',       '#1E40AF')
ON CONFLICT (id) DO NOTHING;

-- 2. Нов клас застраховка
INSERT INTO insurance_classes (id, name, description, is_active)
VALUES (
  'professional_liability',
  'Професионална отговорност',
  'ПО на физически и юридически лица при изпълнение на професионална дейност',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Field mappings — Секция 1: Данни за кандидата
INSERT INTO insurer_mappings
  (insurance_class_id, insurer_id, master_field_id, original_field_name, section_in_original, is_required, sort_order)
VALUES
  ('professional_liability', 'axiom',    'pl_company_name', 'Ime / наименование',                       'I. Данни за ЗАСТРАХОВАЩИЯ',       true,  1),
  ('professional_liability', 'axiom',    'pl_eik',          'ЕИК/ЕГН',                                  'I.3',                             true,  2),
  ('professional_liability', 'axiom',    'pl_address',      'Адрес',                                    'I.2',                             true,  3),
  ('professional_liability', 'axiom',    'pl_phone',        'телефон',                                  'I.2',                             true,  4),
  ('professional_liability', 'axiom',    'pl_email',        'E-mail',                                   'I.2',                             false, 5),
  ('professional_liability', 'axiom',    'pl_activity',     'Предмет на дейност / професия',            'I.3',                             true,  6),

  ('professional_liability', 'bulstrad', 'pl_company_name', 'Застрахован (пълно наименование)',          'Заявление',                       true,  1),
  ('professional_liability', 'bulstrad', 'pl_eik',          'Булстат / ЕГН',                             'Заявление',                       true,  2),
  ('professional_liability', 'bulstrad', 'pl_address',      'Адрес (по съдебна регистрация)',            'Заявление',                       true,  3),
  ('professional_liability', 'bulstrad', 'pl_phone',        'Тел./факс',                                'Заявление',                       true,  4),

  ('professional_liability', 'euroins',  'pl_company_name', 'Ime/Наименование',                         'I. КАНДИДАТ ЗА ЗАСТРАХОВАНЕ',     true,  1),
  ('professional_liability', 'euroins',  'pl_eik',          'ЕГН/ЛНЧ/ЕИК',                             'I',                               true,  2),
  ('professional_liability', 'euroins',  'pl_address',      'Седалище и адрес на управление',           'I',                               true,  3),
  ('professional_liability', 'euroins',  'pl_phone',        'Тел.',                                     'I',                               true,  4),
  ('professional_liability', 'euroins',  'pl_email',        'Email',                                    'I',                               false, 5),

-- 4. Field mappings — Секция 2: Застраховано лице
  ('professional_liability', 'axiom',    'pl_insured_name',          'Ime / наименование (Застрахован)',                      'II.1',   true,  10),
  ('professional_liability', 'axiom',    'pl_insured_eik',           'ЕИК/ЕГН (Застрахован)',                                 'II.3',   false, 11),
  ('professional_liability', 'axiom',    'pl_insured_address',       'Адрес (Застрахован)',                                   'II.2',   false, 12),
  ('professional_liability', 'axiom',    'pl_insured_profession',    'Предмет на дейност / професия (Застрахован)',           'II.3',   true,  13),
  ('professional_liability', 'axiom',    'pl_activity_start_date',   'Начална дата на упражняване на проф. дейност',          'II.5',   false, 14),
  ('professional_liability', 'axiom',    'pl_employees_count',       'Брой осигурени лица по трудово правоотношение',         'II.5',   false, 15),
  ('professional_liability', 'axiom',    'pl_professional_org',      'Член на проф. организация?',                            'II.6',   false, 16),
  ('professional_liability', 'axiom',    'pl_professional_org_name', 'Наименование на проф. организация',                     'II.6',   false, 17),

  ('professional_liability', 'euroins',  'pl_insured_name',          'Ime/Наименование (Застраховано лице)',                  'II.2.1', true,  10),
  ('professional_liability', 'euroins',  'pl_insured_eik',           'ЕГН/ЛНЧ/ЕИК (Застраховано лице)',                      'II.2.1', false, 11),
  ('professional_liability', 'euroins',  'pl_insured_address',       'Седалище и адрес (Застраховано лице)',                  'II.2.1', false, 12),
  ('professional_liability', 'euroins',  'pl_insured_profession',    'Професия/дейност',                                     'II.2.1', true,  13),
  ('professional_liability', 'euroins',  'pl_employees_count',       'Брой лица по трудово правоотношение',                  'II.2.5', false, 15),
  ('professional_liability', 'euroins',  'pl_services_description',  'Описание на предоставяните услуги',                    'II.2.2', false, 17),
  ('professional_liability', 'euroins',  'pl_annual_revenue',        'Годишен оборот',                                       'II.2.4', false, 18),
  ('professional_liability', 'euroins',  'pl_subcontractors',        'Използвате ли подизпълнители?',                        'II.2.6', false, 19),

-- 5. Field mappings — Секция 3: Застрахователна история
  ('professional_liability', 'axiom',    'pl_prev_insurance',        'Имали ли сте до сега сключена застраховка ПО?',         'II.7',   true,  20),
  ('professional_liability', 'axiom',    'pl_claims_paid',           'Изплащано ли е обезщетение по застраховка ПО?',         'II.8',   true,  21),
  ('professional_liability', 'axiom',    'pl_claims_details',        '(ако да) подробности за обезщетенията',                 'II.8',   false, 21),
  ('professional_liability', 'axiom',    'pl_insurance_declined',    'Отказвано ли ви е сключване на застраховка ПО?',        'II.9',   true,  22),
  ('professional_liability', 'axiom',    'pl_valid_other_insurance', 'Имате ли валидна ПО при друга компания?',               'II.10',  false, 23),
  ('professional_liability', 'axiom',    'pl_pending_claims',        'Предявени искове / съдебни дела (3 год.)?',             'II.11',  true,  24),
  ('professional_liability', 'axiom',    'pl_pending_claims_details','(ако да) подробности за искове',                        'II.11',  false, 24),
  ('professional_liability', 'axiom',    'pl_known_circumstances',   'Обстоятелства за бъдещи искове?',                      'II.12',  false, 25),

  ('professional_liability', 'euroins',  'pl_prev_insurance',        'Има ли сключена застраховка ПО?',                      'III.3.1',true,  20),
  ('professional_liability', 'euroins',  'pl_prev_insurer',          'Застраховател (предишна ПО)',                           'III.3.1',false, 20),
  ('professional_liability', 'euroins',  'pl_prev_period',           'Период на предишна застраховка',                        'III.3.1',false, 20),
  ('professional_liability', 'euroins',  'pl_claims_paid',           'Изплащани ли са обезщетения?',                         'III.3.2',true,  21),
  ('professional_liability', 'euroins',  'pl_claims_details',        'Причини и размер на обезщетенията',                    'III.3.2',false, 21),
  ('professional_liability', 'euroins',  'pl_pending_claims',        'Предявени искове към Вас?',                             'III.3.3',true,  24),
  ('professional_liability', 'euroins',  'pl_pending_claims_details','Подробности за исковете',                               'III.3.3',false, 24),
  ('professional_liability', 'euroins',  'pl_insurance_declined',    'Отказвана ли Ви е застраховка ПО?',                    'III.3.4',true,  22),
  ('professional_liability', 'euroins',  'pl_known_circumstances',   'Има ли обстоятелства за бъдещи искове?',               'III.3.5',false, 25),

-- 6. Field mappings — Секция 4: Данни за договора
  ('professional_liability', 'axiom',    'pl_single_limit',    'Единичен лимит на отговорност (за едно събитие)', 'III.12.1', true,  30),
  ('professional_liability', 'axiom',    'pl_aggregate_limit', 'Агрегатен лимит (за всички събития)',             'III.12.2', true,  31),
  ('professional_liability', 'axiom',    'pl_territory',       'Териториална валидност',                          'III.13',   true,  32),
  ('professional_liability', 'axiom',    'pl_deductible',      'Самоучастие',                                     'III.14',   false, 33),
  ('professional_liability', 'axiom',    'pl_period_from',     'Срок от',                                         'III.15',   true,  34),
  ('professional_liability', 'axiom',    'pl_period_to',       'Срок до',                                         'III.15',   true,  35),
  ('professional_liability', 'axiom',    'pl_payment_type',    'Начин на плащане',                                'III.16',   true,  36),

  ('professional_liability', 'bulstrad', 'pl_single_limit',    'Лимит единичен',                                  'Договор',  true,  30),
  ('professional_liability', 'bulstrad', 'pl_aggregate_limit', 'Лимит агрегатен',                                 'Договор',  true,  31),
  ('professional_liability', 'bulstrad', 'pl_territory',       'Територия на валидност',                          'Договор',  true,  32),
  ('professional_liability', 'bulstrad', 'pl_deductible',      'Самоучастие',                                     'Договор',  false, 33),
  ('professional_liability', 'bulstrad', 'pl_period_from',     'Срок от',                                         'Договор',  true,  34),
  ('professional_liability', 'bulstrad', 'pl_period_to',       'Срок до',                                         'Договор',  true,  35),

  ('professional_liability', 'euroins',  'pl_single_limit',       'Лимит за едно събитие',    'IV', true,  30),
  ('professional_liability', 'euroins',  'pl_aggregate_limit',    'Агрегатен лимит',           'IV', true,  31),
  ('professional_liability', 'euroins',  'pl_territory',          'Териториална валидност',    'IV', true,  32),
  ('professional_liability', 'euroins',  'pl_deductible',         'Самоучастие',               'IV', false, 33),
  ('professional_liability', 'euroins',  'pl_period_from',        'Начало',                    'IV', true,  34),
  ('professional_liability', 'euroins',  'pl_period_to',          'Край',                      'IV', true,  35),
  ('professional_liability', 'euroins',  'pl_retroactive_date',   'Ретроактивна дата',         'IV', false, 36),
  ('professional_liability', 'euroins',  'pl_currency',           'Валута',                    'IV', false, 37)

ON CONFLICT (insurer_id, insurance_class_id, master_field_id) DO NOTHING;
