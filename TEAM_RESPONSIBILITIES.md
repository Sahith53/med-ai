# Med-AI — Team Responsibility & Viva Preparation Document

**Project:** Med-AI — AI-Powered Medical Consultation Platform
**Course:** LPU SEM 7 Capstone Project
**Team Size:** 3 Members
**Document Owner:** Technical Lead
**Last Updated:** May 2026

---

## 1. Executive Summary

**Med-AI** is a full-stack web platform that lets a patient describe their symptoms, receive an AI-driven triage assessment (risk level, specialist recommendation, precautions), and — when needed — instantly start a real-time video consultation with an AI medical agent powered by OpenAI's Realtime API. After the call ends, an asynchronous Inngest pipeline transcribes the consultation, generates a structured medical summary using GPT-4o, and unlocks a post-meeting follow-up chat scoped to that consultation's transcript.

The system is delivered as a single Next.js 15 App-Router monolith but is internally organized as three loosely-coupled domains, each large enough to be owned end-to-end by one team member.

---

## 2. High-Level Architecture Flow

```
                ┌────────────────────────────────────────────┐
                │                  BROWSER                   │
                │  Next.js 15 (App Router) + React 19 + tRPC │
                └────────────────┬───────────────────────────┘
                                 │  (HTTPS / WebSocket)
        ┌────────────────────────┼─────────────────────────────┐
        │                        │                             │
        ▼                        ▼                             ▼
 ┌──────────────┐       ┌────────────────────┐       ┌──────────────────┐
 │  Better Auth │       │   tRPC API Layer   │       │  Stream Video /  │
 │   Sessions   │◄─────►│ agents | meetings  │◄─────►│   Stream Chat    │
 │  (Member 1)  │       │ triage  (M1+M2)    │       │   (Member 3)     │
 └──────┬───────┘       └─────────┬──────────┘       └────────┬─────────┘
        │                         │                           │
        ▼                         ▼                           ▼
 ┌────────────────────────────────────────────┐       ┌──────────────────┐
 │   Neon PostgreSQL  +  Drizzle ORM          │       │  Stream Webhook  │
 │   user · session · agents · meetings ·     │◄──────│   /api/webhook   │
 │   triageSessions   (Member 1 schema)       │       │   (Member 3)     │
 └────────────────────────────────────────────┘       └────────┬─────────┘
                                                               │ event
                                                               ▼
                                                      ┌──────────────────┐
                                                      │ Inngest Function │
                                                      │ Transcript →     │
                                                      │ GPT-4o Summary   │
                                                      │   (Member 3)     │
                                                      └──────────────────┘

Triage Flow (Member 1)        Meetings/Agents Flow (Member 2)        Realtime + AI Flow (Member 3)
Symptom text  ──►             Create Agent / Schedule Meeting ──►    Stream Video room +
Decision Engine              Dashboard CRUD + Data Tables             OpenAI Realtime bridge
(risk, specialist) ─────────►  Generate Stream JWT  ─────────────►   Webhook → Inngest →
                                                                      Summary + Post-call Chat
```

