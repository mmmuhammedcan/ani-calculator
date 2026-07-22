import express, { Express, Request, Response } from "express";
import { calculate, CalculationError } from "./calculator";

/**
 * Builds the Express application exposing the calculator API.
 *
 * Endpoint: `POST /api/calculations`
 *   Request body:  { "formula": "2 + 3" }
 *   Success (200): { "result", "formula", "formattedExpression" }
 *   Rejection (400): { "error": "<message>" }
 */
export function createApp(): Express {
  const app = express();
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

  return app;
}
