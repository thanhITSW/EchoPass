# EchoPass

**Capture your passion today. Meet your future self tomorrow.**

> Submission for **Build Something Inspired by Passion** — a weekend challenge about the fire that drives us.

---

## The Idea

Passion fades. Goals get buried. The excitement you feel today — starting a side project, chasing a promotion, learning a new craft — quietly disappears under daily life.

**EchoPass** is a passion time capsule. You capture a moment of drive through text, voice, or images. AI transforms it into a personalized capsule: a summary, emotional fingerprint, future letter, and spoken message from your future self. When you reopen it months later, AI compares who you were with who you've become.

It's not a todo app. It's a letter across time — from the you who still believed, to the you who needs to remember why you started.

---

## Challenge Fit: Passion

| Theme                               | How EchoPass addresses it                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| **Passion as fuel**                 | Users seal their goals, dreams, and raw emotion at peak motivation                      |
| **Obsession & devotion**            | Voice recordings, images, and long-form goals preserve the _feeling_, not just the task |
| **Late-night side projects**        | Built for personal pursuits — coding, music, sport, art, startups                       |
| **The rivalry with your past self** | Future reflection compares original ambition vs. where you are now                      |

---

## Prize Categories

### Best use of Google AI

Gemini powers the emotional core of every capsule:

- **Goal analysis** — structured JSON with summary, emotion, keywords, future letter, obstacles, and advice
- **Future reflection** — compares original goals with later reflections; returns growth, achievements, missed goals, and encouragement
- **Model:** `gemini-2.5-flash-lite` (with automatic fallback across Gemini models)

```
User goal → Gemini → { summary, emotion, futureLetter, advice, obstacles }
Later reflection → Gemini → { growth, achievements, missedGoals, suggestions, encouragement }
```

### Best use of ElevenLabs

The future letter isn't just text — it's **heard**:

- Gemini writes a warm, personal letter from future-you
- ElevenLabs TTS converts it to natural speech (MP3)
- Stored and played back when the capsule unlocks

This makes reopening a capsule a visceral moment: you don't just read what you wanted — you _hear_ it.

---

## Features

- **Auth** — email/password register & login (Supabase)
- **Create Capsule** — title, passion category, goal, optional image & voice recording (up to 60s), scheduled open date
- **AI Processing** — Gemini analyzes the goal; ElevenLabs generates voice
- **Locked Preview** — before open date: see summary, emotion, keywords; future letter & voice stay sealed
- **Future Reflection** — after open date: submit reflections; AI compares journey over time (multiple reflections supported)
- **Dashboard** — all capsules with status, emotion badges, and countdown

---

## User Flow

```mermaid
flowchart LR
    A[Landing] --> B[Register / Login]
    B --> C[Dashboard]
    C --> D[Create Capsule]
    D --> E[AI Processing]
    E --> F[Locked Preview]
    F --> G{Open date reached?}
    G -->|No| F
    G -->|Yes| H[Read letter + play voice]
    H --> I[Submit reflection]
    I --> J[Gemini compares journey]
```

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Browser"]
        UI[Next.js Pages<br/>Landing · Dashboard · Capsule]
    end

    subgraph Vercel["Vercel — Next.js 15 App Router"]
        MW[Middleware<br/>auth guard]
        API[API Routes]
        LIB[lib/<br/>gemini · elevenlabs · storage · prisma]
    end

    subgraph Supabase["Supabase"]
        AUTH[Auth<br/>email / password]
        DB[(PostgreSQL)]
        STOR[Storage<br/>capsule-media]
    end

    subgraph External["External APIs"]
        GEMINI[Google Gemini<br/>goal analysis + reflection]
        ELEVEN[ElevenLabs<br/>text-to-speech]
    end

    UI --> MW
    MW --> API
    API --> LIB
    LIB --> AUTH
    LIB --> DB
    LIB --> STOR
    LIB --> GEMINI
    LIB --> ELEVEN
    ELEVEN -->|MP3| STOR
