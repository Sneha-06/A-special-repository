# AI Healthcare Claims Assistant — Project Documentation

**Version:** 1.0  
**Last updated:** September 2026  
**Repository path:** `ai-healthcare-claims-assistant/`

---

## Table of contents

1. [Introduction](#1-introduction)
2. [High-level architecture](#2-high-level-architecture)
3. [Project root structure](#3-project-root-structure)
4. [Frontend folder (`frontend/`)](#4-frontend-folder-frontend)
5. [Backend folder (`backend/`)](#5-backend-folder-backend)
6. [How frontend and backend communicate](#6-how-frontend-and-backend-communicate)
7. [Database design](#7-database-design)
8. [AI and RAG architecture](#8-ai-and-rag-architecture)
9. [API reference summary](#9-api-reference-summary)
10. [Environment variables](#10-environment-variables)
11. [Running the application](#11-running-the-application)
12. [Using pgAdmin with this project](#12-using-pgadmin-with-this-project)
13. [Key demo data](#13-key-demo-data)
14. [Feature-to-file map](#14-feature-to-file-map)
15. [Connecting a real LLM later](#15-connecting-a-real-llm-later)
16. [Security and data notes](#16-security-and-data-notes)

---

## 1. Introduction

**AI Healthcare Claims Assistant** is a portfolio-quality, enterprise-style web application for healthcare/PBM (Pharmacy Benefit Manager) claims analysis. It helps analysts:

- Search and filter synthetic claims
- Understand why a claim was approved or rejected
- Explore mandate rules and compare them side by side
- Upload mandate documents and index them for semantic search
- Ask an AI copilot questions about claims, rules, and documents
- View operational dashboards and AI-generated insights

### Important disclaimer

This application uses **synthetic demo data only**. It is **not** a medical device, **not** HIPAA-certified, and must **never** be loaded with real patient data or PHI (Protected Health Information).

### Tech stack at a glance

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, MUI, Redux Toolkit, React Router, Axios, Recharts |
| Backend | Node.js, Express 5, TypeScript, Prisma, Zod, JWT, Multer |
| Database | PostgreSQL |
| AI | Pluggable `AIProvider` (Mock + OpenAI-compatible LLM), RAG pipeline |

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (http://localhost:5173)                            │
│  React + MUI + Redux                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │  Axios (REST + JWT Bearer token)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Express API (http://localhost:4000/api)                    │
│  Controllers → Services → Prisma → PostgreSQL                 │
│  RAG pipeline + AIProvider (mock or LLM)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL (database: ahca)                                │
│  claims, rules, documents, chunks, conversations, users     │
└─────────────────────────────────────────────────────────────┘
```

### Request flow example (AI chat)

1. User types a question in the **Claims Copilot** page.
2. Frontend dispatches a Redux thunk → `aiService.sendChat()` → `POST /api/ai/chat`.
3. Backend saves the user message, runs the **RAG pipeline**:
   - Embed the question
   - Retrieve relevant claims, rules, and document chunks via cosine similarity
   - Build context and prompt
   - Call `MockAIProvider` or `LLMProvider`
4. Backend returns structured JSON (`answer`, `sources`, `confidence`, `recommendations`).
5. Frontend renders the response in `AiResponseCard`.

**Security principle:** LLM API keys exist only in backend environment variables. The frontend never receives them.

---

## 3. Project root structure

```
ai-healthcare-claims-assistant/
├── frontend/                 # React analyst UI
├── backend/                  # Express REST API + AI/RAG
├── sample-data/              # Example mandate text for upload demos
├── docker-compose.yml        # Optional Postgres via Docker (port 5433)
├── .gitignore
├── README.md                 # Quick start and setup guide
└── PROJECT_DOCUMENTATION.md  # This file
```

| Path | Purpose |
| --- | --- |
| `frontend/` | All UI code, state management, API client |
| `backend/` | API server, database access, AI/RAG logic |
| `sample-data/northstar-mandate-pack.txt` | Sample mandate document for Document Analyzer |
| `docker-compose.yml` | Runs PostgreSQL 16 in Docker if you prefer containers over local Postgres |

---

## 4. Frontend folder (`frontend/`)

### 4.1 Overview

The frontend is a **single-page application (SPA)** built with **Vite** and **React**. It provides a modern enterprise healthcare UI with:

- Sidebar navigation and top bar
- Lazy-loaded routes for performance
- Redux Toolkit for global state (auth, claims, rules, assistant)
- Axios for REST API calls with JWT interceptors
- MUI (Material UI) for components and theming
- Recharts for dashboard visualizations

**Default URL:** `http://localhost:5173`  
**API proxy:** Vite proxies `/api` → `http://localhost:4000` (see `vite.config.ts`)

### 4.2 Frontend directory tree

```
frontend/
├── index.html                # HTML shell
├── package.json
├── vite.config.ts            # Dev server + API proxy
├── tsconfig.json
├── .env                      # VITE_API_URL=/api
└── src/
    ├── main.tsx              # App entry: Redux, Router, Theme, Toast
    ├── App.tsx               # Route definitions (lazy-loaded pages)
    ├── theme.ts              # MUI theme (colors, typography, component overrides)
    ├── index.css             # Global styles
    ├── vite-env.d.ts
    │
    ├── assets/               # Static images (favicon, etc.)
    │
    ├── components/           # Reusable UI building blocks
    ├── layouts/              # App shell (sidebar + top bar)
    ├── pages/                # One file per major screen
    ├── routes/               # Route guards (auth protection)
    ├── services/             # Axios API clients
    ├── store/                # Redux store and slices
    ├── hooks/                # Typed Redux hooks
    ├── types/                # TypeScript interfaces (mirrors API shapes)
    └── utils/                # Small helpers (formatting, etc.)
```

### 4.3 `src/main.tsx` — Application bootstrap

Loads:

- **Redux** `Provider` with the global store
- **MUI** `ThemeProvider` and `CssBaseline`
- **React Router** `BrowserRouter`
- **ToastProvider** for success/error notifications
- **Plus Jakarta Sans** font

### 4.4 `src/App.tsx` — Routing

| Route | Page | Description |
| --- | --- | --- |
| `/login` | `LoginPage` | Demo analyst sign-in |
| `/` | `DashboardPage` | KPIs, charts, review queue |
| `/claims` | `ClaimsExplorerPage` | Searchable claims table |
| `/claims/:id` | `ClaimDetailsPage` | Claim detail + AI analysis |
| `/assistant` | `AssistantPage` | Enterprise AI copilot |
| `/rules` | `RulesExplorerPage` | Mandate rules catalog |
| `/rules/compare` | `RuleComparePage` | Side-by-side rule comparison |
| `/rules/:id` | `RuleDetailsPage` | Single rule detail |
| `/documents` | `DocumentsPage` | Upload and analyze mandates |
| `/insights` | `InsightsPage` | AI insight cards and charts |

All routes except `/login` are wrapped in `ProtectedRoute` (requires JWT in localStorage).

Pages are **lazy-loaded** with `React.lazy()` to reduce initial bundle size.

### 4.5 `src/layouts/AppLayout.tsx`

The main application chrome:

- **Dark teal sidebar** with grouped navigation (Overview, Operations, Policy)
- **Icons** for each nav item (Dashboard, Claims, Copilot, Rules, etc.)
- **Sticky top bar** with app title, Demo chip, user avatar, Sign out
- **Responsive drawer** for mobile

### 4.6 `src/pages/` — Screen-level components

| File | Responsibility |
| --- | --- |
| `LoginPage.tsx` | Split login layout; dispatches `authSlice.login` |
| `DashboardPage.tsx` | Fetches `/api/insights`; KPI cards + Recharts |
| `ClaimsExplorerPage.tsx` | Filters, sort, pagination; loads claims via Redux |
| `ClaimDetailsPage.tsx` | Claim sections, timeline, Analyze with AI |
| `AssistantPage.tsx` | Thread list, prompt chips, chat UI, structured AI cards |
| `RulesExplorerPage.tsx` | Rules table with search/filter |
| `RuleDetailsPage.tsx` | Full rule text and Ask AI link |
| `RuleComparePage.tsx` | Two-rule picker + diff + AI summary |
| `DocumentsPage.tsx` | File upload, analysis results, indexed docs list |
| `InsightsPage.tsx` | Insight cards and trend charts |

### 4.7 `src/components/` — Shared UI

| Component | Purpose |
| --- | --- |
| `PageHeader.tsx` | Title, subtitle, breadcrumbs, action buttons |
| `KpiCard.tsx` | Dashboard metric card with accent bar |
| `StatusChip.tsx` | Approved / Rejected / Pending / Review chips |
| `AiResponseCard.tsx` | Structured AI answer with sources and confidence |
| `ConfidenceMeter.tsx` | Progress bar for AI confidence score |
| `SourceReferences.tsx` | Clickable chips linking to claims/rules |
| `EmptyState.tsx` | Friendly empty and error states |
| `ToastProvider.tsx` | Global snackbar notifications |

### 4.8 `src/services/` — API layer

| File | Endpoints used |
| --- | --- |
| `api.ts` | Axios instance + JWT interceptor + error helper |
| `authService.ts` | `POST /auth/login`, `GET /auth/me` |
| `claimService.ts` | `GET /claims`, `GET /claims/:id`, `POST /claims/:id/analyze` |
| `ruleService.ts` | `GET /rules`, `GET /rules/:id`, `POST /rules/compare` |
| `aiService.ts` | `POST /ai/chat`, conversation list/detail |
| `documentService.ts` | `POST /documents/upload`, `GET /documents` |
| `insightsService.ts` | `GET /insights` |

**JWT flow:**

1. Login stores token in `localStorage` as `ahca_token`.
2. `api.ts` interceptor adds `Authorization: Bearer <token>` to every request.
3. On 401, user is effectively logged out when session hydration fails.

### 4.9 `src/store/` — Redux state

| Slice | State managed |
| --- | --- |
| `authSlice.ts` | `token`, `user`, login status |
| `claimsSlice.ts` | Claims list, filters, selected claim, AI analysis |
| `rulesSlice.ts` | Rules list, filters, selected rule |
| `assistantSlice.ts` | Conversations, messages, active thread, loading |

**Design choice:** Only cross-page or shared data lives in Redux. Local UI state (drawers, form inputs, table page within URL) stays in component state or URL params.

### 4.10 `src/types/index.ts`

TypeScript interfaces for API responses:

- `Claim`, `MemberSummary`, `ProviderSummary`, `Rule`
- `AiResponse`, `AiSource`, `InsightsPayload`
- `Paginated<T>` for list endpoints

These mirror backend JSON shapes so the UI stays type-safe.

### 4.11 `src/theme.ts`

Defines the healthcare visual language:

- Primary teal (`#146072`), sage secondary
- Soft paper backgrounds, subtle borders instead of heavy shadows
- Plus Jakarta Sans typography
- Table header styling, button radius, chip weights

---

## 5. Backend folder (`backend/`)

### 5.1 Overview

The backend is an **Express 5** REST API written in **TypeScript**. It follows a layered architecture:

```
HTTP Request
  → Route (mount path + middleware)
  → Controller (parse request, call service)
  → Service (business logic, Prisma queries, AI calls)
  → Prisma Client → PostgreSQL
  → JSON Response
```

**Default URL:** `http://localhost:4000`  
**API prefix:** `/api`

### 5.2 Backend directory tree

```
backend/
├── package.json
├── tsconfig.json
├── .env                      # Secrets and config (not committed)
├── .env.example
├── prisma/
│   ├── schema.prisma         # Database models
│   ├── seed.ts               # Synthetic demo data
│   └── migrations/           # SQL migrations
├── uploads/                  # Uploaded mandate files
└── src/
    ├── index.ts              # Express app entry point
    │
    ├── routes/               # Route definitions
    ├── controllers/          # Thin HTTP handlers
    ├── services/             # Business logic
    ├── middleware/           # Auth, validation, errors
    ├── database/             # Prisma client singleton
    ├── models/               # Type documentation
    ├── ai/                   # LLM provider abstraction
    ├── rag/                  # Retrieval-augmented generation
    └── utils/                # Env, errors, helpers
```

### 5.3 `src/index.ts` — Server entry

Responsibilities:

- Load environment via `dotenv`
- Enable CORS for frontend origin
- Parse JSON bodies (max 2MB)
- Serve uploaded files from `/uploads`
- Mount routers under `/api/*`
- Global `errorHandler`
- Connect Prisma and listen on `PORT` (default 4000)

**Health check:** `GET /api/health` (no auth required)

### 5.4 `src/routes/` — API routing

| Router file | Mount path | Auth required |
| --- | --- | --- |
| `authRoutes.ts` | `/api/auth` | `/me` only |
| `claimRoutes.ts` | `/api/claims` | Yes |
| `ruleRoutes.ts` | `/api/rules` | Yes |
| `aiRoutes.ts` | `/api/ai` | Yes |
| `documentRoutes.ts` | `/api/documents` | Yes |
| `insightsRoutes.ts` | `/api/insights` | Yes |

### 5.5 `src/controllers/` — HTTP layer

Controllers are thin. They:

- Parse `req.body`, `req.query`, `req.params`
- Validate with Zod schemas (where applicable)
- Call the appropriate service
- Return JSON responses

| Controller | Main actions |
| --- | --- |
| `authController.ts` | `login`, `me` |
| `claimController.ts` | `list`, `getById`, `analyze` |
| `ruleController.ts` | `list`, `getById`, `compare` |
| `aiController.ts` | `chat`, `analyzeClaim`, conversations |
| `documentController.ts` | `upload`, `list`, `analyze` |
| `insightsController.ts` | `get` (dashboard aggregates) |

### 5.6 `src/services/` — Business logic

| Service | Responsibility |
| --- | --- |
| `authService.ts` | bcrypt password check, JWT sign/verify |
| `claimService.ts` | List/filter claims, serialize relations, run claim analysis |
| `ruleService.ts` | List/filter rules, compare two rules with AI summary |
| `aiService.ts` | Chat threads, persist messages, invoke RAG pipeline |
| `documentService.ts` | Upload, extract text, chunk, embed, store, analyze |
| `insightsService.ts` | Aggregate counts, trends, top rejection reasons |

**Example — claim analysis (`claimService.analyzeClaim`):**

1. Load claim with member, provider, applicable rule
2. Build focused RAG context for that claim + rule
3. Call `AIProvider.generate()`
4. Return structured analysis with `triggeredCondition`, `recommendations`

### 5.7 `src/middleware/`

| File | Purpose |
| --- | --- |
| `auth.ts` | `requireAuth` — validates JWT Bearer token |
| `validate.ts` | `validateBody(schema)` — Zod request validation |
| `errorHandler.ts` | Maps `HttpError` and unknown errors to JSON |

### 5.8 `src/database/prisma.ts`

Exports a singleton `PrismaClient` used across all services.

### 5.9 `src/ai/` — LLM provider abstraction

| File | Purpose |
| --- | --- |
| `types.ts` | `AIProvider` interface, `AiResponse` JSON shape |
| `MockAIProvider.ts` | Deterministic demo answers (no API key needed) |
| `LLMProvider.ts` | OpenAI-compatible `/chat/completions` |
| `providerFactory.ts` | Selects provider via `AI_PROVIDER` env var |
| `responseParser.ts` | Parses/coerces LLM JSON into `AiResponse` |

**Structured AI response shape:**

```json
{
  "answer": "string",
  "claimId": "CLM-1024",
  "ruleId": "MR-204",
  "confidence": 0.92,
  "sources": [{ "type": "rule", "id": "MR-204", "title": "Eligibility Rule" }],
  "recommendations": ["Review member eligibility"],
  "simpleExplanation": "optional plain-language summary"
}
```

### 5.10 `src/rag/` — Retrieval-augmented generation

| Module | Role |
| --- | --- |
| `chunking.ts` | Split long text into overlapping chunks |
| `embeddings.ts` | Mock hash embeddings or real API embeddings |
| `vectorSearch.ts` | Cosine similarity, top-K retrieval |
| `retrieval.ts` | Query claims, rules, document chunks from DB |
| `contextBuilder.ts` | Format retrieved items into prompt context |
| `promptBuilder.ts` | System + user messages with JSON instructions |
| `pipeline.ts` | End-to-end: question → retrieve → LLM → response |

**Vector storage:** Embeddings are stored as JSON arrays on `Claim`, `MandateRule`, and `DocumentChunk` records. Cosine similarity runs in application code (no pgvector required for the demo).

### 5.11 `prisma/` — Database layer

| File | Purpose |
| --- | --- |
| `schema.prisma` | Models, relations, enums |
| `seed.ts` | Demo users, members, providers, 48 claims, 14 rules, documents |
| `migrations/` | Versioned SQL schema changes |

**Seed commands:**

```bash
npx prisma migrate deploy   # or: npx prisma migrate dev
npm run prisma:seed
```

---

## 6. How frontend and backend communicate

### 6.1 Development setup

```
Browser → http://localhost:5173/claims
         → Axios GET /api/claims?page=1
         → Vite proxy → http://localhost:4000/api/claims
         → Express claimRouter → claimController → claimService → Prisma
```

### 6.2 Authentication flow

1. `POST /api/auth/login` with `{ email, password }`
2. Backend returns `{ token, user }`
3. Frontend stores `token` in `localStorage`
4. All subsequent requests include `Authorization: Bearer <token>`
5. `GET /api/auth/me` hydrates user on app load

**Demo credentials:** `analyst@demo.health` / `DemoPass123!`

### 6.3 Error handling

- Backend returns `{ error: string, details?: object }` with HTTP status codes
- Frontend `getErrorMessage()` extracts messages for toasts and error states
- List pages offer **Retry** on failure

---

## 7. Database design

### 7.1 Entity relationship (simplified)

```
Member ──< Claim >── Provider
              │
              └── MandateRule (optional applicableRule)

Document ──< DocumentChunk

AiConversation ──< AiMessage

User (standalone, for auth)
```

### 7.2 Main tables

| Table | Description |
| --- | --- |
| `User` | Demo analyst accounts |
| `Member` | Synthetic members (plan, eligibility) |
| `Provider` | Pharmacies, hospitals, infusion centers |
| `Claim` | Claims with status, amounts, timeline JSON |
| `MandateRule` | PBM mandate rules (MR-204, MR-305, etc.) |
| `Document` | Uploaded mandate files + AI summary fields |
| `DocumentChunk` | Text chunks + embedding vectors for RAG |
| `AiConversation` | Copilot thread metadata |
| `AiMessage` | User/assistant messages + structured JSON |

### 7.3 Prisma table names

Prisma creates **PascalCase** table names in PostgreSQL (e.g. `"Claim"`, `"MandateRule"`). Use double quotes in raw SQL in pgAdmin.

---

## 8. AI and RAG architecture

### 8.1 Pipeline diagram

```
User question
    │
    ▼
processQuery()          ← normalize whitespace
    │
    ▼
embedText()             ← mock hash vector or LLM embedding API
    │
    ▼
retrieveRelevantContext() ← cosine similarity over claims, rules, chunks
    │
    ▼
buildContext()          ← format top-K hits as text
    │
    ▼
buildPrompt()           ← system + user messages (JSON schema instructions)
    │
    ▼
AIProvider.generate()   ← MockAIProvider or LLMProvider
    │
    ▼
coerceAiResponse()      ← validate/parse structured JSON
    │
    ▼
UI (AiResponseCard)     ← answer, sources, confidence, actions
```

### 8.2 Mock vs real LLM

| Mode | Env | Behavior |
| --- | --- | --- |
| Mock (default) | `AI_PROVIDER=mock` | Works offline; deterministic answers using claim/rule IDs in question |
| Real LLM | `AI_PROVIDER=llm` + `LLM_API_KEY` | Calls OpenAI-compatible chat API with JSON response format |

---

## 9. API reference summary

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Service health (public) |
| POST | `/auth/login` | Sign in |
| GET | `/auth/me` | Current user |
| GET | `/claims` | List claims (search, filter, paginate) |
| GET | `/claims/:id` | Claim detail |
| POST | `/claims/:id/analyze` | AI analysis for one claim |
| GET | `/rules` | List mandate rules |
| GET | `/rules/:id` | Rule detail |
| POST | `/rules/compare` | Compare two rules + AI summary |
| POST | `/ai/chat` | Copilot message |
| POST | `/ai/analyze-claim` | Analyze by body `{ claimId }` |
| GET | `/ai/conversations` | List threads |
| GET | `/ai/conversations/:id` | Thread messages |
| GET | `/documents` | List documents |
| POST | `/documents/upload` | Multipart file upload |
| POST | `/documents/analyze` | Analyze by `{ documentId }` |
| GET | `/insights` | Dashboard aggregates |

---

## 10. Environment variables

### Backend (`backend/.env`)

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `DATABASE_URL` | `postgresql://ahca:ahca_demo@localhost:5432/ahca` | Postgres connection |
| `JWT_SECRET` | long random string | JWT signing |
| `DEMO_USER_EMAIL` | `analyst@demo.health` | Seeded user |
| `DEMO_USER_PASSWORD` | `DemoPass123!` | Seeded password |
| `AI_PROVIDER` | `mock` or `llm` | AI mode |
| `LLM_API_KEY` | (empty for mock) | Server-side only |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | LLM endpoint |
| `LLM_MODEL` | `gpt-4o-mini` | Chat model |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |

### Frontend (`frontend/.env`)

| Variable | Value | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Axios base URL (uses Vite proxy in dev) |

---

## 11. Running the application

### Prerequisites

- Node.js 20+
- PostgreSQL (local Homebrew on port **5432**, or Docker on **5433**)

### Backend

```bash
cd ai-healthcare-claims-assistant/backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd ai-healthcare-claims-assistant/frontend
npm install
npm run dev
```

Open **http://localhost:5173** and sign in with the demo account.

---

## 12. Using pgAdmin with this project

pgAdmin can connect to the same PostgreSQL database the API uses.

| Field | Value (local Homebrew setup) |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `ahca` |
| Username | `ahca` |
| Password | `ahca_demo` |

If using Docker Compose instead, use port **5433**.

**Useful queries:**

```sql
SELECT * FROM "Claim" WHERE "claimId" = 'CLM-1024';
SELECT * FROM "MandateRule" WHERE "ruleId" IN ('MR-204', 'MR-305');
SELECT "status", COUNT(*) FROM "Claim" GROUP BY "status";
```

---

## 13. Key demo data

| ID | Description |
| --- | --- |
| `CLM-1024` | Rejected claim — eligibility not satisfied |
| `MR-204` | Eligibility verification for specialty pharmacy (no PA required) |
| `MR-305` | Specialty PA + eligibility combined |
| `analyst@demo.health` | Demo login user |

The seed script creates **48 claims**, **14 mandate rules**, **8 members**, **5 providers**, **1 pre-indexed document**, and a sample copilot conversation.

---

## 14. Feature-to-file map

| Feature | Frontend | Backend |
| --- | --- | --- |
| Login | `pages/LoginPage.tsx`, `store/slices/authSlice.ts` | `services/authService.ts`, `routes/authRoutes.ts` |
| Dashboard | `pages/DashboardPage.tsx` | `services/insightsService.ts` |
| Claims list | `pages/ClaimsExplorerPage.tsx`, `store/slices/claimsSlice.ts` | `services/claimService.ts` |
| Claim detail + AI | `pages/ClaimDetailsPage.tsx`, `components/AiResponseCard.tsx` | `claimService.analyzeClaim()` |
| Copilot | `pages/AssistantPage.tsx`, `store/slices/assistantSlice.ts` | `rag/pipeline.ts`, `services/aiService.ts` |
| Rules | `pages/RulesExplorerPage.tsx`, `RuleDetailsPage.tsx` | `services/ruleService.ts` |
| Rule compare | `pages/RuleComparePage.tsx` | `ruleService.compareRules()` |
| Documents | `pages/DocumentsPage.tsx` | `services/documentService.ts`, `rag/chunking.ts` |
| Insights | `pages/InsightsPage.tsx` | `services/insightsService.ts` |
| Theming / layout | `theme.ts`, `layouts/AppLayout.tsx` | — |

---

## 15. Connecting a real LLM later

1. Set in `backend/.env` only:
   ```bash
   AI_PROVIDER=llm
   LLM_API_KEY=your-key-here
   LLM_BASE_URL=https://api.openai.com/v1
   LLM_MODEL=gpt-4o-mini
   ```
2. Restart the backend (`npm run dev`).
3. No frontend changes required.

Optional: set `EMBEDDING_MODEL` for real embedding vectors when `AI_PROVIDER=llm`.

---

## 16. Security and data notes

- **Never** commit `.env` files with real secrets.
- **Never** put `LLM_API_KEY` in frontend code or `VITE_*` variables.
- All mutating API routes validate input with Zod.
- JWT protects all data endpoints except login and health.
- This is a **demo/portfolio** app — not production HIPAA infrastructure.
- Use **synthetic data only** for development and demos.

---

## Document history

| Date | Change |
| --- | --- |
| Sep 2026 | Initial documentation — frontend/backend structure, AI/RAG, API, pgAdmin |

---

*For quick setup instructions, see [README.md](./README.md).*
