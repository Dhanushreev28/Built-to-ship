# 🎙️ BolVaani (VocalBridge) — Voice-First Assistive Portal for Low-Literacy Users

> **Universal Spoken Access to Public Services, Government Welfare Schemes & Job Applications**  
> *Zero Reading Requirement • Zero Typing Requirement • Spoken Turn-Taking AI*

---

## 🌟 Overview

**BolVaani** is a voice-first, low-literacy assistive web platform engineered to empower citizens who cannot read or write fluently to independently complete official applications—including farmer crop subsidies, rural pensions, housing grants, and blue-collar job listings—purely through natural spoken dialogue.

The application listens to unstructured, dialect-infused speech, uses **Gemini 2.5 Flash** (via the official `@google/genai` SDK) to parse and extract structured form entities, patiently guides the applicant **one question at a time**, and reads back every question, confirmation, and final summary aloud via clear speech synthesis.

---

## ✨ Key Architectural Features

1. **Zero-Reading & Zero-Typing Workflow**:
   - Every screen, field, question, and summary can be spoken aloud.
   - Large pictographic visual cues (🌾 for Farming, 🏠 for Housing, 🪪 for ID, 🚗 for Driving, 👷 for Construction).
   - High-contrast color scheme (WCAG AAA compliant) with oversized touch targets (minimum 64px, microphone 96px+).

2. **Multimodal Voice Pipeline (`@google/genai`)**:
   - High-speed multimodal audio ingestion with `gemini-2.5-flash`.
   - Dual-mode processing: real-time streaming audio analysis and contextual JSON extraction.
   - Heavy disfluency tolerance (filters hesitation words, self-corrections, background chatter).

3. **Step-by-Step Conversational Progression**:
   - Asks one question at a time to prevent cognitive overload.
   - Confirms captured values aloud immediately before advancing.
   - Pictographic milestone progress bar shows where the user is in the process.

4. **Spoken Form Review & Voice Signature**:
   - The AI reads back the entire form item-by-item with synchronized UI highlighting.
   - Users seal their application with a spoken voice signature ("Yes, submit my form").

5. **Spoken Receipt & Verifiable PDF**:
   - Issues an easy-to-remember 4-digit spoken reference number (e.g. `4 2 9 5`).
   - Automatically generates an official application PDF with an embedded verification QR code and audit timestamps.

6. **Supervisor & Admin Console**:
   - Inspect all submissions, view transcriptions, download PDFs, and browse active scheme schemas.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Web Audio API (`AnalyserNode`), Canvas Confetti |
| **Backend** | Node.js (v20+), Express.js, Multer, Helmet, CORS, Express Rate Limit |
| **AI Intelligence** | Google Gemini (`@google/genai` SDK, `gemini-2.5-flash`), Web Speech API / TTS |
| **Database & Auth**| Supabase (PostgreSQL 15+, RLS Policies) + Pre-seeded in-memory fallback store |
| **Validation** | Zod (v3) schemas for request/response validation |
| **PDF Generation** | PDFKit & QRCode |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **npm** (v10+)

### 2. Installation
From the root workspace directory, install dependencies for all packages:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

#### Backend `.env` (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Google Gemini API Key (from Google AI Studio: https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - active pre-seeded memory store works out-of-the-box!)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW_MS=60000
```

#### Frontend `.env` (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 4. Running the Application Locally
Run both client and backend concurrently with one command from the project root:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Admin Console**: [http://localhost:5173/admin/templates](http://localhost:5173/admin/templates)

---

## 🗄️ Database Setup (Supabase)

To link a live Supabase PostgreSQL database:
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor**.
3. Run the complete migration script located at:
   [`supabase/migrations/20260925_init_schema.sql`](./supabase/migrations/20260925_init_schema.sql)
4. Populate initial categories and form templates by executing:
   [`supabase/seeds/seed_templates.sql`](./supabase/seeds/seed_templates.sql)
5. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`.

---

## 📋 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and Gemini engine state |
| `GET` | `/api/categories` | Retrieve all service categories with spoken intros |
| `GET` | `/api/templates` | Retrieve available scheme templates |
| `GET` | `/api/templates/:id` | Retrieve single template with ordered fields |
| `POST` | `/api/submissions/start` | Start an application session |
| `POST` | `/api/voice/process-turn` | Upload spoken audio chunk for active question |
| `POST` | `/api/voice/text-turn` | Text turn input for testing or assisted typing |
| `POST` | `/api/submissions/:id/confirm-field` | Explicitly confirm/override a single field |
| `GET` | `/api/submissions/:id/review` | Retrieve AI-generated itemized spoken review script |
| `POST` | `/api/submissions/:id/sign-and-submit` | Seal application with voice signature & issue 4-digit code |
| `GET` | `/api/submissions/:id/pdf` | Generate and download official PDF application |
| `GET` | `/api/submissions` | List all recorded applications (Admin view) |

---

## ♿ Accessibility (WCAG AAA) Highlights

- **Visual Contrast**: Dark Slate text (`#0f172a`) against crisp White and high-contrast Emerald/Amber accents.
- **Microphone States**: Clear visual indicators for Idle, Listening, Processing, and Speaking.
- **Oversized Controls**: Every button and clickable element exceeds 64x64px.
- **Audio Redundancy**: Visual icons and captions accompany every audio prompt, and all visual cards have dedicated speaker buttons.