```

| Layer          | Responsibility                                                          |
| -------------- | ----------------------------------------------------------------------- |
| **Client**     | React UI, voice recorder, audio player, locked/unlocked capsule views   |
| **Middleware** | Protects `/dashboard` and `/capsule/*`; redirects unauthenticated users |
| **API Routes** | Auth, capsule CRUD, AI analyze, voice generate, reflection              |
| **Supabase**   | Identity, relational data (via Prisma), media files                     |
| **Gemini**     | Structured JSON analysis + future letter + reflection comparison        |
| **ElevenLabs** | Converts future letter to spoken MP3                                    |

---

## AI Pipeline

Capsule creation triggers a two-step AI pipeline:

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js API
    participant G as Google Gemini
    participant E as ElevenLabs
    participant S as Supabase Storage
    participant DB as PostgreSQL

    U->>App: Submit goal + media
    App->>DB: Create Capsule (PROCESSING)
    App->>G: analyzeGoal(goal, category)
    G-->>App: summary, emotion, keywords, futureLetter, advice, obstacles
    App->>DB: Save AIAnalysis
    App->>E: generateSpeech(futureLetter)
    E-->>App: MP3 audio buffer
    App->>S: Upload future-letter.mp3
    App->>DB: Update audioUrl, status → READY
    App-->>U: Redirect to capsule detail
```

**Reflection flow** (after open date):

```mermaid
sequenceDiagram
    participant U as User
    participant App as Next.js API
    participant G as Google Gemini
    participant DB as PostgreSQL

    U->>App: Submit reflection text
    App->>DB: Load original goal + prior reflections
    App->>G: analyzeReflection(goal, reflections)
    G-->>App: growth, achievements, missedGoals, suggestions, encouragement
    App->>DB: Save Reflection + analysis JSON
    App-->>U: Return comparison result
```

---

## Data Model

```mermaid
erDiagram
    User ||--o{ Capsule : owns
    Capsule ||--o| AIAnalysis : has
    Capsule ||--o{ Reflection : has

    User {
        string id PK
        string email UK
        string name
        string avatar
        datetime createdAt
    }

    Capsule {
        string id PK
        string userId FK
        string title
        string category
        string goal
        string imageUrl
        string voiceUrl
        enum status
        datetime openDate
        datetime createdAt
    }

    AIAnalysis {
        string id PK
        string capsuleId FK
        string summary
        string emotion
        string[] keywords
        string futureLetter
        string advice
        string[] obstacles
        string audioUrl
    }

    Reflection {
        string id PK
        string capsuleId FK
        string reflection
        json analysis
        datetime createdAt
    }
```

### Capsule lifecycle

```mermaid
stateDiagram-v2
    [*] --> PROCESSING: User creates capsule
    PROCESSING --> READY: Gemini + ElevenLabs complete
    READY --> READY: Locked preview (before openDate)
    READY --> OPENED: openDate reached
    OPENED --> OPENED: User submits reflections
```

| Status       | What the user sees                                        |
| ------------ | --------------------------------------------------------- |
| `PROCESSING` | Processing animation while AI runs                        |
| `READY`      | Summary, emotion, keywords visible; letter & voice sealed |
| `OPENED`     | Full future letter, audio player, reflection form         |

---

## Tech Stack

| Layer     | Technology                                  |
| --------- | ------------------------------------------- |
| Framework | Next.js 15 (App Router), TypeScript         |
| UI        | Tailwind CSS, shadcn/ui, Framer Motion      |
| Database  | Supabase PostgreSQL + Prisma                |
| Auth      | Supabase Auth (email/password)              |
| Storage   | Supabase Storage (`capsule-media`)          |
| AI        | Google Gemini API (`@google/generative-ai`) |
| Voice     | ElevenLabs Text-to-Speech API               |
| Deploy    | Vercel                                      |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/thanhITSW/EchoPass.git
cd EchoPass
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable                        | Source                                                   |
| ------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL` / `DIRECT_URL`   | Supabase → Connect → ORM → Prisma                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API (anon key)                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Settings → API (service_role)                 |
| `GEMINI_API_KEY`                | [Google AI Studio](https://aistudio.google.com/apikey)   |
| `GEMINI_MODEL`                  | `gemini-2.5-flash-lite` (recommended for free tier)      |
| `ELEVENLABS_API_KEY`            | [ElevenLabs](https://elevenlabs.io) → Profile → API Keys |
| `ELEVENLABS_VOICE_ID`           | ElevenLabs → Voices → copy Voice ID                      |

### 3. Supabase setup

- **Authentication → Providers → Email** — enable; disable "Confirm email" for local dev
- **Storage** — create public bucket `capsule-media`

### 4. Database & run

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                    # Landing
  login/ | register/          # Auth pages
  dashboard/                  # Capsule grid
  capsule/new/                # Create form
  capsule/[id]/               # Detail (locked/unlocked)
  capsule/[id]/processing/    # AI pipeline
  api/
    auth/                     # Register & login
    capsule/                  # CRUD
    ai/analyze/               # Gemini analysis
    voice/generate/           # ElevenLabs TTS
    reflection/               # Future reflection
components/
  capsule/   dashboard/   auth/   player/   ui/
lib/
  gemini.ts   elevenlabs.ts   prisma.ts   auth.ts   storage.ts
prisma/
  schema.prisma
```

---

## Scripts

| Command              | Description                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start dev server                    |
| `npm run dev:clean`  | Clear `.next` cache and start fresh |
| `npm run build`      | Production build                    |
| `npm run db:migrate` | Apply database migrations           |

---

## Author

Built with passion for the **Build Something Inspired by Passion** weekend challenge.

**EchoPass** — because the fire that drives you today deserves to reach you tomorrow.