**One-line summary of the data flow:** A user lands on the dashboard (Member 2's UI), runs an AI symptom assessment (Member 1's triage engine), and is escalated into a live video call with an AI doctor (Member 3's real-time + AI pipeline) — with the database, auth, and tRPC layer (Member 1) tying everything together.

---

## 3. Team Composition & Ownership Map

| Member | Role | Primary Module | Lines-of-Ownership |
|---|---|---|---|
| **Member 1** | Backend & Database Lead | Foundation, Auth, DB, AI Triage Engine | Schema, Better Auth, tRPC core, `modules/triage` (full stack) |
| **Member 2** | Full-Stack & Frontend Lead | Agents, Meetings CRUD, Dashboard UI/UX | `modules/agents`, `modules/meetings`, `modules/dashboard`, `modules/home`, design system |
| **Member 3** | AI & Real-Time Integration Lead | Live Video, Webhooks, AI Pipeline | `modules/call`, `/api/webhook`, `inngest/`, Stream + OpenAI Realtime |

---

## 4. Member 1 — Backend Foundation & AI Triage Engine

### 4.1 Module / Feature Ownership
- **Project skeleton & infrastructure:** Next.js 15 setup, `tsconfig`, ESLint, Tailwind v4, environment configuration.
- **Database layer:** `src/db/schema.ts` and `src/db/index.ts` — full Drizzle ORM schema (user, session, account, verification, agents, meetings, triageSessions) and Neon Postgres serverless connection.
- **Authentication:** `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]`, `src/modules/auth/*` — Better Auth integration with Email+Password, Google OAuth, and GitHub OAuth.
- **tRPC core:** `src/trpc/init.ts`, `src/trpc/server.tsx`, `src/trpc/client.tsx`, `src/trpc/query-client.ts`, `src/trpc/routers/_app.ts` — type-safe API foundation with `protectedProcedure` middleware.
- **AI Triage Module (end-to-end):** `src/modules/triage/**` — symptom extraction, rule-based decision engine, specialist recommendation, triage chat UI, persistence.

### 4.2 Key Responsibilities
1. Designed the relational schema with proper foreign keys, cascade rules, enums (`meeting_status`, `triage_risk`), and a `nanoid()` primary-key strategy for client-friendly IDs.
2. Set up Drizzle Kit (`drizzle.config.ts`) and the `db:push` / `db:studio` workflow used by all teammates.
3. Implemented the Better Auth server adapter (`drizzleAdapter`) and the client-side `authClient` consumed by Member 2's UI.
4. Built the `protectedProcedure` middleware that every tRPC route from Member 2 and the triage router rely on for session validation.
5. Authored the **AI Triage Decision Engine**:
   - `services/triage.service.ts` — keyword-based symptom extraction across 30+ symptoms and a 4-tier risk classifier (`low / medium / high / emergency`).
   - `services/recommendation.service.ts` — specialist mapping (Cardiologist, Neurologist, Pulmonologist, etc.).
   - `server/decision-engine.ts` — converts analysis + recommendation into a `TriageDecision` with action, urgency message, and tailored precautions.
   - `server/medical-prompt.ts` — reusable medical system prompt later consumed by Member 3's realtime agent.
6. Built the `triageRouter` (`chat`, `getSession`, `getSessions`, `linkMeeting`) and the chat UI (`triage-chat.tsx`, `risk-badge.tsx`, `escalation-alert.tsx`, `precautions-card.tsx`, `consultation-card.tsx`).
7. Maintained `src/constants/index.ts` (pagination defaults shared by all modules).

### 4.3 Technologies & Tools Used
- **Backend:** Next.js Route Handlers, tRPC v11, Zod v4, TypeScript 5
- **Database:** Drizzle ORM 0.44, Drizzle Kit, Neon serverless PostgreSQL
- **Auth:** Better Auth 1.3 (Email + Google + GitHub OAuth), `drizzleAdapter`
- **Frontend (triage):** React 19, TanStack Query v5, React Hook Form, shadcn/ui, react-markdown
- **Tooling:** ESLint, Bun, ngrok (for shared OAuth callback testing)

### 4.4 APIs / DB / Frontend / Backend Tasks Handled
| Layer | Concrete Deliverable |
|---|---|
| Database | 7 tables, 2 enums, FK + cascade design, migrations via `drizzle-kit push` |
| Auth API | `/api/auth/[...all]` catch-all route, OAuth callback handling, session cookie config |
| tRPC | `protectedProcedure`, `appRouter` composition, superjson transformer |
| Backend (triage) | `triage.chat` mutation (analyse → persist → return decision), `getSession`, `getSessions`, `linkMeeting` |
| Frontend (triage) | `/triage` route, conversational chat UI, risk badge, escalation alert, precaution cards, "Start AI Consultation" CTA that hands off to Member 2's create-meeting flow |

### 4.5 Challenges Solved
- **Symptom NLP without a heavy model:** designed a deterministic keyword + risk-tier classifier so the triage screen stays cheap (no token cost) while still triggering correct escalations for `chest pain`, `coughing blood`, etc.
- **Session continuity:** stored the entire conversation in `triageSessions.rawMessages` (JSON) so the same row updates instead of inserting a new row per message — avoids unbounded table growth.
- **Auth race conditions:** chose Better Auth over NextAuth specifically because of its first-class Drizzle adapter and stable session table contract; got OAuth + email-password working under one provider config.
- **Cascade integrity:** chose `onDelete: "cascade"` for owned data and `onDelete: "set null"` for `triageSessions.meetingId` so deleting a meeting doesn't lose triage history.

### 4.6 Possible Viva Questions & Strong Answers

**Q1. Walk me through the database schema. Why did you choose those relationships?**
*A:* I have seven tables grouped into three concerns. `user`, `session`, `account`, and `verification` are the Better Auth tables — they store identity, login providers, and password-reset tokens. `agents` and `meetings` represent the consultation domain: every meeting belongs to one user and one agent, so I used non-null foreign keys with `onDelete: "cascade"` on the user side. `triageSessions` is a soft link — it references `meetings` with `onDelete: "set null"` because a triage record should outlive a deleted meeting. I used `nanoid()` for primary keys instead of UUIDs because they're URL-safer and shorter, which mattered for our `/meetings/[meetingId]` routes.

**Q2. Why Drizzle ORM instead of Prisma?**
*A:* Three reasons. First, Drizzle is a thin SQL builder so the queries you write match what hits Postgres — that helped me debug `inArray` and `desc` queries quickly. Second, it works on the edge and on Neon's serverless driver without a separate query engine. Third, the schema is plain TypeScript, so I get instant compile-time feedback when I rename a column.

**Q3. How does authentication work end-to-end?**
*A:* The user clicks "Sign in with Google" on Member 2's auth view. The Better Auth client redirects to Google, which calls back into our catch-all route `/api/auth/[...all]`. Better Auth verifies the OAuth code, upserts a row in the `account` table linked to a `user`, and creates a `session` row keyed by a secure cookie. Every subsequent tRPC call goes through my `protectedProcedure` middleware, which calls `auth.api.getSession({ headers })` — if no session, it throws `UNAUTHORIZED`; otherwise it injects `ctx.auth` for the procedure.

**Q4. Explain the triage decision engine. Why isn't it an LLM?**
*A:* It is intentionally rule-based for the screening stage because (a) we need millisecond response time on the first message, (b) deterministic emergency detection — saying "coughing blood" must always escalate, never depend on temperature/sampling, and (c) cost. It works in three stages: `extractSymptomsFromText` does keyword matching across 30+ medical terms, `assessSymptoms` walks three priority sets (`EMERGENCY_SIGNALS` → `HIGH_RISK_SIGNALS` → `MEDIUM_RISK_SIGNALS`) and assigns a severity score 1–10, and `evaluateDecision` maps the risk level to one of four actions (`emergency_alert`, `alert`, `consultation`, `precautions`). Only after escalation do we hand off to Member 3's GPT-4o realtime agent.

**Q5. What is `protectedProcedure` and why did you build it?**
*A:* It's a tRPC middleware I defined in `src/trpc/init.ts` that wraps `t.procedure` with a session check. Every router in the app — meetings, agents, triage — uses it instead of raw `procedure`. This means I had to write the auth-check exactly once and the rest of the team gets `ctx.auth.user.id` for free. It also makes unauthorized routes a compile error, not a runtime bug.

**Q6. How did you prevent unbounded growth in the triage table?**
*A:* Each conversation reuses the same row. The first message inserts a new `triageSessions` row keyed by a `nanoid()` `conversationId`. Every follow-up message updates the same row's `rawMessages` JSON column with the appended history. So a 30-message triage chat is one row, not 30.

**Q7. How do other modules consume your work?**
*A:* Member 2's meetings and agents routers extend my `protectedProcedure`. Member 3's webhook reads `meetings` and `triageSessions` via my Drizzle schema and uses `buildMedicalPrompt` from my triage module to seed the OpenAI Realtime session with medical instructions.

---

## 5. Member 2 — Agents, Meetings & Dashboard Experience

### 5.1 Module / Feature Ownership
- **Agents module:** `src/modules/agents/**` — full CRUD for AI medical personas (Cardiologist, GP, etc.).
- **Meetings module:** `src/modules/meetings/**` — scheduling, listing, status filtering, detail page.
- **Dashboard shell:** `src/modules/dashboard/**` and `src/app/(dashboard)/layout.tsx` — sidebar, navbar, command palette, user button.
- **Home / landing:** `src/modules/home/**` and `src/app/(dashboard)/page.tsx`.
- **Auth UI:** `src/modules/auth/ui/views/*` — sign-in / sign-up forms with React Hook Form + Zod.
- **Design system:** `src/components/ui/**` (shadcn primitives), Tailwind v4 theme, dark/light mode via `next-themes`.

### 5.2 Key Responsibilities
1. Built the `agentsRouter` (`create`, `update`, `remove`, `getOne`, `getMany`) — paginated, search-enabled, scoped to the logged-in user via Member 1's `protectedProcedure`.
2. Built the `meetingsRouter` (`create`, `update`, `remove`, `getOne`, `getMany`, `generateToken`) and the lifecycle helpers that classify meetings by status.
3. Designed the **dashboard shell**: collapsible `DashboardSidebar`, top `DashboardNavbar`, `DashboardCommand` (CMD+K palette), `DashboardUserButton` with avatar (DiceBear) and sign-out.
4. Implemented **paginated, sortable, searchable data tables** for both agents and meetings using `@tanstack/react-table`, with URL-synced filters via `nuqs`.
5. Authored every form: `AgentForm`, `MeetingForm`, `SignInView`, `SignUpView` — all using `react-hook-form` + `zod` resolvers and shadcn/ui inputs.
6. Built status-aware empty states for meetings: `UpcomingState`, `ActiveState`, `ProcessingState`, `CompletedState`, `CancelledState`.
7. Owned the look-and-feel: typography, spacing, brand colour, error toasts via `sonner`, loading skeletons, command palette UX.
8. Created the "Lobby" view (`call/ui/views/call-lobby.tsx`) where users preview their camera/mic before joining the room handed off to Member 3.

### 5.3 Technologies & Tools Used
- **Frontend framework:** Next.js 15 App Router, React 19 (Server Components + Client Components), React Hook Form 7
- **State / data:** TanStack Query v5 via tRPC, `nuqs` for URL state, Zustand-free architecture
- **UI:** shadcn/ui (Radix UI primitives), Tailwind CSS v4, `lucide-react` icons, `framer-motion`, `cmdk` (command palette), `sonner` (toasts), `react-day-picker`, DiceBear avatars
- **Forms / validation:** Zod v4 schemas (`modules/agents/schemas.ts`, `modules/meetings/schemas.ts`), `@hookform/resolvers`
- **Tables:** `@tanstack/react-table` v8

### 5.4 APIs / DB / Frontend / Backend Tasks Handled
| Layer | Concrete Deliverable |
|---|---|
| Backend (tRPC) | `agentsRouter` and `meetingsRouter` with input validation, pagination, search filter, ownership scoping |
| Backend (helpers) | `meetings.generateToken` — issues short-lived Stream Video JWT consumed by Member 3's call view |
| Frontend (routes) | `/sign-in`, `/sign-up`, `/`, `/agents`, `/agents/[agentId]`, `/meetings`, `/meetings/[meetingId]`, `/call/[meetingId]/lobby` |
| Frontend (components) | 30+ reusable shadcn components, two data tables, two CRUD forms, command palette, sidebar, navbar |
| UX | Optimistic updates, query invalidation, skeleton loaders, keyboard shortcuts, responsive mobile drawer |

### 5.5 Challenges Solved
- **Server vs Client component boundary:** the dashboard shell needed to render server-prefetched data (via tRPC server-side helpers) but also host interactive child components — solved with `HydrationBoundary` and the `getQueryClient()` pattern in `src/trpc/server.tsx`.
- **URL-driven filters:** rather than local state, all list filters (search, status, page) live in the URL via `nuqs` so users can share/reload links — required custom `params.ts` per module.
- **Form validation + server errors:** unified the experience with Zod (client-side instant validation) plus tRPC `TRPCError` mapping into form-level error toasts via `sonner`.
- **Status-driven UI:** a meeting can be in five states; instead of a single "list page," I built five empty/active states so the user always knows what to do next (e.g., "Cancel" button only on `upcoming`, "Watch recording" only on `completed`).
- **Performance of the data tables:** combined server-side pagination with TanStack Query's `placeholderData: keepPreviousData` so paging feels instant.

### 5.6 Possible Viva Questions & Strong Answers

**Q1. Walk me through what happens when a user creates a new agent.**
*A:* The user opens the "New Agent" dialog from the agents page. The form is built with React Hook Form bound to a Zod schema (`agentSchemas.create`). On submit, `useMutation` calls `trpc.agents.create.useMutation()`, which hits my `agentsRouter.create` procedure on the server. The procedure validates input, calls `db.insert(agents).values({ ...input, userId: ctx.auth.user.id })`, and returns the new row. I then call `queryClient.invalidateQueries({ queryKey: trpc.agents.getMany.queryKey() })` so the table refreshes optimistically.

**Q2. Why tRPC instead of REST or GraphQL?**
*A:* End-to-end type safety. My router signatures are inferred straight into `useMutation` and `useQuery` on the client — no codegen, no schema duplication. If I rename a column in Member 1's schema, my form breaks at compile time, not at runtime. We're a 3-person team; tRPC removed an entire class of integration bugs.

**Q3. Explain the meetings lifecycle and how the UI reflects it.**
*A:* A meeting moves through `upcoming → active → processing → completed` (or `cancelled`). The list page filters by status via a URL param (`?status=active`). For each status I built a dedicated empty state: `UpcomingState` shows a "Start meeting" CTA, `ActiveState` shows a "Join call" button (which generates the Stream JWT via my `generateToken` procedure), `ProcessingState` shows a "Summary is being generated" skeleton, `CompletedState` shows the summary and recording. This keeps the user-experience aligned with the backend state machine maintained by Member 3's webhook.

**Q4. How does `generateToken` work and why is it on the server?**
*A:* `generateToken` is a tRPC mutation guarded by `protectedProcedure`. It uses Member 3's `streamVideo` server SDK and `streamVideo.generateUserToken({ user_id, validity_in_seconds: 3600 })`. It must run on the server because it requires `STREAM_VIDEO_SECRET_KEY`, which never leaves the server environment. The client gets a short-lived JWT it uses to connect to Stream's call room.

**Q5. How do you keep the data table state in the URL?**
*A:* I use `nuqs` to define per-module `useFiltersParams()` hooks (`modules/agents/params.ts`, `modules/meetings/params.ts`). Each hook owns the search, page, and status params. The data table reads those params, passes them as input to `getMany`, and `nuqs` keeps the URL in sync. Result: a user can copy `/meetings?status=completed&search=migraine&page=2` and the next person sees the exact same view.

**Q6. Walk me through your component library decisions.**
*A:* I used shadcn/ui rather than a packaged library like Material UI because shadcn copies primitives into the repo (`src/components/ui/*`). That gave me 100% style control via Tailwind v4 tokens, no version-lock with a vendor, and tree-shakeable bundles. Underneath, every component is a Radix UI primitive, so accessibility (keyboard nav, focus traps, ARIA attributes) is built-in.

**Q7. How do you handle form errors from the server?**
*A:* On the client, the form is locked by Zod (`@hookform/resolvers/zod`). On the server, the same Zod schemas validate the input — if anything slips through, tRPC throws a `TRPCError` which I catch in `mutation.onError` and surface via `sonner.toast.error`. For 4xx errors (e.g., name conflict), the error message is shown inline beneath the offending field; for 5xx, a toast.

**Q8. Show how your work integrates with Member 1 and Member 3.**
*A:* I depend on Member 1 for `db`, `protectedProcedure`, and Better Auth — without those, none of my routers can run. I produce data for Member 3: the `meetings` row I create (with `agentId` and `userId` joined to Member 1's tables) is exactly what Member 3's webhook reads in `call.session_started`. The Stream JWT I generate is what authenticates Member 3's call view. So the contract between us is the `meetings` table schema and the JWT.

---

## 6. Member 3 — Real-Time Video, Webhooks & AI Pipeline

### 6.1 Module / Feature Ownership
- **In-call experience:** `src/modules/call/**`, `src/app/call/[meetingId]/page.tsx` — Stream Video React SDK rendering, controls, leave-call flow.
- **Webhook orchestrator:** `src/app/api/webhook/route.ts` — the operational brain handling 6+ Stream event types end-to-end.
- **OpenAI Realtime bridge:** `connectOpenAi(...)` integration that joins GPT-4o into the live call as the AI doctor.
- **Inngest pipeline:** `src/inngest/client.ts`, `src/inngest/functions.ts`, `src/app/api/inngest/route.ts` — async transcript fetch → parse → GPT-4o summary → DB persist.
- **Stream Chat post-meeting:** `src/lib/stream-chat.ts`, `MessageNewEvent` handler, GPT-4o chat-completion follow-ups scoped to the meeting summary.
- **Stream SDK clients:** `src/lib/stream-video.ts`, `src/lib/stream-chat.ts`.
- **Medical AI helpers:** `src/lib/medicalIntelligence.ts` and shared usage of `buildMedicalPrompt` from Member 1's triage module.

### 6.2 Key Responsibilities
1. Architected the **`/api/webhook` orchestrator** — verifies HMAC signatures, parses Stream events, and routes them to handlers for `call.session_started`, `call.session_participant_left`, `call.session_ended`, `call.transcription_ready`, `call.recording_ready`, and Stream Chat `message.new`.
2. Wired **OpenAI Realtime API into the live call** via `streamVideo.video.connectOpenAi()` so a GPT-4o medical assistant joins as a participant; injected the medical system prompt produced by Member 1.
3. Built the **Inngest async pipeline** (`meetingsProcessing`) with retryable, observable steps: `fetch-transcript`, `parse-transcript`, `add-speakers`, `summarizer.run` (GPT-4.1 via Agent Kit), `save-summary`.
4. Implemented the **post-meeting follow-up chat**: when a user messages the meeting channel, the webhook gathers the last 5 messages, prepends the meeting summary, calls `openai.chat.completions.create({ model: 'gpt-4o' })`, and replies through Stream Chat.
5. Built the **call view** (`CallView`, `CallActive`, `CallControls`, `CallEnded`) using `@stream-io/video-react-sdk` — speaker layout, mute / camera toggles, hang-up that ends the call.
6. Hardened the system: idempotency Set for `processedMessages` to prevent duplicate AI replies, ngrok-based webhook testing workflow, signature-verification short-circuit on every request.
7. Wrote the medical system prompt and tuned GPT-4o `temperature`/`max_tokens` for medical context.

### 6.3 Technologies & Tools Used
- **Real-time:** Stream Video React SDK 1.26, Stream Node SDK 0.7, Stream Chat React/Node SDK 9.x, `@stream-io/openai-realtime-api`
- **AI:** OpenAI Realtime API (GPT-4o), OpenAI Chat Completions (GPT-4o), `@inngest/agent-kit` (GPT-4.1)
- **Background jobs:** Inngest 4.x, Inngest Dev Server, retryable `step.run` pattern
- **Webhooks:** HMAC signature verification (`streamVideo.verifyWebhook`), Next.js Route Handlers
- **Tooling:** ngrok (for local webhook tunnelling), Inngest CLI, Stream Dashboard
- **Frontend:** React 19 (the call view), `framer-motion` for transitions, shadcn primitives by Member 2

### 6.4 APIs / DB / Frontend / Backend Tasks Handled
| Layer | Concrete Deliverable |
|---|---|
| External APIs | Stream Video, Stream Chat, OpenAI Realtime, OpenAI Chat Completions |
| Backend route | `POST /api/webhook` handling 6 event types |
| Background job | `meetings/processing` Inngest function (5 steps) |
| Database | Status mutations on `meetings` (`active → processing → completed`), `transcriptUrl`, `recordingUrl`, `summary` writes via Member 1's Drizzle schema |
| Frontend | `/call/[meetingId]` full-screen call experience, `CallActive`, `CallEnded`, post-meeting chat panel |
| Security | `verifySignatureWithSDK`, env-based secret handling, idempotent message handling |

### 6.5 Challenges Solved
- **Bridging OpenAI Realtime into an existing video room:** Stream's `connectOpenAi()` returns a session you must configure with the agent's medical instructions before audio flows. Solved by serialising Member 1's `buildMedicalPrompt(agent)` into the `SessionConfig`.
- **Duplicate webhook deliveries:** Stream retries webhooks on non-2xx responses, which caused duplicate AI replies in chat. Fixed by maintaining an in-memory `processedMessages` Set keyed by `messageId` and short-circuiting repeats.
- **Long-running summary jobs blocking the webhook:** the webhook must respond < 10s, but transcript summarisation takes 20–60s. Solved by emitting an Inngest event (`meetings/processing`) and returning 200 immediately — Inngest then runs each `step.run` as an isolated, retryable task.
- **Speaker resolution:** the JSONL transcript only carries `speaker_id` strings. The `add-speakers` Inngest step joins those IDs against both `user` and `agents` tables (single round trip via `inArray`) to enrich each turn with a name.
- **Local webhook testing:** Stream's webhook delivers to a public URL only. Documented and standardised the `bun run dev:webhook` (ngrok) workflow so the team can develop without a deployment.
- **Status correctness:** designed the state machine guard in `call.session_started` (`not(eq(status, "completed"))` etc.) so a re-delivered event can't silently downgrade a finished meeting.

### 6.6 Possible Viva Questions & Strong Answers

**Q1. Trace what happens from "user clicks Join Call" to "AI doctor speaks."**
*A:* The user clicks Join in Member 2's lobby view. The client requests a Stream JWT from `meetings.generateToken`, then connects to the Stream call room using the React SDK. Stream sees a participant join and POSTs `call.session_started` to my webhook. My handler verifies the HMAC signature, looks up the meeting via Drizzle, sets `status = "active"`, looks up the agent's instructions, and calls `streamVideo.video.connectOpenAi({ call, openAiApiKey, agentUserId })`. Stream opens a WebSocket to OpenAI Realtime, I push the medical session config, and within ~1 second GPT-4o is audible in the call as a participant.

**Q2. Why use Inngest instead of running the summary inline?**
*A:* Three reasons. (1) Stream's webhook must return 200 quickly; if I block on a 30-second OpenAI call, Stream will retry and I'll create duplicate work. (2) Inngest gives me retries with exponential backoff for free — if OpenAI is rate-limited, the step retries. (3) Each `step.run` is an isolated checkpoint; if `save-summary` fails, I don't re-fetch and re-parse the transcript. It's idempotent and observable in the Inngest dashboard.

**Q3. Walk me through HMAC signature verification.**
*A:* Stream signs every webhook body with our `STREAM_VIDEO_SECRET_KEY` using HMAC-SHA256 and sends the digest in the `x-signature` header. Before parsing JSON, I read the raw body with `req.text()` (you must hash the raw bytes, not a re-stringified JSON), and call `streamVideo.verifyWebhook(body, signature)`. If it returns false, I respond `401`. This prevents a public webhook URL from being abused to forge state changes — for example, marking someone else's meeting as completed.

**Q4. Explain the Inngest summarization steps in order.**
*A:*
- **`fetch-transcript`** — `fetch(event.data.transcriptUrl).then(r => r.text())`, returns raw JSONL.
- **`parse-transcript`** — `JSONL.parse<StreamTranscriptItem>(raw)` → typed array of `{ speaker_id, text, start_ts, stop_ts }`.
- **`add-speakers`** — collect distinct `speaker_id`s, join against `user` and `agents` tables in one `inArray` query each, and decorate every turn with `user.name`.
- **`summarizer.run(...)`** — Inngest Agent Kit sends the enriched transcript to GPT-4.1 with a structured Markdown prompt (`### Overview` / `### Notes`).
- **`save-summary`** — `db.update(meetings).set({ summary, status: "completed" })`.

**Q5. How does the post-meeting chat stay scoped to the meeting?**
*A:* When `message.new` fires from Stream Chat, my handler looks up the meeting by channel ID, fetches the stored `summary` and the `agent.instructions`, gathers the last 5 messages from the channel, and constructs an OpenAI Chat Completion request whose system prompt is roughly *"You are {agent.name}. Use only this consultation summary: {summary}. Stay in character."* The reply is posted back via `streamChat.channel.sendMessage()`. So context is bounded by the summary — the AI can't drift to other consultations.

**Q6. What happens if the webhook is called twice for the same event?**
*A:* For meeting status transitions, my Drizzle WHERE clauses are guarded — e.g., the `call.session_started` query excludes meetings that are already `active`, `completed`, or `processing`. For chat messages, I keep `processedMessages` (a Set of message IDs) and skip duplicates. The Inngest function is naturally idempotent because each step is checkpointed.

**Q7. Why does `connectOpenAi` need the agent ID and what does the agent_user_id mean?**
*A:* Stream needs a synthetic "user" inside the call room to attribute the AI's audio and turns to. I create that participant in the Stream user system using the `agent.id` from Member 1's `agents` table. That ID then appears in the transcript as `speaker_id`, which is exactly why my `add-speakers` step in Inngest can resolve it back to the agent's display name during summarisation.

**Q8. How is your work tested locally?**
*A:* `bun dev` boots Next.js, `bun run dev:webhook` opens an ngrok tunnel that maps `https://<random>.ngrok.app/api/webhook` to localhost, and the Stream dashboard is configured to deliver webhooks there. Inngest has a separate dev server (`npx inngest-cli dev`) that sees events and runs my `meetingsProcessing` function locally. So the full live-call → summary pipeline can be exercised without a deployment.

---

## 7. Collaboration & Cross-Team Integration Points

### 7.1 Hard Contracts Between Members
| Contract | Owner | Consumers |
|---|---|---|
| `db/schema.ts` — table definitions | M1 | M2, M3 |
| `protectedProcedure` middleware | M1 | M2, M3 |
| `meetings` row shape (status, IDs) | M1 (schema) + M2 (CRUD) | M3 (webhook reads/writes it) |
| Stream JWT (`meetings.generateToken`) | M2 | M3 (call view consumes it) |
| `buildMedicalPrompt(agent)` | M1 | M3 (injects into Realtime session) |
| Stream client singletons (`stream-video.ts`, `stream-chat.ts`) | M3 | M2 (uses on server to issue JWTs) |
| Triage `linkMeeting` mutation | M1 | M2 (called after a meeting is created from a triage escalation) |

### 7.2 Shared Workflows
- **Git workflow:** Trunk-based with short-lived feature branches.
  - Branch naming: `feat/m1-triage-engine`, `fix/m2-meetings-pagination`, `feat/m3-inngest-summarizer`.
  - Pull-request reviewer is always one of the other two members; merging is squash + rebase to keep `main` linear.
  - `bun run lint` and `bun run build` must pass locally before opening a PR.
- **Database migrations:** Only Member 1 modifies `db/schema.ts`. Whoever needs a new column raises a PR against M1's review; M1 runs `bun run db:push` against the shared Neon database.
- **Environment variables:** `.env` is shared via a secure channel (1Password / Bitwarden). New keys are added to `.env.example` and announced in the team chat. Anyone touching `STREAM_*` or `OPENAI_*` notifies M3.
- **Webhook testing:** Each member has their own ngrok subdomain to avoid event collisions. The Stream dashboard webhook URL is rotated per developer during local testing.
- **Code-review checklist:**
  1. New tRPC routes use `protectedProcedure`.
  2. All inputs validated by Zod.
  3. No raw SQL — Drizzle only.
  4. No business logic inside React components — push it to `services/` or tRPC procedures.
  5. Add a query invalidation on every mutation.

### 7.3 Integration Milestones (already delivered)
| Milestone | Deliverables | Owners |
|---|---|---|
| **M1 — Foundation** | Auth, schema, tRPC, dashboard shell | M1, M2 |
| **M2 — CRUD complete** | Agents + Meetings full lifecycle | M2 |
| **M3 — Live call works** | Stream Video + OpenAI Realtime joining the call | M3 |
| **M4 — Triage online** | Symptom assessment → escalation → meeting | M1 (+ M2 escalation handoff) |
| **M5 — Async pipeline** | Inngest summary + post-meeting chat | M3 |
| **M6 — Polish** | UX consistency, dark mode, mobile, docs | M2 (+ all) |

### 7.4 Testing & QA
- **Unit-level (services):** Member 1 maintains plain-TypeScript unit checks for `assessSymptoms`, `recommendSpecialist`, and `evaluateDecision`. They are pure functions with deterministic inputs.
- **Integration:** Manual E2E walk-through scripts that cover (a) sign-in → create agent → create meeting → join call → AI replies → leave call → summary appears → post-meeting chat.
- **Webhook fuzz:** Member 3 maintains a Postman collection with sample Stream payloads to replay locally without a real call.
- **Database integrity:** Member 1 runs `bun run db:studio` before each demo to verify cascade behaviour.

### 7.5 Deployment
- **Hosting:** Vercel (Next.js) — automatic deploys on `main`.
- **Database:** Neon Postgres — pooled connection in production, branch databases for previews.
- **Background jobs:** Inngest Cloud — same `inngest.createFunction` definitions run in prod, no code change.
- **Webhooks:** Stream dashboard pointed at the production Vercel domain.
- **Monitoring:** Vercel Logs (HTTP), Inngest Dashboard (jobs), Stream Dashboard (calls), OpenAI Usage Dashboard (token spend).

---

## 8. Architecture Glossary (for the viva panel)

| Term | One-line meaning |
|---|---|
| **App Router** | Next.js 15 routing model where every folder under `src/app` is a route segment. |
| **tRPC** | Type-safe RPC layer where the server router types are the client types. |
| **Drizzle ORM** | A lightweight, SQL-first ORM written in TypeScript. |
| **Better Auth** | Modern auth library that replaces NextAuth; first-class Drizzle adapter. |
| **Stream Video** | A managed WebRTC SFU + SDK that hosts the video room. |
| **Stream Chat** | A managed chat service; we use it for post-meeting follow-up. |
| **OpenAI Realtime** | Speech-to-speech GPT-4o API that streams audio in/out over WebSocket. |
| **Inngest** | Event-driven background-job platform with retryable `step.run` checkpoints. |
| **HMAC signature** | A keyed hash that proves a webhook payload came from Stream and wasn't tampered with. |
| **nanoid** | URL-safe 21-char unique ID, used as PK across business tables. |
| **shadcn/ui** | A pattern of *copying* Radix-based components into the repo (not installing as a package). |

---

## 9. Final Contribution Snapshot

| Area | Member 1 | Member 2 | Member 3 |
|---|---|---|---|
| Project setup & tooling | ✅ Owner | ➖ Contributor | ➖ Contributor |
| Database schema & migrations | ✅ Owner | ➖ Consumer | ➖ Consumer |
| Authentication (Better Auth) | ✅ Owner | ➖ UI consumer | — |
| tRPC core + middleware | ✅ Owner | ✅ Heavy user | ✅ Heavy user |
| AI Triage engine + UI | ✅ Owner | — | ➖ Prompt reuse |
| Agents CRUD + UI | — | ✅ Owner | — |
| Meetings CRUD + UI | — | ✅ Owner | ➖ Status updates |
| Dashboard / sidebar / command-K | — | ✅ Owner | — |
| Auth UI (sign-in/up) | ➖ Backend | ✅ Owner | — |
| Stream Video integration (in-call) | — | ➖ Lobby view | ✅ Owner |
| Stream Chat (post-meeting) | — | — | ✅ Owner |
| `/api/webhook` orchestrator | — | — | ✅ Owner |
| OpenAI Realtime bridge | ➖ Prompt | — | ✅ Owner |
| Inngest summary pipeline | — | — | ✅ Owner |
| Design system (shadcn / Tailwind) | — | ✅ Owner | — |
| Documentation (this file, SETUP.md) | ✅ Co-author | ✅ Co-author | ✅ Co-author |

Each member owns roughly **one third of the lines of code, one third of the user-visible features, and one third of the "wow" moments** in the demo: Member 1's triage decision engine, Member 2's polished dashboard and CRUD experience, and Member 3's live AI doctor + automatic transcript summary.

---

## 10. How to Read This Document for the Viva

1. Each member should read **their own section (4, 5, or 6) end-to-end** until they can explain every viva answer in their own words.
2. Each member should also read **section 2 (architecture flow)** and **section 7 (collaboration)** so cross-module questions don't catch them off guard.
3. For demo day, follow this script:
   - **Member 1** signs in → opens the triage page → describes "I have chest pain and shortness of breath" → shows escalation alert and "Start AI Consultation" CTA.
   - **Member 2** clicks the CTA → shows the auto-created meeting in the dashboard → walks through the agents page and command palette.
   - **Member 3** joins the call → speaks to the AI doctor live → ends the call → shows the meeting moving through `processing → completed` and the auto-generated Markdown summary → sends a post-meeting chat message and shows the AI replying with summary-scoped context.

This creates a continuous narrative where every member's contribution is the natural next step of the previous member's, exactly mirroring how a real product flow stitches together.

---

*End of document.*
