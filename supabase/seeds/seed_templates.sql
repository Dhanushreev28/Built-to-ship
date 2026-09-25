-- =============================================================================
-- BOLVAANI / VOCALBRIDGE - SEED DATA SCRIPT
-- Categories, Application Templates, and Ordered Spoken Fields
-- =============================================================================

-- Categories
INSERT INTO public.categories (id, slug, title, description, spoken_summary, icon_name, bg_gradient, display_order)
VALUES 
(
    'c1111111-1111-1111-1111-111111111111',
    'agriculture',
    'Farming & Crop Welfare',
    'Grants for seeds, fertilizer, tractors, and solar pumps.',
    'Farming and Crop Welfare. Tap here to apply for fertilizer subsidy, seeds money, or solar pump support.',
    'Wheat',
    'from-emerald-600 to-green-800',
    1
),
(
    'c2222222-2222-2222-2222-222222222222',
    'employment',
    'Jobs & Daily Wage Work',
    'Apply for driver, security, construction, and delivery jobs.',
    'Jobs and Daily Wage Work. Tap here to apply for driver, security guard, helper, or construction jobs without any typing.',
    'Briefcase',
    'from-blue-600 to-indigo-800',
    2
),
(
    'c3333333-3333-3333-3333-333333333333',
    'civic_welfare',
    'Government Welfare & Housing',
    'Pensions, housing grants, and ration assistance.',
    'Government Welfare and Housing. Tap here for old age pension, mud house grant, or family ration cards.',
    'Home',
    'from-amber-600 to-orange-800',
    3
),
(
    'c4444444-4444-4444-4444-444444444444',
    'healthcare',
    'Health Clinic & Disability',
    'Free hospital cards, doctor clinic passes, and disability aid.',
    'Health Clinic and Disability. Tap here to register for free doctor clinic passes or disability support.',
    'HeartPulse',
    'from-rose-600 to-red-800',
    4
)
ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    spoken_summary = EXCLUDED.spoken_summary,
    icon_name = EXCLUDED.icon_name;

-- Templates
-- 1. Farmer Crop & Fertilizer Subsidy
INSERT INTO public.application_templates (id, category_id, template_key, title, description, spoken_intro, icon_name, color_theme, is_active)
VALUES (
    't1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'farmer_crop_subsidy',
    'Farmer Crop & Fertilizer Assistance',
    'Direct seasonal grant for crop seeds and fertilizer purchase.',
    'Welcome! Let us fill out your Farmer Crop and Fertilizer Assistance grant. I will ask you four simple questions. Please speak naturally.',
    'Sprout',
    'emerald',
    true
)
ON CONFLICT (template_key) DO UPDATE SET title = EXCLUDED.title, spoken_intro = EXCLUDED.spoken_intro;

-- Fields for Farmer Crop Subsidy
INSERT INTO public.template_fields (template_id, field_key, label, icon_name, field_type, voice_prompt, voice_clarification, is_required, step_order)
VALUES 
(
    't1111111-1111-1111-1111-111111111111',
    'applicant_name',
    'Your Full Name',
    'User',
    'text',
    'What is your full name?',
    'Please state your first name and family name clearly.',
    true,
    1
),
(
    't1111111-1111-1111-1111-111111111111',
    'village_or_district',
    'Village or Town Name',
    'MapPin',
    'text',
    'Which village, town, or district do you live in?',
    'You can tell me the name of your village or nearest town.',
    true,
    2
),
(
    't1111111-1111-1111-1111-111111111111',
    'land_area_acres',
    'Total Farm Land (Acres)',
    'Maximize2',
    'number',
    'How much farm land do you cultivate? You can say the number in acres or bighas.',
    'For example, you can say two acres, or three and a half acres.',
    true,
    3
),
(
    't1111111-1111-1111-1111-111111111111',
    'primary_crop',
    'Main Crop Sown This Season',
    'Wheat',
    'text',
    'What main crop are you planting this season? For example, wheat, rice, cotton, or vegetables.',
    'Tell me what crop you need fertilizer or seeds for.',
    true,
    4
)
ON CONFLICT (template_id, field_key) DO NOTHING;

