import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { calculate, CalculationError } from "./calculator";

/**
 * Builds the Express application exposing the calculator API.
 *
 * Endpoint: `POST /api/calculations`
 *   Request body:  { "formula": "2 + 3" }
 *   Success (200): { "result", "formula", "formattedExpression" }
 *   Rejection (400): { "error": "<message>" }
 *
 * Any error not raised by `calculate` itself (e.g. an oversized request
 * body from `express.json()`, or an unexpected bug) is caught by the final
 * error-handling middleware below, logged server-side, and answered with a
 * generic `{ "error": "..." }` body — never the underlying stack trace.
 */
export function createApp(): Express {
  const app = express();
  // Allows the standalone frontend (served from a different origin/port
  // during development) to call this API from the browser.
  app.use(cors());
  app.use(express.json());

  app.post("/api/calculations", (req: Request, res: Response) => {
    const formula = (req.body ?? {}).formula;

    try {
      const calculation = calculate(formula);
      res.status(200).json(calculation);
    } catch (error) {
      if (error instanceof CalculationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  // Final safety net: catches anything not already handled above (e.g. a
  // body-parser error such as an oversized payload, or an unexpected bug).
  // Never exposes the error's stack trace or message to the client, since
  // Express's default error handler would otherwise echo them verbatim.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
    res.status(status).json({ error: "The request could not be processed." });
  });

  return app;
}
