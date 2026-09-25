-- =============================================================================
-- BOLVAANI / VOCALBRIDGE - SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Database Migration for Voice-First Low-Literacy Form Filling Application
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
DO $$ BEGIN
    CREATE TYPE submission_status_enum AS ENUM (
        'draft',
        'in_progress',
        'needs_clarification',
        'review_ready',
        'submitted',
        'approved',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category_type_enum AS ENUM (
        'agriculture',
        'employment',
        'civic_welfare',
        'healthcare'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (Supports Supabase Auth & Guest Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE,
    full_name TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en-US',
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Service Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    spoken_summary TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    bg_gradient VARCHAR(100) DEFAULT 'from-blue-600 to-indigo-800',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Application Templates (Forms)
CREATE TABLE IF NOT EXISTS public.application_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    spoken_intro TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    color_theme VARCHAR(50) DEFAULT 'emerald',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Template Fields (Dynamic fields for forms)
CREATE TABLE IF NOT EXISTS public.template_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.application_templates(id) ON DELETE CASCADE,
    field_key VARCHAR(50) NOT NULL,
    label TEXT NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    field_type VARCHAR(30) NOT NULL DEFAULT 'text', -- 'text', 'number', 'phone', 'date', 'select'
    voice_prompt TEXT NOT NULL,
    voice_clarification TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    step_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(template_id, field_key)
);

-- 5. Form Submissions
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.application_templates(id) ON DELETE RESTRICT,
    status submission_status_enum NOT NULL DEFAULT 'draft',
    current_field_id UUID REFERENCES public.template_fields(id),
    receipt_code VARCHAR(10) UNIQUE,
    voice_signature_url TEXT,
    voice_signature_timestamp TIMESTAMPTZ,
    generated_pdf_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Form Submission Field Values
CREATE TABLE IF NOT EXISTS public.submission_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.template_fields(id) ON DELETE RESTRICT,
    raw_audio_url TEXT,
    transcription TEXT,
    extracted_value TEXT NOT NULL,
    confidence_score NUMERIC(4,3) DEFAULT 1.000,
    is_confirmed_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, field_id)
);

-- 7. Voice Interaction Logs (Conversational Audit Trail)
CREATE TABLE IF NOT EXISTS public.voice_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.form_submissions(id) ON DELETE CASCADE,
    turn_number INT NOT NULL,
    user_audio_url TEXT,
    user_transcript TEXT,
    ai_response_text TEXT NOT NULL,
    ai_audio_url TEXT,
    intent_detected VARCHAR(100),
    latency_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.application_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_fields_template ON public.template_fields(template_id, step_order);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.form_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_values_sub ON public.submission_field_values(submission_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_sub ON public.voice_logs(submission_id, turn_number);

-- RLS Enforcement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert/update their own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Public Read Policies
DO $$ BEGIN
    CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    TO authenticated, anon
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view active templates"
    ON public.application_templates FOR SELECT
    TO authenticated, anon
    USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Anyone can view template fields"
    ON public.template_fields FOR SELECT
    TO authenticated, anon
    USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Owner Submissions Policies
DO $$ BEGIN
    CREATE POLICY "Users can view their own submissions"
    ON public.form_submissions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own submissions"
    ON public.form_submissions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own submissions"
    ON public.form_submissions FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
