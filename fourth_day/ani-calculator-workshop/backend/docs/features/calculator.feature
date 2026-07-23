Feature: Calculate a mathematical formula
  As an API consumer
  I want to send a mathematical formula
  So that I get its calculated result back

  Supports the four basic operations with operator precedence
  (no parentheses). Operands and results are integers. A minus sign
  immediately in front of a number — at the start of the formula or
  right after another operator — is a negative number literal, not a
  separate operator; negative results are also allowed. Number
  literals must stay within the safe integer range. The response
  contains the result, the original formula, and a formatted
  expression of both.

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

  Scenario: A negative number as the first operand
    When the formula "-5 + 3" is calculated
    Then the result is -2
    And the formatted expression is "-5 + 3 = -2"

  Scenario: A negative number after an addition operator
    When the formula "10 + -3" is calculated
    Then the result is 7
    And the formatted expression is "10 + -3 = 7"

  Scenario: Subtracting a negative number
    When the formula "5 - -3" is calculated
    Then the result is 8
    And the formatted expression is "5 - -3 = 8"

  Scenario: Multiplying by a negative number
    When the formula "4 * -3" is calculated
    Then the result is -12
    And the formatted expression is "4 * -3 = -12"

  Scenario: Dividing by a negative number
    When the formula "12 / -3" is calculated
    Then the result is -4
    And the formatted expression is "12 / -3 = -4"

  Scenario: A negative number division that does not divide evenly is rejected
    When the formula "-7 / 2" is calculated
    Then the request is rejected
    And the error message is "The result must be an integer: -7 / 2"

  Scenario: A single negative number is a valid formula
    When the formula "-7" is calculated
    Then the result is -7
    And the formatted expression is "-7 = -7"

  Scenario: A trailing minus sign with no operand is rejected
    When the formula "3 + -" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 3 + -"

  Scenario: A number literal outside the safe integer range is rejected
    When the formula "99999999999999999 + 1" is calculated
    Then the request is rejected
    And the error message is "The formula is not valid: 99999999999999999 + 1"

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
