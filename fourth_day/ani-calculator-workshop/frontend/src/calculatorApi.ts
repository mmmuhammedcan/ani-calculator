const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export interface CalculationResult {
  result: number;
  formula: string;
  formattedExpression: string;
}

interface ErrorBody {
  error: string;
}

export async function calculate(formula: string): Promise<CalculationResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/calculations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formula })
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const body = (await response.json()) as CalculationResult | ErrorBody;

  if (!response.ok) {
    throw new Error("error" in body ? body.error : "The request could not be processed.");
  }

  return body as CalculationResult;
}
