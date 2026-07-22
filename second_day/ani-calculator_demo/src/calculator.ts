/**
 * Core arithmetic-formula evaluation logic for the Calculator API.
 *
 * Supports the four basic operations with standard operator precedence
 * (`*` and `/` before `+` and `-`), no parentheses. Operands are
 * non-negative integers; results may be negative. Division must produce
 * an exact integer result.
 */

/** Thrown for any formula that must be rejected by the API (HTTP 400). */
export class FormulaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaError';
  }
}

export interface CalculationResult {
  formula: string;
  result: number;
  expression: string;
}

const OPERAND_PATTERN = /^\d+$/;
const OPERATOR_PATTERN = /^[+\-*/]$/;

function isValidFormula(tokens: string[]): boolean {
  if (tokens.length === 0 || tokens.length % 2 === 0) {
    return false;
  }
  return tokens.every((token, index) =>
    index % 2 === 0 ? OPERAND_PATTERN.test(token) : OPERATOR_PATTERN.test(token),
  );
}

/**
 * Parses and evaluates a formula, returning its result and a formatted
 * expression. Throws a {@link FormulaError} for any formula that must be
 * rejected.
 */
export function calculate(rawFormula: string): CalculationResult {
  const formula = rawFormula.trim();

  if (formula === '') {
    throw new FormulaError('The formula must not be empty');
  }

  const tokens = formula.split(/\s+/);

  if (!isValidFormula(tokens)) {
    throw new FormulaError(`The formula is not valid: ${formula}`);
  }

  const numbers = tokens.filter((_, index) => index % 2 === 0).map((token) => Number(token));
  const operators = tokens.filter((_, index) => index % 2 === 1);

  // First pass: resolve `*` and `/` (higher precedence), collapsing each
  // multiplication/division into the running number to its left.
  const reducedNumbers: number[] = [numbers[0]];
  const reducedOperators: string[] = [];

  operators.forEach((operator, index) => {
    const rightOperand = numbers[index + 1];

    if (operator === '*') {
      reducedNumbers[reducedNumbers.length - 1] *= rightOperand;
      return;
    }

    if (operator === '/') {
      const leftOperand = reducedNumbers[reducedNumbers.length - 1];

      if (rightOperand === 0) {
        throw new FormulaError(`Division by zero is not allowed: ${formula}`);
      }
      if (leftOperand % rightOperand !== 0) {
        throw new FormulaError(`The result must be an integer: ${formula}`);
      }

      reducedNumbers[reducedNumbers.length - 1] = leftOperand / rightOperand;
      return;
    }

    reducedNumbers.push(rightOperand);
    reducedOperators.push(operator);
  });

  // Second pass: resolve the remaining `+` and `-` left to right.
  const result = reducedOperators.reduce(
    (accumulator, operator, index) =>
      operator === '+' ? accumulator + reducedNumbers[index + 1] : accumulator - reducedNumbers[index + 1],
    reducedNumbers[0],
  );

  return {
    formula,
    result,
    expression: `${formula} = ${result}`,
  };
}
