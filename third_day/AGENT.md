# Agent Rules for this Repository

These rules apply to all future work in this repository unless the user
explicitly overrides them. Read this file before making changes; do not
ask the user to repeat these rules.

## Project

Small Python + FastAPI REST API with a single endpoint:

- `POST /price` — request: `{"price": 200, "discount_percent": 15}`
  response: `price`, `discount_amount`, `final_price`, and a human-readable
  `display` field.

## Code rules

- Code, comments, docstrings, and test names must be written in English.
- Business logic lives in `app/pricing.py`. HTTP concerns (routing, request/
  response models, exception translation) live in `app/main.py`. Keep this
  separation for any new endpoints/logic.
- Never use `float` for monetary calculations. Always use `Decimal`.
- Round monetary values to 2 decimal places using `ROUND_HALF_UP`.
- Invariant: `discount_amount + final_price` must always equal `price`
  exactly (round `discount_amount` first, then derive `final_price` by
  subtraction — never round both independently).
- Validation:
  - `price` must not be negative.
  - `discount_percent` must be within the `[0, 100]` range.
  - Violations raise `DomainError` (defined in `app/pricing.py`), never a
    raw framework exception.
- Error response shape (HTTP 400):
  ```json
  {"error": {"code": "...", "message": "..."}}
  ```

## Testing

- Use `pytest`. Tests live under `tests/`.
- Cover business logic (`app/pricing.py`) and HTTP layer (`app/main.py`)
  separately.
- Test names and assertions must be in English.

## Running

```bash
pip install -r requirements.txt
pytest
uvicorn app.main:app --reload
```
