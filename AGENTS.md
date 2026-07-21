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

## Testing

- Acceptance tests are written and run with **Cucumber**
  (`@cucumber/cucumber`). No other test framework is used.
- Steps are executed via `ts-node`, so tests run directly against the
  TypeScript sources without a separate build step.
- Acceptance tests are **end-to-end**: steps exercise the API by making
  **real HTTP requests** (via the built-in `fetch`), never by calling
  internal functions directly.
- Run the suite with `npm test` (alias: `npm run test:acceptance`).
- Because we follow ATDD, tests are written before the implementation and
  are expected to fail (red phase) until the feature is built.

## HTTP API Contract

The acceptance tests assume the following contract for the calculator
service (adjust the tests if the contract changes):

- **Endpoint**: `POST /api/calculations`
- **Request body**: `{ "formula": "2 + 3" }`
- **Success** (HTTP `200`):
  `{ "result": 5, "formula": "2 + 3", "formattedExpression": "2 + 3 = 5" }`
- **Rejection** (HTTP `400`): `{ "error": "<message>" }`

## Test Server Contract

To keep the suite self-contained, the tests try to boot the app before the
run and shut it down afterwards. The application should expose a
`startServer` entry point at `src/server.ts`:

```ts
export async function startServer(port?: number): Promise<{
  url: string;              // base URL the server is listening on
  close: () => Promise<void>;
}>;
```

- Passing port `0` lets the OS pick a free port for isolated runs.
- Alternatively, set the `BASE_URL` environment variable to run the tests
  against an already-running server; when set, the suite does not boot its
  own server.

## Project Structure

- `docs/features/**/*.feature` — Gherkin feature files.
- `tests/steps/**/*.ts` — Cucumber step definitions.
- `tests/support/**/*.ts` — Cucumber World and hooks (server lifecycle).
- `src/**/*.ts` — application source code.

## Project Conventions

- Gherkin `.feature` files live under a dedicated folder in `docs/`.
- Keep the scope minimal: a single calculator service for now.
