# AI Healthcare Claims Assistant

Enterprise-style, AI-assisted healthcare/PBM claims analysis platform. Analysts can search synthetic claims, understand approval and rejection rationale, explore mandate rules, compare policies, analyze documents, and ask a retrieval-augmented copilot.

**This project uses synthetic demo data only. It is not a medical device, not HIPAA-certified, and must never be loaded with real patient data or PHI.**

## 1. Project overview

`ai-healthcare-claims-assistant` is a full-stack portfolio application:

- React + TypeScript analyst UI (MUI, Redux Toolkit, Recharts)
- Express + TypeScript REST API
- PostgreSQL persistence (Prisma)
- Mock-first LLM layer with a pluggable OpenAI-compatible provider
- RAG pipeline: chunking, embeddings, vector search, context construction, structured JSON answers

## 2. Features

- Operations dashboard (volumes, status mix, rejection trend, top reasons)
- Claims explorer with search, filters, sort, and pagination
- Claim details with processing timeline and **Analyze with AI**
- Enterprise copilot (not a consumer chatbot clone)
- Mandate/rules explorer, rule detail, and side-by-side comparison with AI summary
- Document upload, extraction, chunking, and semantic indexing
- AI insights across claims and rules
- Demo JWT authentication

## 3. Screenshots

Add product screenshots here after running the app locally:

- Dashboard
- Claims explorer
- Claim details + AI analysis
- Copilot
- Rule comparison
- Document analyzer

## 4. Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, MUI, Redux Toolkit, React Router, Axios, Recharts |
| Backend | Node.js, Express, TypeScript, Zod, JWT, Multer |
| Database | PostgreSQL, Prisma |
| AI | `AIProvider` interface, `MockAIProvider`, `LLMProvider`, embeddings, RAG |

## 5. Architecture

```
Frontend (Vite :5173)
    Axios + JWT
Backend (Express :4000)
    Prisma
PostgreSQL (:5433 via Docker)
    RAG modules + AIProvider
```

Frontend never receives LLM keys. The API validates input, loads claims/rules/documents, and returns structured AI payloads.

## 6. AI / RAG architecture

```
User question
  → query processing
  → embed query
  → cosine similarity over claim, rule, and document-chunk vectors
  → retrieve top-k records
  → context construction
  → prompt construction (JSON schema)
  → AIProvider (mock or LLM)
  → structured AiResponse
  → UI (answer, sources, confidence, recommendations)
```

Key modules:

- `backend/src/rag/chunking.ts`
- `backend/src/rag/embeddings.ts`
- `backend/src/rag/vectorSearch.ts`
- `backend/src/rag/retrieval.ts`
- `backend/src/rag/contextBuilder.ts`
- `backend/src/rag/promptBuilder.ts`
- `backend/src/rag/pipeline.ts`
- `backend/src/ai/MockAIProvider.ts`
- `backend/src/ai/LLMProvider.ts`
- `backend/src/ai/providerFactory.ts`

Vectors are stored as JSON on `document_chunks`, claims, and rules so the demo runs without `pgvector`. That extension is a natural production upgrade.

## 7. Database design

Prisma models in `backend/prisma/schema.prisma`:

- `users` — demo analysts
- `members`, `providers`, `claims`
- `mandate_rules`
- `documents`, `document_chunks`
- `ai_conversations`, `ai_messages`

Seed data includes **CLM-1024** (rejected under **MR-204**) and a comparable **MR-305** authorization rule.

## 8. API documentation

Base URL: `http://localhost:4000/api`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/login` | Demo sign-in |
| GET | `/auth/me` | Current user |
| GET | `/claims` | Search/filter/paginate claims |
| GET | `/claims/:id` | Claim detail (`CLM-1024`) |
| POST | `/claims/:id/analyze` | AI claim analysis |
| GET | `/rules` | Mandate catalog |
| GET | `/rules/:id` | Rule detail |
| POST | `/rules/compare` | Side-by-side + AI summary |
| POST | `/ai/chat` | RAG copilot |
| POST | `/ai/analyze-claim` | Analyze by body `{ claimId }` |
| GET | `/ai/conversations` | Thread list |
| POST | `/documents/upload` | Multipart file ingest |
| POST | `/documents/analyze` | `{ documentId }` |
| GET | `/insights` | Dashboard / insight aggregates |
| GET | `/health` | Liveness (no auth) |

All routes other than `/auth/login` and `/health` require `Authorization: Bearer <token>`.

## 9. Installation

Prerequisites: Node.js 20+, npm, and **Docker Desktop** (PostgreSQL is provided via `docker-compose.yml` on port **5433**).

```bash
cd ai-healthcare-claims-assistant
docker compose up -d
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
cd ../frontend
cp .env.example .env
npm install
```

## 10. Environment variables

Backend (`backend/.env`):

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret for analyst sessions |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD` | Seeded analyst |
| `AI_PROVIDER` | `mock` (default) or `llm` |
| `LLM_API_KEY` | Server-side only; never expose to the frontend |
| `LLM_BASE_URL` | OpenAI-compatible base, e.g. `https://api.openai.com/v1` |
| `LLM_MODEL` | Chat model |
| `EMBEDDING_MODEL` | Embedding model when `AI_PROVIDER=llm` |
| `CORS_ORIGIN` | Frontend origin |

Frontend:

| Name | Purpose |
| --- | --- |
| `VITE_API_URL` | `/api` (Vite proxy) or absolute API URL |

## 11. Running the frontend

```bash
cd ai-healthcare-claims-assistant/frontend
npm run dev
```

Open http://localhost:5173

Demo login: `analyst@demo.health` / `DemoPass123!`

## 12. Running the backend

```bash
cd ai-healthcare-claims-assistant/backend
npm run dev
```

API: http://localhost:4000/api/health

## 13. Sample AI queries

- Why was claim CLM-1024 rejected?
- What rule applies to this claim?
- What are the eligibility requirements?
- Compare Rule MR-204 and MR-305.
- Which claims were rejected because of eligibility?
- Explain this rejection in simple terms.
- What should be reviewed before resubmitting this claim?

## 14. Future enhancements

- `pgvector` (or a dedicated vector store) instead of in-process cosine search
- Production PDF OCR / layout parsing
- SSO and role-based access
- Audit logging and immutable adjudication trails
- Cloud deployment and CI
- Evaluation harness for RAG answer quality

**Connecting a real LLM later:** set `AI_PROVIDER=llm`, `LLM_API_KEY`, optional `LLM_BASE_URL` and `LLM_MODEL` in `backend/.env` only. Restart the API. The frontend does not change.

## License

Demo / portfolio use. Synthetic data only.
