/**
 * Core calculator logic.
 *
 * Supports the four basic operations (+, -, *, /) with standard operator
 * precedence and no parentheses. Operands and results are integers; negative
 * results are allowed. Division must divide evenly and must not divide by zero.
 */

/** Raised when a formula cannot be calculated. Carries the client-facing message. */
export class CalculationError extends Error {}

type Operator = "+" | "-" | "*" | "/";

interface NumberToken {
  type: "number";
  value: number;
}

interface OperatorToken {
  type: "operator";
  value: Operator;
}

type Token = NumberToken | OperatorToken;

const OPERATORS: readonly string[] = ["+", "-", "*", "/"];

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];

    if (char === " " || char === "\t") {
      index += 1;
      continue;
    }

    if (char >= "0" && char <= "9") {
      let digits = "";
      while (index < formula.length && formula[index] >= "0" && formula[index] <= "9") {
        digits += formula[index];
        index += 1;
      }
      tokens.push({ type: "number", value: Number.parseInt(digits, 10) });
      continue;
    }

    if (OPERATORS.includes(char)) {
      tokens.push({ type: "operator", value: char as Operator });
      index += 1;
      continue;
    }

    throw new CalculationError(`The formula is not valid: ${formula}`);
  }

  return tokens;
}

interface Term {
  value: number;
  operator: Operator;
}

/**
 * Parses and evaluates the token stream honouring operator precedence.
 * Uses a single left-to-right pass, applying * and / immediately while
 * deferring + and - so that precedence is respected without parentheses.
 */
function evaluate(tokens: Token[], formula: string): number {
  if (tokens.length === 0) {
    throw new CalculationError(`The formula is not valid: ${formula}`);
  }

  const invalid = () => new CalculationError(`The formula is not valid: ${formula}`);

  const expectNumber = (position: number): number => {
    const token = tokens[position];
    if (!token || token.type !== "number") {
      throw invalid();
    }
    return token.value;
  };

  const terms: Term[] = [{ value: expectNumber(0), operator: "+" }];
  let position = 1;

  while (position < tokens.length) {
    const operatorToken = tokens[position];
    if (!operatorToken || operatorToken.type !== "operator") {
      throw invalid();
    }

    const operand = expectNumber(position + 1);
    const operator = operatorToken.value;

    if (operator === "*" || operator === "/") {
      const previous = terms[terms.length - 1];
      previous.value = applyOperator(previous.value, operand, operator, formula);
    } else {
      terms.push({ value: operand, operator });
    }

    position += 2;
  }

  return terms.reduce((total, term) => {
    return term.operator === "-" ? total - term.value : total + term.value;
  }, 0);
}

function applyOperator(
  left: number,
  right: number,
  operator: Operator,
  formula: string
): number {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) {
        throw new CalculationError(`Division by zero is not allowed: ${formula}`);
      }
      if (left % right !== 0) {
        throw new CalculationError(`The result must be an integer: ${formula}`);
      }
      return left / right;
    default:
      throw new CalculationError(`The formula is not valid: ${formula}`);
  }
}

export interface CalculationResult {
  result: number;
  formula: string;
  formattedExpression: string;
}

/**
 * Calculates the given formula, returning the result together with the
 * original formula and a formatted `formula = result` expression.
 *
 * @throws {CalculationError} when the formula is empty or invalid, or when a
 *   division is by zero or does not divide evenly.
 */
export function calculate(rawFormula: unknown): CalculationResult {
  if (typeof rawFormula !== "string" || rawFormula.trim() === "") {
    throw new CalculationError("The formula must not be empty");
  }

  const formula = rawFormula.trim();
  const tokens = tokenize(formula);
  const result = evaluate(tokens, formula);

  return {
    result,
    formula,
    formattedExpression: `${formula} = ${result}`
  };
}