-- 2. Driver & Vehicle Job Application
INSERT INTO public.application_templates (id, category_id, template_key, title, description, spoken_intro, icon_name, color_theme, is_active)
VALUES (
    't2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'driver_job_application',
    'Driver & Transport Job Application',
    'Apply for private car, taxi, auto-rickshaw, or delivery truck driver positions.',
    'Hello! Let us prepare your Driver Job application. I will ask you four simple questions about your driving experience.',
    'Car',
    'blue',
    true
)
ON CONFLICT (template_key) DO UPDATE SET title = EXCLUDED.title, spoken_intro = EXCLUDED.spoken_intro;

-- Fields for Driver Job
INSERT INTO public.template_fields (template_id, field_key, label, icon_name, field_type, voice_prompt, voice_clarification, is_required, step_order)
VALUES 
(
    't2222222-2222-2222-2222-222222222222',
    'applicant_name',
    'Driver Full Name',
    'User',
    'text',
    'What is your full name?',
    'Please speak your name clearly.',
    true,
    1
),
(
    't2222222-2222-2222-2222-222222222222',
    'license_type',
    'Driving License Type',
    'CreditCard',
    'text',
    'What type of driving license do you have? For example, Light Vehicle, Heavy Transport, or Two-Wheeler.',
    'Tell me if you drive cars, trucks, or motorcycles.',
    true,
    2
),
(
    't2222222-2222-2222-2222-222222222222',
    'years_experience',
    'Years of Driving Experience',
    'Clock',
    'number',
    'How many years of driving experience do you have?',
    'For example, you can say three years or five years.',
    true,
    3
),
(
    't2222222-2222-2222-2222-222222222222',
    'preferred_city',
    'Preferred Working City',
    'Navigation',
    'text',
    'In which city or town do you want to work?',
    'Tell me the city or location you want your driving job in.',
    true,
    4
)
ON CONFLICT (template_id, field_key) DO NOTHING;

-- 3. Senior Citizen Old Age Pension
INSERT INTO public.application_templates (id, category_id, template_key, title, description, spoken_intro, icon_name, color_theme, is_active)
VALUES (
    't3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'senior_citizen_pension',
    'Senior Citizen Monthly Pension',
    'Monthly welfare pension support for elders aged 60 and above.',
    'Welcome respected elder. Let us register your Senior Pension application. Speak comfortably, I am listening.',
    'HeartHandshake',
    'amber',
    true
)
ON CONFLICT (template_key) DO UPDATE SET title = EXCLUDED.title, spoken_intro = EXCLUDED.spoken_intro;

-- Fields for Senior Pension
INSERT INTO public.template_fields (template_id, field_key, label, icon_name, field_type, voice_prompt, voice_clarification, is_required, step_order)
VALUES 
(
    't3333333-3333-3333-3333-333333333333',
    'applicant_name',
    'Applicant Name',
    'User',
    'text',
    'What is your name, please?',
    'State your full name slowly.',
    true,
    1
),
(
    't3333333-3333-3333-3333-333333333333',
    'age',
    'Current Age (Years)',
    'Calendar',
    'number',
    'How old are you today?',
    'Tell me your age in years, for example sixty-two or sixty-five.',
    true,
    2
),
(
    't3333333-3333-3333-3333-333333333333',
    'nominee_name',
    'Nominee or Family Caregiver Name',
    'Users',
    'text',
    'Who is your family nominee or caregiver? For example, your son, daughter, or spouse name.',
    'Tell me who looks after you in your family.',
    true,
    3
),
(
    't3333333-3333-3333-3333-333333333333',
    'mobile_number',
    'Contact Mobile Number',
    'Phone',
    'phone',
    'What is your 10-digit mobile phone number?',
    'Speak the phone numbers one by one.',
    true,
    4
)
ON CONFLICT (template_id, field_key) DO NOTHING;
