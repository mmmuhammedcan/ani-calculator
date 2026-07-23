# Calculator API (backend)

A small REST API that evaluates a mathematical formula and returns its
result. Built with TypeScript and Express, developed using ATDD: every
feature starts as a Gherkin scenario under `docs/features/`, verified by
Cucumber acceptance tests that call the running API over real HTTP.

## Requirements

- Node.js 18+
- npm

## Install

```bash
npm install
```

## Run the server

```bash
npm start
```

Starts the API on `http://localhost:3000`. Use a different port with:

```bash
PORT=4000 npm start
```

## Run the tests

```bash
npm test
```

Runs the Cucumber acceptance suite (`docs/features/**/*.feature`). The
suite boots its own instance of the server on a random free port for each
run, so it does not require the server from `npm start` to be running
separately. To run the tests against an already-running server instead,
set `BASE_URL` (e.g. `BASE_URL=http://localhost:3000 npm test`).

## API

### `POST /api/calculations`

Request body:

```json
{ "formula": "2 + (3 - 1) * 4" }
```

Success — `200`:

```json
{
  "result": 10,
  "formula": "2 + (3 - 1) * 4",
  "formattedExpression": "2 + (3 - 1) * 4 = 10"
}
```

Rejected formula — `400`:

```json
{ "error": "Division by zero is not allowed: 5 / 0" }
```

Unexpected error (e.g. request body too large) — status depends on the
error, body is always generic; the real cause is only logged server-side:

```json
{ "error": "The request could not be processed." }
```

CORS is enabled so the sibling `../frontend` app (or any browser client)
can call this API from a different origin during development.

### Supported formulas

- Operators `+ - * /` with standard precedence; parentheses `(...)` to
  override it, including nested parentheses.
- A `-` directly before a number or an opening parenthesis is a negation
  (`-5`, `-(2 + 3)`), not a separate operator.
- Operands and results must be integers; division must divide evenly and
  never by zero.
- Number literals must fall within JavaScript's safe integer range, and
  parenthesis/unary-minus nesting is capped at a safe depth — both are
  rejected as an invalid formula rather than causing a server error.

See `docs/features/calculator.feature` and
`docs/features/calculator_parentheses.feature` for the full set of
scenarios.

## Project structure

- `src/` — application source (`calculator.ts` parsing/evaluation logic,
  `app.ts` Express app, `server.ts` HTTP server bootstrap).
- `docs/features/` — Gherkin feature files (the acceptance criteria).
- `tests/steps/`, `tests/support/` — Cucumber step definitions, World, and
  server lifecycle hooks.

See `AGENTS.md` for development conventions.
