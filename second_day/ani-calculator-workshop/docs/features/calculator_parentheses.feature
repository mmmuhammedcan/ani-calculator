Feature: Support parentheses in formulas
  As an API consumer
  I want to use parentheses in a mathematical formula
  So that I can control operator precedence explicitly and get the
  correct calculated result back

  Parentheses let API consumers group parts of a formula so they are
  evaluated before the surrounding operations, overriding the default
  operator precedence. Nested parentheses are supported. Formulas with
  invalid parenthesis usage, such as a missing closing parenthesis or
  empty parentheses, are rejected.

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
