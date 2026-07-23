# ani-calculator-workshop

A calculator, split into two independent projects:

- **[`backend/`](backend/README.md)** — the REST API (TypeScript +
  Express), built with ATDD: Gherkin scenarios under
  `backend/docs/features/`, verified by Cucumber acceptance tests.
- **[`frontend/`](frontend/README.md)** — a pixel-art styled, single-page
  calculator UI (React + TypeScript / Vite) that calls the API. Not built
  with ATDD.

## Quick start

```bash
# terminal 1 — API on http://localhost:3000
cd backend && npm install && npm start

# terminal 2 — UI on http://localhost:5173
cd frontend && npm install && npm run dev
```

See each project's own README for details (API contract, supported
formula syntax, testing, build).

## Other files in this folder

- `AGENTS.md` (inside `backend/`) — development conventions for the API.
- `PROMPTS.md` — the prompts driving this workshop's development,
  restated clearly.
- `REVIEW.md` — the code review notes (edge cases, security, performance,
  business-rule alignment) written during this workshop.
