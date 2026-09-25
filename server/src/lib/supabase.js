import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();

let supabaseClient = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log('✅ Supabase connected with Service Role.');
  } catch (err) {
    console.warn('⚠️ Supabase connection error:', err.message);
  }
} else {
  console.log('ℹ️ SUPABASE_URL not configured. Using active in-memory/embedded database store.');
}

// ============================================================================
// EMBEDDED IN-MEMORY STORE (Pre-seeded with real categories & templates)
// ============================================================================
export const memoryStore = {
  categories: [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      slug: 'agriculture',
      title: 'Farming & Crop Welfare',
      description: 'Grants for seeds, fertilizer, tractors, and solar pumps.',
      spoken_summary: 'Farming and Crop Welfare. Tap here to apply for fertilizer subsidy, seeds money, or solar pump support.',
      icon_name: 'Wheat',
      bg_gradient: 'from-emerald-600 to-green-800',
      display_order: 1
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      slug: 'employment',
      title: 'Jobs & Daily Wage Work',
      description: 'Apply for driver, security, construction, and delivery jobs.',
      spoken_summary: 'Jobs and Daily Wage Work. Tap here to apply for driver, security guard, helper, or construction jobs without any typing.',
      icon_name: 'Briefcase',
      bg_gradient: 'from-blue-600 to-indigo-800',
      display_order: 2
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      slug: 'civic_welfare',
      title: 'Government Welfare & Housing',
      description: 'Pensions, housing grants, and ration assistance.',
      spoken_summary: 'Government Welfare and Housing. Tap here for old age pension, mud house grant, or family ration cards.',
      icon_name: 'Home',
      bg_gradient: 'from-amber-600 to-orange-800',
      display_order: 3
    },
    {
      id: 'c4444444-4444-4444-4444-444444444444',
      slug: 'healthcare',
      title: 'Health Clinic & Disability',
      description: 'Free hospital cards, doctor clinic passes, and disability aid.',
      spoken_summary: 'Health Clinic and Disability. Tap here to register for free doctor clinic passes or disability support.',
      icon_name: 'HeartPulse',
      bg_gradient: 'from-rose-600 to-red-800',
      display_order: 4
    }
  ],
  templates: [
    {
      id: 't1111111-1111-1111-1111-111111111111',
      category_id: 'c1111111-1111-1111-1111-111111111111',
      template_key: 'farmer_crop_subsidy',
      title: 'Farmer Crop & Fertilizer Assistance',
      description: 'Direct seasonal grant for crop seeds and fertilizer purchase.',
      spoken_intro: 'Welcome! Let us fill out your Farmer Crop and Fertilizer Assistance grant. I will ask you four simple questions. Please speak naturally.',
      icon_name: 'Sprout',
      color_theme: 'emerald',
      is_active: true,
      fields: [
        {
          id: 'f1111111-1111-1111-1111-111111111111',
          field_key: 'applicant_name',
          label: 'Your Full Name',
          icon_name: 'User',
          field_type: 'text',
          voice_prompt: 'What is your full name?',
          voice_clarification: 'Please state your first name and family name clearly.',
          is_required: true,
          step_order: 1
        },
        {
          id: 'f1111111-1111-1111-1111-111111111112',
          field_key: 'village_or_district',
          label: 'Village or Town Name',
          icon_name: 'MapPin',
          field_type: 'text',
          voice_prompt: 'Which village, town, or district do you live in?',
          voice_clarification: 'You can tell me the name of your village or nearest town.',
          is_required: true,
          step_order: 2
        },
        {
          id: 'f1111111-1111-1111-1111-111111111113',
          field_key: 'land_area_acres',
          label: 'Total Farm Land (Acres)',
          icon_name: 'Maximize2',
          field_type: 'number',
          voice_prompt: 'How much farm land do you cultivate? You can say the number in acres or bighas.',
          voice_clarification: 'For example, you can say two acres, or three and a half acres.',
          is_required: true,
          step_order: 3
        },
        {
          id: 'f1111111-1111-1111-1111-111111111114',
          field_key: 'primary_crop',
          label: 'Main Crop Sown This Season',
          icon_name: 'Wheat',
          field_type: 'text',
          voice_prompt: 'What main crop are you planting this season? For example, wheat, rice, cotton, or vegetables.',
          voice_clarification: 'Tell me what crop you need fertilizer or seeds for.',
          is_required: true,
          step_order: 4
        }
      ]
    },
    {
      id: 't2222222-2222-2222-2222-222222222222',
      category_id: 'c2222222-2222-2222-2222-222222222222',
      template_key: 'driver_job_application',
      title: 'Driver & Transport Job Application',
      description: 'Apply for private car, taxi, auto-rickshaw, or delivery truck driver positions.',
      spoken_intro: 'Hello! Let us prepare your Driver Job application. I will ask you four simple questions about your driving experience.',
      icon_name: 'Car',
      color_theme: 'blue',
      is_active: true,
      fields: [
        {
          id: 'f2222222-2222-2222-2222-222222222221',
          field_key: 'applicant_name',
          label: 'Driver Full Name',
          icon_name: 'User',
          field_type: 'text',
          voice_prompt: 'What is your full name?',
          voice_clarification: 'Please speak your name clearly.',
          is_required: true,
          step_order: 1
        },
        {
          id: 'f2222222-2222-2222-2222-222222222222',
          field_key: 'license_type',
          label: 'Driving License Type',
          icon_name: 'CreditCard',
          field_type: 'text',
          voice_prompt: 'What type of driving license do you have? For example, Light Vehicle, Heavy Transport, or Two-Wheeler.',
          voice_clarification: 'Tell me if you drive cars, trucks, or motorcycles.',
          is_required: true,
          step_order: 2
        },
        {
          id: 'f2222222-2222-2222-2222-222222222223',
          field_key: 'years_experience',
          label: 'Years of Driving Experience',
          icon_name: 'Clock',
          field_type: 'number',
          voice_prompt: 'How many years of driving experience do you have?',
          voice_clarification: 'For example, you can say three years or five years.',
          is_required: true,
          step_order: 3
        },
        {
          id: 'f2222222-2222-2222-2222-222222222224',
          field_key: 'preferred_city',
          label: 'Preferred Working City',
          icon_name: 'Navigation',
          field_type: 'text',
          voice_prompt: 'In which city or town do you want to work?',
          voice_clarification: 'Tell me the city or location you want your driving job in.',
          is_required: true,
          step_order: 4
        }
      ]
    },
    {
      id: 't3333333-3333-3333-3333-333333333333',
      category_id: 'c3333333-3333-3333-3333-333333333333',
      template_key: 'senior_citizen_pension',
      title: 'Senior Citizen Monthly Pension',
      description: 'Monthly welfare pension support for elders aged 60 and above.',
      spoken_intro: 'Welcome respected elder. Let us register your Senior Pension application. Speak comfortably, I am listening.',
      icon_name: 'HeartHandshake',
      color_theme: 'amber',
      is_active: true,
      fields: [
        {
          id: 'f3333333-3333-3333-3333-333333333331',
          field_key: 'applicant_name',
          label: 'Applicant Full Name',
          icon_name: 'User',
          field_type: 'text',
          voice_prompt: 'What is your full name, please?',
          voice_clarification: 'State your name slowly and clearly.',
          is_required: true,
          step_order: 1
        },
        {
          id: 'f3333333-3333-3333-3333-333333333332',
          field_key: 'age',
          label: 'Current Age (Years)',
          icon_name: 'Calendar',
          field_type: 'number',
          voice_prompt: 'How old are you today?',
          voice_clarification: 'Tell me your age in years, for example sixty-two or sixty-five.',
          is_required: true,
          step_order: 2
        },
        {
          id: 'f3333333-3333-3333-3333-333333333333',
          field_key: 'nominee_name',
          label: 'Nominee or Caregiver Name',
          icon_name: 'Users',
          field_type: 'text',
          voice_prompt: 'Who is your family nominee or caregiver? For example, your son, daughter, or spouse name.',
          voice_clarification: 'Tell me who looks after you in your family.',
          is_required: true,
          step_order: 3
        },
        {
          id: 'f3333333-3333-3333-3333-333333333334',
          field_key: 'mobile_number',
          label: 'Contact Mobile Number',
          icon_name: 'Phone',
          field_type: 'phone',
          voice_prompt: 'What is your 10-digit mobile phone number?',
          voice_clarification: 'Speak the phone numbers one by one.',
          is_required: true,
          step_order: 4
        }
      ]
    }
  ],
  submissions: new Map(),
  submissionFieldValues: new Map(),
  voiceLogs: []
};

export const getSupabase = () => supabaseClient;
