import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";

/**
 * Shape of the JSON body returned by the calculator API.
 * Kept intentionally permissive so the tests can assert on individual
 * fields regardless of whether the request succeeded or was rejected.
 */
export interface CalculationResponseBody {
  result?: number;
  formula?: string;
  formattedExpression?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Custom Cucumber World that drives the calculator API over real HTTP.
 * Every scenario gets a fresh instance, so the captured response state
 * never leaks between scenarios.
 */
export class CalculatorWorld extends World {
  /** Base URL of the running API under test. */
  public readonly baseUrl: string;

  /** HTTP status code of the last calculation request. */
  public statusCode?: number;

  /** Parsed JSON body of the last calculation request. */
  public body: CalculationResponseBody = {};

  /** Raw text body, kept for debugging when the response is not JSON. */
  public rawBody = "";

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  }

  /**
   * Sends a real HTTP request to the calculator endpoint and stores the
   * response so the `Then` steps can assert on it.
   */
  public async calculate(formula: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/calculations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formula })
    });

    this.statusCode = response.status;

    this.rawBody = await response.text();
    try {
      this.body = this.rawBody
        ? (JSON.parse(this.rawBody) as CalculationResponseBody)
        : {};
    } catch {
      // The endpoint returned a non-JSON body (e.g. it is not implemented
      // yet). Leave `body` empty so the assertions fail meaningfully.
      this.body = {};
    }
  }
}

setWorldConstructor(CalculatorWorld);
