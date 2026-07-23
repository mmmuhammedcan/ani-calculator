/**
 * Core calculator logic.
 *
 * Supports the four basic operations (+, -, *, /) with standard operator
 * precedence and parentheses. A minus sign immediately before a number or
 * an opening parenthesis is a unary negation, not a separate operator, so
 * negative operands and negated parenthesized groups are both supported.
 * Operands and results are integers; negative results are allowed.
 * Division must divide evenly and must not divide by zero. Number literals
 * must fall within the safe integer range, and parenthesis/unary-minus
 * nesting is capped (see `Parser.MAX_DEPTH`) to reject pathological input
 * instead of exhausting the call stack.
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

interface ParenToken {
  type: "paren";
  value: "(" | ")";
}

type Token = NumberToken | OperatorToken | ParenToken;

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
      const value = Number.parseInt(digits, 10);
      if (!Number.isSafeInteger(value)) {
        throw new CalculationError(`The formula is not valid: ${formula}`);
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
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

/**
 * Recursive-descent parser/evaluator honouring operator precedence and
 * parentheses:
 *
 *   expression := term (("+" | "-") term)*
 *   term       := factor (("*" | "/") factor)*
 *   factor     := "-" factor | "(" expression ")" | NUMBER
 *
 * The leading "-" in `factor` covers both a negative number literal
 * (e.g. "-5") and negating a parenthesized group (e.g. "-(2 + 3)").
 */
class Parser {
  // Every unary minus and every parenthesized group recurses through
  // parseFactor. Without a cap, a formula crafted with enough nesting
  // (e.g. thousands of "(" or "-" in a row) would exhaust the call stack
  // instead of being rejected as an ordinary invalid formula. 20 is far
  // beyond any realistic formula but nowhere near the stack limit.
  private static readonly MAX_DEPTH = 20;

  private position = 0;
  private depth = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly formula: string
  ) {}

  parse(): number {
    const value = this.parseExpression();
    if (this.position !== this.tokens.length) {
      throw this.invalid();
    }
    return value;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peekOperator("+") || this.peekOperator("-")) {
      const operator = (this.consume() as OperatorToken).value;
      const rhs = this.parseTerm();
      value = operator === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseFactor();
    while (this.peekOperator("*") || this.peekOperator("/")) {
      const operator = (this.consume() as OperatorToken).value;
      const rhs = this.parseFactor();
      value = this.applyOperator(value, rhs, operator);
    }
    return value;
  }

  private parseFactor(): number {
    this.depth += 1;
    if (this.depth > Parser.MAX_DEPTH) {
      throw this.invalid();
    }

    try {
      const token = this.tokens[this.position];

      if (token && token.type === "operator" && token.value === "-") {
        this.position += 1;
        return -this.parseFactor();
      }

      if (token && token.type === "paren" && token.value === "(") {
        this.position += 1;
        const value = this.parseExpression();
        const closing = this.tokens[this.position];
        if (!closing || closing.type !== "paren" || closing.value !== ")") {
          throw this.invalid();
        }
        this.position += 1;
        return value;
      }

      if (!token || token.type !== "number") {
        throw this.invalid();
      }

      this.position += 1;
      return token.value;
    } finally {
      this.depth -= 1;
    }
  }

  private peekOperator(operator: Operator): boolean {
    const token = this.tokens[this.position];
    return !!token && token.type === "operator" && token.value === operator;
  }

  private consume(): Token {
    return this.tokens[this.position++];
  }

  private applyOperator(left: number, right: number, operator: Operator): number {
    switch (operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        if (right === 0) {
          throw new CalculationError(`Division by zero is not allowed: ${this.formula}`);
        }
        if (left % right !== 0) {
          throw new CalculationError(`The result must be an integer: ${this.formula}`);
        }
        return left / right;
      default:
        throw this.invalid();
    }
  }

  private invalid(): CalculationError {
    return new CalculationError(`The formula is not valid: ${this.formula}`);
  }
}

function evaluate(tokens: Token[], formula: string): number {
  if (tokens.length === 0) {
    throw new CalculationError(`The formula is not valid: ${formula}`);
  }

  return new Parser(tokens, formula).parse();
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
