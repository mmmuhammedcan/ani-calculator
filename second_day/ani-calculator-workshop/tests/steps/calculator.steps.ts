import assert from "node:assert/strict";
import { When, Then } from "@cucumber/cucumber";
import { CalculatorWorld } from "../support/world";

When(
  "the formula {string} is calculated",
  async function (this: CalculatorWorld, formula: string) {
    await this.calculate(formula);
  }
);

Then(
  "the result is {int}",
  function (this: CalculatorWorld, expectedResult: number) {
    assert.equal(
      this.statusCode,
      200,
      `Expected a successful response but got status ${this.statusCode} with body ${JSON.stringify(
        this.body
      )}`
    );
    assert.equal(this.body.result, expectedResult);
  }
);

Then(
  "the formula in the response is {string}",
  function (this: CalculatorWorld, expectedFormula: string) {
    assert.equal(this.body.formula, expectedFormula);
  }
);

Then(
  "the formatted expression is {string}",
  function (this: CalculatorWorld, expectedExpression: string) {
    assert.equal(this.body.formattedExpression, expectedExpression);
  }
);

Then("the request is rejected", function (this: CalculatorWorld) {
  assert.equal(
    this.statusCode,
    400,
    `Expected the request to be rejected with status 400 but got ${this.statusCode} with body ${JSON.stringify(
      this.body
    )}`
  );
});

Then(
  "the error message is {string}",
  function (this: CalculatorWorld, expectedMessage: string) {
    assert.equal(this.body.error, expectedMessage);
  }
);
