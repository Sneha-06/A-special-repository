# Architecture

## Overview

ACRA follows a classic three-tier architecture: React SPA → Express REST API → PostgreSQL, with OpenAI and GitHub as external services.

```
┌─────────────┐     REST      ┌─────────────┐     Prisma    ┌────────────┐
│   React     │ ────────────► │   Express   │ ────────────► │ PostgreSQL │
│   (Vite)    │               │   API       │               │            │
└─────────────┘               └──────┬──────┘               └────────────┘
                                     │
                        ┌────────────┼────────────┐
                        ▼            ▼            ▼
                   OpenAI API   GitHub API   Rate Limiter
```

## Backend Layers

| Layer | Responsibility |
|-------|----------------|
| **Routes** | HTTP routing, middleware attachment |
| **Controllers** | Request/response mapping (thin) |
| **Services** | Business logic, AI orchestration, GitHub calls |
| **Validators** | Zod schemas for request and AI response validation |
| **Middleware** | Error handling, rate limiting, CORS, Helmet |

### AI Pipeline

1. Client sends `POST /api/analysis/analyze` with source code and analysis type
2. `analysisService` creates a `CodeSession` record (status: PROCESSING)
3. `analyzer` builds type-specific prompts and calls OpenAI with `response_format: json_object`
4. Response is validated against `aiAnalysisResponseSchema`
5. Findings are persisted; session updated to COMPLETED
6. Structured result returned to client

All OpenAI calls happen server-side. The API key is loaded from `OPENAI_API_KEY` environment variable only.

## Frontend Architecture

Feature-based modules under `src/features/`:

- **workspace** — Monaco editor, analysis toolbar, findings panel, diff viewer
- **dashboard** — Metrics cards and Recharts visualizations

Global state (Redux Toolkit) manages workspace editor state. Server data is fetched via Axios service layer.

## Data Model

- **CodeSession** — Central entity storing source code, analysis type, AI output, and generated artifacts
- **Finding** — Structured issue linked to a session (severity, category, line numbers)
- **Repository / PullRequest** — GitHub metadata (optional linkage to sessions)

## Security

- Helmet for HTTP headers
- CORS restricted to configured origin
- General and AI-specific rate limiters
- No secrets in frontend bundle
- Input size limits (100KB source code, 2MB JSON body)
