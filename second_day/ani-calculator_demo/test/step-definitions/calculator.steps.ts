import { When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { CalculatorWorld } from '../support/world';

/**
 * Sends a real HTTP request to the running Calculator API and captures the
 * response (or the network error, if the server/endpoint isn't there yet).
 */
When('the formula {string} is calculated', async function (this: CalculatorWorld, formula: string) {
  this.formula = formula;

  const res = await fetch(`${this.baseUrl}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formula }),
  });

  const body = await res.json().catch(() => undefined);
  this.response = { status: res.status, body };
});

Then('the result is {int}', function (this: CalculatorWorld, expectedResult: number) {
  assert.equal(this.response?.status, 200, `Expected a successful response, got status ${this.response?.status}`);
  assert.equal(this.response?.body?.result, expectedResult);
});

Then('the formula in the response is {string}', function (this: CalculatorWorld, expectedFormula: string) {
  assert.equal(this.response?.body?.formula, expectedFormula);
});

Then('the formatted expression is {string}', function (this: CalculatorWorld, expectedExpression: string) {
  assert.equal(this.response?.body?.expression, expectedExpression);
});

Then('the request is rejected', function (this: CalculatorWorld) {
  const status = this.response?.status ?? 0;
  assert.ok(status >= 400 && status < 500, `Expected a 4xx rejection, got status ${status}`);
});

Then('the error message is {string}', function (this: CalculatorWorld, expectedMessage: string) {
  assert.equal(this.response?.body?.error, expectedMessage);
});
