import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

/**
 * HTTP response captured from a real call to the running API,
 * or the error thrown while trying to reach it (e.g. connection refused
 * because the feature is not implemented yet).
 */
export interface CapturedResponse {
  status: number;
  body: any;
}

export class CalculatorWorld extends World {
  /** Base URL of the running Calculator API, used for real end-to-end HTTP calls. */
  readonly baseUrl: string;

  formula = '';
  response?: CapturedResponse;
  requestError?: Error;

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = process.env.CALCULATOR_API_BASE_URL ?? 'http://localhost:3000';
  }
}

setWorldConstructor(CalculatorWorld);
