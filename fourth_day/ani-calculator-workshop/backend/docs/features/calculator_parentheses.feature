Feature: Support parentheses in formulas
  As an API consumer
  I want to use parentheses in a mathematical formula
  So that I can control operator precedence explicitly and get the
  correct calculated result back

  Parentheses let API consumers group parts of a formula so they are
  evaluated before the surrounding operations, overriding the default
  operator precedence. Nested parentheses are supported up to a safe
  depth. A minus sign immediately before an opening parenthesis negates
  the value of that parenthesized group. Formulas with invalid
  parenthesis usage, such as a missing closing parenthesis, empty
  parentheses, or nesting beyond the safe depth, are rejected.

  Scenario: Parentheses change operator precedence
    When the formula "(2 + 3) * 4" is calculated
    Then the result is 20
    And the formatted expression is "(2 + 3) * 4 = 20"

  Scenario: Parentheses around a later operand
    When the formula "10 - (6 / 2)" is calculated
    Then the result is 7
    And the formatted expression is "10 - (6 / 2) = 7"

  Scenario: Multiple separate parenthesized groups
    When the formula "(2 + 3) * (4 - 1)" is calculated
    Then the result is 15
    And the formatted expression is "(2 + 3) * (4 - 1) = 15"

  Scenario: Nested parentheses
    When the formula "((2 + 3) * (4 - 1)) / 3" is calculated
    Then the result is 5
    And the formatted expression is "((2 + 3) * (4 - 1)) / 3 = 5"

  Scenario: Parentheses wrapping the entire formula
    When the formula "(2 + 3 * 4)" is calculated
    Then the result is 14
    And the formatted expression is "(2 + 3 * 4) = 14"

  Scenario: A negative result from a parenthesized expression is allowed
    When the formula "2 - (3 + 4)" is calculated
    Then the result is -5
    And the formatted expression is "2 - (3 + 4) = -5"

  Scenario: A negative number inside parentheses
    When the formula "(-5 + 3) * 2" is calculated
    Then the result is -4
    And the formatted expression is "(-5 + 3) * 2 = -4"

  Scenario: Negating a parenthesized expression
    When the formula "-(2 + 3)" is calculated
    Then the result is -5
    And the formatted expression is "-(2 + 3) = -5"

  Scenario: Negating a parenthesized expression used in a larger formula
    When the formula "10 - -(2 + 3)" is calculated
    Then the result is 15
    And the formatted expression is "10 - -(2 + 3) = 15"

  Scenario: A missing closing parenthesis is rejected
    When the formula "(2 + 3 * 4" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: (2 + 3 * 4"

  Scenario: A missing opening parenthesis is rejected
    When the formula "2 + 3) * 4" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + 3) * 4"

  Scenario: Empty parentheses are rejected
    When the formula "2 + ()" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + ()"

  Scenario: Adjacent parenthesized groups without an operator are rejected
    When the formula "(2 + 3)(4 - 1)" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: (2 + 3)(4 - 1)"

  Scenario: An extra closing parenthesis is rejected
    When the formula "(2 + 3)) * 4" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: (2 + 3)) * 4"

  Scenario: Division inside parentheses that does not divide evenly is rejected
    When the formula "(7 / 2) + 1" is calculated
    Then the request is rejected
    And the error message is "The result must be an integer: (7 / 2) + 1"

  Scenario: Division by zero inside parentheses is rejected
    When the formula "(5 / 0) + 1" is calculated
    Then the request is rejected
    And the error message is "Division by zero is not allowed: (5 / 0) + 1"

  Scenario: An excessively deeply nested formula is rejected
    When the formula "(((((((((((((((((((((1)))))))))))))))))))))" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: (((((((((((((((((((((1)))))))))))))))))))))"
