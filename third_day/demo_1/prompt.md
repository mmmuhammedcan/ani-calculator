# Prompts

## Prompt 1

okay for now in the third_day read the AGENTS.md tehn save my every propmt from now to a prompt.md file then apply this prompt: Read AGENT.md and inspect the existing code before making changes.

Add an optional `tax_percent` field to POST /price. If it is omitted, use 0 so existing requests continue to work.

Apply the discount first, then calculate tax on the discounted price:

discounted_price = price - discount_amount
tax_amount = discounted_price * tax_percent / 100
final_price = discounted_price + tax_amount

Use the existing Decimal and ROUND_HALF_UP rules. Accept tax percentages between 0 and 100 inclusive and return the existing DomainError format for invalid values.

Add tax_amount to the response and update the display field. Add unit and API tests for omitted tax, zero tax, normal tax, decimal tax, 100% tax, invalid percentages, full discount, and rounding. Keep the existing project structure and run all tests. then give me the prompts to run projects and tests
