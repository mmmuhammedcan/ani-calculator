# AGENTS.md

Guidelines for developing this project. All agents and contributors must follow these rules.

## Project Overview

A simple REST API. For now it exposes a single service that works like a basic
calculator, performing arithmetic calculations.

## Development Methodology

- We use **ATDD (Acceptance Test Driven Development)**.
- Before implementing any feature, we first write acceptance criteria together in
  **Gherkin** format.
- Feature work flows from Gherkin scenarios → acceptance tests → implementation.

## Language

- **Everything must be written in English**: documentation, code, comments,
  commit messages, Gherkin features, etc.

## Tech Stack

- The project is developed with **TypeScript**.
- The HTTP layer is built with **Express.js**.

## Project Conventions

- Gherkin `.feature` files live under a dedicated folder in `docs/` (`docs/features/`).
- Keep the scope minimal: a single calculator service for now.

## Test Infrastructure (Acceptance Tests)

- Acceptance tests are written with **Cucumber** (`@cucumber/cucumber`) and **TypeScript**
  only. No other test framework (Jest, Mocha, etc.) is used.
- Assertions use Node's built-in `node:assert/strict` — no extra assertion library.
- HTTP calls use Node's native `fetch` — no extra HTTP client library.
- Step definitions send **real HTTP requests** to a running instance of the API
  (true end-to-end, no mocking/stubbing of the server).
- Layout:
  - `docs/features/*.feature` — Gherkin scenarios (source of truth for acceptance criteria).
  - `test/step-definitions/*.steps.ts` — step definitions implementing the Gherkin steps.
  - `test/support/world.ts` — Cucumber `World` holding the base URL and the last HTTP response.
  - `test/support/hooks.ts` — `BeforeAll`/`AfterAll` hooks; if the API isn't already running,
    they try to boot it via `npm start` and poll it for readiness before the scenarios run.
  - `cucumber.js` — Cucumber configuration (feature paths, `ts-node` registration).
- Run the acceptance tests with `npm test`.
- Base URL defaults to `http://localhost:3000`; override with the
  `CALCULATOR_API_BASE_URL` environment variable (e.g. for CI or a different port).
- Until the API is implemented, scenarios are expected to **fail** (connection refused);
  this is the expected ATDD "red" state before implementation exists. Once implemented
  (see the Implementation section below), all scenarios pass (the ATDD "green" state).

## API Contract

- `POST /calculate`
  - Request body: `{ "formula": string }`
  - Success: `200 OK` with body `{ "formula": string, "result": number, "expression": string }`
  - Rejection (invalid formula, empty formula, non-integer result, division by zero):
    a `4xx` status with body `{ "error": string }`, where `error` matches the messages in
    `docs/features/calculator.feature`.

## Implementation

- `src/calculator.ts` — pure formula parsing/evaluation logic (tokenizes, validates, and
  computes results with `*`/`/` before `+`/`-`, left to right, no parentheses).
- `src/app.ts` — Express app exposing `POST /calculate` per the API Contract above.
- `src/index.ts` — starts the HTTP server (`PORT` env var, defaults to `3000`).
- Run the API with `npm start` (uses `ts-node` directly) or build with `npm run build` and
  run the compiled output from `dist/`.
- `npm run serve` runs the already-built `dist/src/index.js` (production-style start,
  no `ts-node`).
- `npm run deploy` builds and then serves: `npm run build && npm run serve`.
