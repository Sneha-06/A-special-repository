# Architecture Overview

## System Context

```
Browser (React + MUI + Redux)
    │ Axios REST / SSE
    ▼
Express API (TypeScript + Zod + Helmet)
    │ Prisma ORM
    ▼
PostgreSQL 16
    ▲
    │ OpenAI chat/completions (server-side only)
    └── AI Service Layer
```

## Layer Responsibilities

### Frontend (`frontend/src/`)

| Directory | Role |
|-----------|------|
| `pages/` | Route-level containers with data loading |
| `components/` | Reusable UI (common, dashboard, requirements, testCases, coverage, history) |
| `services/` | Axios API clients — no business logic |
| `store/` | Redux slices for dashboard and health (minimal global state) |
| `types/` | Shared TypeScript interfaces |
| `utils/export/` | Reusable CSV, Excel, JSON, PDF export utilities |

Most feature pages use local React state + service calls. Redux is reserved for shared dashboard/health data.

### Backend (`backend/src/`)

| Directory | Role |
|-----------|------|
| `routes/` | Express route definitions + middleware chain |
| `controllers/` | Thin HTTP handlers via `asyncHandler` |
| `services/` | Business logic, Prisma queries, AI orchestration |
| `services/ai/` | Modular OpenAI prompt builders and response validation |
| `validators/` | Zod schemas for request/response validation |
| `middleware/` | Error handling, logging, rate limiting, 404 |
| `utils/` | Env config, Prisma client, AI JSON helpers, sanitization |

## AI Generation Pattern

Every AI feature follows the same flow:

1. Controller receives validated request body
2. Service loads domain context from Prisma
3. Service creates `GenerationHistory` entry (`PROCESSING`)
4. AI module builds system + user prompts, calls OpenAI
5. Response parsed via `extractJsonFromAi` and validated with Zod
6. Results persisted to domain tables
7. History updated to `COMPLETED` or `FAILED`

## Data Model

```
User ──< Project ──< Requirement ──┬──< RequirementAnalysis
                                 ├──< AcceptanceCriteria
                                 ├──< SyntheticTestData
                                 ├──< TestCase ──┬──< TestStep
                                 │               ├──< TestData
                                 │               └──< AutomationCode
                                 └──< GenerationHistory
```

- JSON fields on `RequirementAnalysis` and `GenerationHistory` store structured AI output
- Cascade deletes from Project → Requirement → child entities
- `GenerationType` enum tracks all AI operation types including `COVERAGE_ANALYSIS`

## Security

- `OPENAI_API_KEY` is server-side only (`backend/.env`)
- Frontend uses `VITE_API_URL` — no AI credentials
- `sanitizeHistoryPayload()` redacts secret-like keys before API responses
- Helmet, CORS, rate limiting on API and AI routes
- bcrypt password hashes on `User` model

## Testing Strategy

- **Unit tests** — AI validators, coverage metrics, history sanitization, export utilities
- **API tests** — Supertest against `createApp()` for health and 404 routes
- **Mocked OpenAI** — injectable callers and `vi.mock` on `callOpenAiJson`; no real API calls in CI

## Deployment

Docker Compose runs three services: `postgres`, `backend`, `frontend` (nginx).
Backend runs Prisma migrations on container start.
