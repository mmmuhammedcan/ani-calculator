Feature: Calculate a mathematical formula
  As an API consumer
  I want to send a mathematical formula
  So that I get its calculated result back

  Supports the four basic operations with operator precedence
  (no parentheses). Operands and results are integers; negative
  results are allowed. The response contains the result, the
  original formula, and a formatted expression of both.

  Scenario: Add two numbers
    When the formula "2 + 3" is calculated
    Then the result is 5
    And the formula in the response is "2 + 3"
    And the formatted expression is "2 + 3 = 5"

  Scenario: Subtract two numbers
    When the formula "10 - 4" is calculated
    Then the result is 6
    And the formatted expression is "10 - 4 = 6"

  Scenario: Multiply two numbers
    When the formula "6 * 7" is calculated
    Then the result is 42
    And the formatted expression is "6 * 7 = 42"

  Scenario: Divide two numbers
    When the formula "20 / 5" is calculated
    Then the result is 4
    And the formatted expression is "20 / 5 = 4"

  Scenario: Respect operator precedence
    When the formula "2 + 3 * 4" is calculated
    Then the result is 14
    And the formatted expression is "2 + 3 * 4 = 14"

  Scenario: Combine several operations with precedence
    When the formula "10 - 6 / 2 + 4 * 3" is calculated
    Then the result is 19
    And the formatted expression is "10 - 6 / 2 + 4 * 3 = 19"

  Scenario: A negative result is allowed
    When the formula "3 - 5" is calculated
    Then the result is -2
    And the formatted expression is "3 - 5 = -2"

  Scenario: Division that does not divide evenly is rejected
    When the formula "7 / 2" is calculated
    Then the request is rejected
    And the error message is "The result must be an integer: 7 / 2"

  Scenario: Divide by zero is rejected
    When the formula "5 / 0" is calculated
    Then the request is rejected
    And the error message is "Division by zero is not allowed: 5 / 0"

  Scenario: An invalid formula is rejected
    When the formula "2 + * 3" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 2 + * 3"

  Scenario: An empty formula is rejected
    When the formula "" is calculated
    Then the request is rejected
    And the error message is "The formula must not be empty"
