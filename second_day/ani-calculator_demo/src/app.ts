import express, { Express, Request, Response } from 'express';
import { calculate, FormulaError } from './calculator';

/**
 * Builds the Express application for the Calculator API.
 * Kept separate from `index.ts` (which starts the HTTP server) so it can
 * also be used directly in-process if ever needed.
 */
export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.post('/calculate', (req: Request, res: Response) => {
    const formula = typeof req.body?.formula === 'string' ? req.body.formula : '';

    try {
      const result = calculate(formula);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof FormulaError) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}
