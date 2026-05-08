# 🏥 Med-AI — AI-Powered Medical Consultation Platform
 An intelligent, real-time medical consultation platform where users interact with custom AI medical agents via live video, backed by automated transcription, AI summarization, and post-meeting chat.

---

## 📖 Table of Contents

- [What is Med-AI?](#-what-is-med-ai)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [How to Run the Project](#-how-to-run-the-project)
- [Available Scripts](#-available-scripts)
- [API Routes](#-api-routes)
- [Data Flow](#-data-flow-end-to-end)
- [Troubleshooting](#-troubleshooting)
- [Team](#-team)

---

## 🩺 What is Med-AI?

**Med-AI** is a full-stack, AI-powered medical consultation platform built with Next.js 15. It enables users to:

1. **Create AI Medical Agents** — configure custom AI personas with specific medical instructions (e.g., a cardiologist, general physician, mental health advisor).
2. **Schedule & Conduct Video Consultations** — join a live video call where the AI agent participates as a real-time voice participant, powered by OpenAI's Realtime API bridged through Stream.io.
3. **Auto-Transcription & Recording** — every consultation is automatically transcribed and recorded in 1080p via Stream.io.
4. **AI Summarization** — after the call ends, an Inngest background job fetches the transcript and uses GPT-4o to generate a structured Markdown summary with an overview and timestamped clinical notes.
5. **Post-Meeting Chat** — users can continue chatting with the AI agent via Stream Chat after the consultation, with the agent's responses scoped to the meeting's transcript and summary.
6. **AI Triage Engine** — an intelligent triage system that analyzes symptoms and routes patients to the appropriate specialist.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🎥 **Real-Time Video Calls** | Full-screen HD video consultations with AI agents via Stream Video SDK |
| 🤖 **Custom AI Agents** | Create and configure AI doctor personas with custom instructions |
| 🎙️ **Realtime Voice AI** | AI agent speaks during the call using OpenAI Realtime API |
| 📝 **Auto Transcription** | Stream.io auto-transcribes every consultation in JSONL format |
| 🧠 **AI Summarization** | GPT-4o generates structured clinical summaries post-call |
| 💬 **Post-Meeting Chat** | Context-aware chat with the AI agent after the consultation |
| 📹 **Call Recording** | Consultations are recorded as MP4 and stored via Stream.io |
| 🔐 **Secure Authentication** | OAuth (Google, GitHub) and Email/Password via Better Auth |
| 📊 **Meeting Dashboard** | Full history of past meetings with transcripts and summaries |
| 🚦 **AI Triage System** | Smart symptom triage powered by NLP to route to specialists |
| 🎨 **Modern UI** | Responsive, accessible UI built with shadcn/ui + Tailwind CSS v4 |

---

## 🛠️ Tech Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15 / 16 | Full-stack React framework (App Router, Server Components) |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5 | Type safety across the entire codebase |
| **Bun** | Latest | JavaScript runtime & package manager (preferred) |

### Database & ORM
| Technology | Purpose |
|---|---|
| **Neon PostgreSQL** | Serverless, scalable PostgreSQL database |
| **Drizzle ORM** | Type-safe SQL query builder and schema management |

### Authentication
| Technology | Purpose |
|---|---|
| **Better Auth** | Authentication library with OAuth (Google, GitHub) + Email/Password |

### API Layer
| Technology | Purpose |
|---|---|
| **tRPC v11** | End-to-end type-safe API layer |
| **TanStack Query v5** | Client-side data fetching, caching, and synchronization |

### Real-Time Services
| Technology | Purpose |
|---|---|
| **Stream Video React SDK** | Live HD video calls with recording & transcription |
| **Stream Chat React SDK** | Post-meeting messaging with AI agents |
| **Stream Node SDK** | Server-side Stream API integration (agent injection, webhook handling) |

### AI & Intelligence
| Technology | Purpose |
|---|---|
| **OpenAI Realtime API** | Powers the AI agent's voice during live calls |
| **OpenAI GPT-4o** | Post-call summarization and post-meeting chat responses |
| **Inngest Agent Kit** | Orchestrates multi-step AI pipelines with retries |
| **Inngest** | Event-driven background job processing |

### UI & Styling
| Technology | Purpose |
|---|---|
| **shadcn/ui** | Accessible, composable UI component library |
| **Radix UI** | Unstyled, accessible component primitives |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **Framer Motion** | Animation library for smooth UI transitions |
| **Lucide React** | Icon library |
| **DiceBear** | Auto-generated avatars for agents and users |
| **Recharts** | Data visualization for analytics dashboards |

### Utilities
| Technology | Purpose |
|---|---|
| **Zod v4** | Schema validation for forms and API inputs |
| **nuqs** | Type-safe URL search parameter management |
| **React Hook Form** | Form state management |
| **date-fns** | Date utility functions |
| **nanoid** | Unique ID generation |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Client                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Auth    │  │  Dashboard   │  │   Video Call Room     │  │
│  │ (OAuth/  │  │  (Meetings,  │  │  (Stream Video SDK)   │  │
│  │  Email)  │  │   Agents)    │  │  + OpenAI Voice AI    │  │
│  └────┬─────┘  └──────┬───────┘  └──────────┬────────────┘  │
└───────┼───────────────┼──────────────────────┼──────────────┘
        │               │ tRPC                  │ WebRTC
        ▼               ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server (API Routes)                │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ /api/auth  │  │/api/trpc │  │/api/     │  │/api/     │  │
│  │ BetterAuth │  │  tRPC    │  │ inngest  │  │ webhook  │  │
│  └─────┬──────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└────────┼──────────────┼──────────────┼──────────────┼───────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐   ┌─────────┐   ┌──────────┐
    │  Neon   │    │  Neon   │   │ Inngest │   │ Stream   │
    │  Neon   │    │ Postgres│   │  Cloud  │   │   API    │
    │PostgreSQL│   └─────────┘   └────┬────┘   └──────────┘
    └─────────┘                       │
                              ┌───────▼────────┐
                              │  GPT-4o via    │
                              │  Inngest Agent │
                              │  Kit (Summary) │
                              └────────────────┘
```

### Architectural Patterns

- **Next.js App Router** with route groups for clean separation (`(auth)`, `(dashboard)`, `call/`)
- **Feature-Sliced Module Architecture** — each domain lives in `src/modules/<feature>/` with sub-structure for server procedures, UI, hooks, schemas, and types
- **tRPC as Type-Safe API** — all client-server communication, `protectedProcedure` validates BetterAuth session on every call
- **Event-Driven Background Processing** — post-call AI work is fully async via Inngest events and step functions
- **Webhook-as-Orchestrator** — `/api/webhook` handles the full meeting lifecycle (agent injection → status transitions → transcript handoff)

---

## 🗄️ Database Schema

```
user ──────────────────┐
  │                    │
  ├── session           │  (FK: userId)
  ├── account           │  (FK: userId) [OAuth providers]
  ├── agents  ──────────┼─ (FK: userId)
  │     │               │
  └── meetings ─────────┘  (FK: userId, agentId)
         │
         └── [status]: upcoming → active → processing → completed | cancelled
             [fields]: transcriptUrl, recordingUrl, summary (Markdown)
```

**Core Tables:**
- **`user`** — user profile (name, email, avatar)
- **`session`** — active auth sessions
- **`account`** — linked OAuth providers
- **`agents`** — AI agent configurations (name, instructions, avatar, userId)
- **`meetings`** — consultation records (agentId, userId, status, summary, transcriptUrl, recordingUrl)

---

## 📁 Project Structure

```
med-ai/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Public auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/            # Protected dashboard pages
│   │   │   ├── agents/             # Agent management UI
│   │   │   └── meetings/           # Meeting list & details UI
│   │   ├── call/
│   │   │   └── [meetingId]/        # Full-screen video call page
│   │   └── api/
│   │       ├── auth/               # Better Auth handler
│   │       ├── trpc/               # tRPC API handler
│   │       ├── inngest/            # Inngest function handler & webhook
│   │       └── webhook/            # Stream.io webhook handler
│   │
│   ├── db/
│   │   ├── index.ts                # Drizzle + Neon connection
│   │   └── schema.ts               # Full database schema (Drizzle)
│   │
│   ├── inngest/
│   │   ├── client.ts               # Inngest client initialization
│   │   └── functions.ts            # Background job: meetingsProcessing
│   │
│   ├── modules/                    # Feature-sliced business logic
│   │   ├── agents/                 # Agent CRUD (server procedures + UI)
│   │   ├── auth/                   # Auth views & hooks
│   │   ├── call/                   # Video call components
│   │   ├── dashboard/              # Dashboard layout & stats
│   │   ├── home/                   # Landing page module
│   │   ├── meetings/               # Meeting CRUD, transcripts, summaries
│   │   └── triage/                 # AI triage engine & UI
│   │
│   ├── components/                 # Shared UI components (shadcn/ui)
│   ├── hooks/                      # Global custom React hooks
│   ├── lib/                        # Utility functions (auth, stream, utils)
│   ├── constants/                  # App-wide constants
│   ├── trpc/                       # tRPC client + server setup
│   └── middleware.ts               # Route protection middleware
│
├── public/                         # Static assets
├── .env                            # Environment variables (not committed)
├── package.json                    # Dependencies & scripts
├── next.config.ts                  # Next.js configuration
├── drizzle.config.ts               # Drizzle ORM configuration
├── tsconfig.json                   # TypeScript configuration
├── components.json                 # shadcn/ui component config
├── SETUP.md                        # Detailed setup guide
├── architecture_overview.md        # Detailed architecture docs
└── TEAM_RESPONSIBILITIES.md        # Team roles & responsibilities
```

---

## 📋 Prerequisites

Make sure you have the following installed before getting started:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **Bun** | Latest | [bun.sh](https://bun.sh/) |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |
| **ngrok** | Any (for webhooks) | [ngrok.com](https://ngrok.com/) |

### Installing Bun (Windows PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

> You can also use `npm`, `yarn`, or `pnpm` instead of Bun if preferred.

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ─── Database (Neon PostgreSQL) ───────────────────────────────
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require"

# ─── Authentication (Better Auth) ────────────────────────────
BETTER_AUTH_SECRET=<your-random-secret-32-chars>
BETTER_AUTH_URL=http://localhost:3000

# ─── App URL ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Stream.io (Video & Chat) ────────────────────────────────
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=<your-stream-api-key>
STREAM_VIDEO_SECRECT_KEY=<your-stream-secret-key>
NEXT_PUBLIC_STREAM_CHAT_API_KEY=<your-stream-api-key>
STREAM_CHAT_SECRECT_KEY=<your-stream-secret-key>

# ─── OpenAI ──────────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-<your-openai-api-key>

# ─── Inngest (Background Jobs) ───────────────────────────────
INNGEST_EVENT_KEY=<your-inngest-event-key>
INNGEST_SIGNING_KEY=<your-inngest-signing-key>
```

### Where to get these keys

| Variable | Source |
|---|---|
| `DATABASE_URL` | [neon.tech](https://neon.tech) → Create project → Connection string |
| `BETTER_AUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `STREAM_*_API_KEY` / `STREAM_*_SECRECT_KEY` | [getstream.io](https://getstream.io) → Dashboard → App → API Keys |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) → API Keys |
| `INNGEST_*` | [inngest.com](https://inngest.com) → Event Keys & Signing Keys |

---

## 🚀 How to Run the Project

### Step 1 — Clone the Repository

```bash
git clone <repository-url>
cd med-ai
```

### Step 2 — Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

### Step 3 — Set Up Environment Variables

Copy the `.env` template and fill in your credentials:

```bash
# Create .env file and add all required variables
# (See the Environment Variables section above)
```

### Step 4 — Push Database Schema

Sync the Drizzle ORM schema to your Neon PostgreSQL database:

```bash
bun run db:push
```

Expected output:
```
✓ Schema pushed successfully
```

### Step 5 — Start the Development Server

```bash
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Running Webhooks Locally (for full AI features)

Stream.io webhooks require a publicly accessible URL. Use ngrok to expose your local server:

**Terminal 1 — Start the app:**
```bash
bun dev
```

**Terminal 2 — Start the ngrok tunnel:**
```bash
bun run dev:webhook
```

This creates a public URL (e.g., `https://xxxx.ngrok-free.app`) — add this to your Stream.io dashboard as the webhook endpoint:
```
https://xxxx.ngrok-free.app/api/webhook
```

---

### Running Inngest Locally

Inngest requires its own dev server for local background job processing.

Install the Inngest CLI and run:
```bash
npx inngest-cli@latest dev
```

This starts the Inngest dev server at `http://localhost:8288` and discovers your functions at `http://localhost:3000/api/inngest`.

---

## 📦 Available Scripts

| Command | Description | When to Use |
|---|---|---|
| `bun dev` | Start Next.js dev server (hot reload) | Every development session |
| `bun run build` | Build production bundle | Before deploying |
| `bun start` | Run the production build | After `bun run build` |
| `bun run lint` | Run ESLint for code quality checks | Before committing code |
| `bun run db:push` | Push Drizzle schema to the database | After modifying `src/db/schema.ts` |
| `bun run db:studio` | Open Drizzle Studio (DB GUI) | To view/edit database records |
| `bun run dev:webhook` | Start ngrok tunnel on port 3000 | When testing Stream webhooks locally |

---

## 🌐 API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth handler (login, OAuth, sessions) |
| `/api/trpc/[trpc]` | GET/POST | tRPC API router (agents, meetings, triage) |
| `/api/inngest` | POST | Inngest function handler for background jobs |
| `/api/webhook` | POST | Stream.io webhook handler (call lifecycle events) |

### tRPC Procedures (Key Endpoints)

| Router | Procedure | Description |
|---|---|---|
| `agents` | `create`, `getMany`, `getOne`, `update`, `remove` | CRUD for AI agents |
| `meetings` | `create`, `getMany`, `getOne`, `generateToken`, `getTranscript` | Meeting management |
| `triage` | `analyze` | AI triage symptom analysis |

---

## 🔄 Data Flow (End-to-End)

```
1. USER LOGIN
   Browser → Better Auth → NeonDB (user/session stored)

2. CREATE AI AGENT
   Browser → tRPC (agents.create) → NeonDB (agents table)

3. CREATE MEETING
   Browser → tRPC (meetings.create) → NeonDB + Stream.io (call created with auto-recording)

4. JOIN VIDEO CALL
   Browser → tRPC (meetings.generateToken) → Stream Video JWT
   Browser → Stream Video SDK → WebRTC Call Room

5. CALL STARTS (Webhook: call.session_started)
   Stream → /api/webhook → Verify HMAC signature
                         → Set meeting.status = "active"
                         → Connect OpenAI Realtime API as AI agent voice

6. CALL ENDS (Webhook: call.session_participant_left → call.session_ended)
   Stream → /api/webhook → call.end()
                         → Set meeting.status = "processing"

7. TRANSCRIPT READY (Webhook: call.transcription_ready)
   Stream → /api/webhook → Save transcriptUrl to DB
                         → Fire Inngest event: "meetings/processing"

8. AI SUMMARIZATION (Inngest Background Job)
   Inngest → fetch JSONL transcript
           → parse transcript items
           → DB lookup speakers (user + agent names)
           → GPT-4o generates structured Markdown summary
           → Save summary to DB, status = "completed"

9. RECORDING READY (Webhook: call.recording_ready)
   Stream → /api/webhook → Save recordingUrl to DB

10. POST-MEETING CHAT (Webhook: message.new on Stream Chat)
    User → Stream Chat → /api/webhook → GPT-4o (scoped to summary + agent instructions)
                                      → AI reply sent back to Stream Chat channel
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or run on a different port
bun dev -p 3001
```

### Database connection error
- Verify `DATABASE_URL` in `.env` is correct
- Ensure your Neon database is active (free tier may pause after inactivity)
- Run `bun run db:push` to sync the schema

### "Module not found" errors
```bash
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item bun.lock
bun install
```

### Build errors after `git pull`
```bash
bun install           # Reinstall dependencies
bun run db:push       # Sync database schema
Remove-Item -Recurse -Force .next   # Clear Next.js cache
bun dev
```

### OpenAI API errors
- Verify `OPENAI_API_KEY` in `.env` has no extra spaces or line breaks
- Check your OpenAI account has available credits
- Confirm the API key is not expired or revoked

### Inngest functions not triggering
- Ensure the Inngest dev server is running (`npx inngest-cli@latest dev`)
- Verify `INNGEST_SIGNING_KEY` and `INNGEST_EVENT_KEY` are set in `.env`
- Check the Inngest dashboard at `http://localhost:8288`

### Stream webhook not receiving events
- Ensure ngrok is running: `bun run dev:webhook`
- Update the webhook URL in your Stream.io dashboard
- Verify the `x-signature` HMAC header is being validated correctly

---

## 👥 Team

This project was developed as a Capstone project at **Lovely Professional University (LPU), SEM 7**.

See [TEAM_RESPONSIBILITIES.md](./TEAM_RESPONSIBILITIES.md) for detailed team member roles and responsibilities.

---

## 📚 Additional Documentation

| Document | Description |
|---|---|
| [SETUP.md](./SETUP.md) | Step-by-step setup guide with troubleshooting |
| [architecture_overview.md](./architecture_overview.md) | Detailed system architecture and Mermaid diagrams |
| [TEAM_RESPONSIBILITIES.md](./TEAM_RESPONSIBILITIES.md) | Team roles, module ownership, and responsibilities |
| [DOCS-INDEX.md](./DOCS-INDEX.md) | Index of all project documentation |

---

## 🔗 Key Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Stream.io Video Docs](https://getstream.io/video/docs/)
- [Stream.io Chat Docs](https://getstream.io/chat/docs/)
- [Better Auth Docs](https://better-auth.com)
- [Inngest Docs](https://inngest.com/docs)
- [OpenAI Realtime API](https://platform.openai.com/docs/api-reference/realtime)
- [Neon PostgreSQL](https://neon.tech/docs)

---

## 📝 License

This project is developed for **educational purposes** as part of the LPU SEM 7 Capstone Project.

---

<div align="center">
  <sub>Built with ❤️ by the Med-AI Team | LPU Capstone 2026</sub>
</div>
