# Calculator UI (frontend)

A single-page, pixel-art styled calculator built with React + TypeScript
(Vite). It has a screen showing the formula/result and a button pad
(digits, `+ - * /`, `( )`, `C`, `⌫`, `=`). Pressing `=` sends the current
formula to the backend and shows the returned result or error message.
This part is not built with ATDD/Gherkin — it's a plain UI on top of the
`../backend` API.

## Requirements

- Node.js 18+
- npm
- The backend running on `http://localhost:3000` (see `../backend`,
  `npm start`). CORS is already enabled there for this app.

## Install & run

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`.

## Build

```bash
npm run build
```

Type-checks (`tsc -b`) and produces a production build in `dist/`.

## Project structure

- `src/App.tsx` — calculator UI: keypad state machine and layout.
- `src/calculatorApi.ts` — thin `fetch` wrapper around
  `POST /api/calculations`.
- `src/App.css`, `src/index.css` — the pixel-art styling.
