"""FastAPI application implementing the scooter fee calculation service.

Business rules (see docs/spec/mini-spec.md):
- BR-01: Fee is calculated per minute, at 5 TL per minute.
- BR-02: A fixed unlock (base) fee of 10 TL is applied to every ride.
- BR-03: There is no free starting period; the whole ride is billed.
- BR-04: The total fee is capped at 1000 TL.
- BR-05: The ride duration (minutes) is rounded up before the fee is
  calculated (e.g. 3.2 minutes -> 4 minutes).
"""

import math

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator

# Business rule constants (see docs/spec/mini-spec.md, section 5).
PER_MINUTE_FEE = 5.0
BASE_FEE = 10.0
MAX_FEE = 1000.0

app = FastAPI(title="Scooter Fee Service")


class ScooterFeeRequest(BaseModel):
    """Request body for the scooter fee calculation endpoint."""

    duration_minutes: float

    @field_validator("duration_minutes")
    @classmethod
    def duration_must_not_be_negative(cls, value: float) -> float:
        """Reject negative ride durations (AC-04)."""
        if value < 0:
            raise ValueError("duration_minutes must not be negative")
        return value


class ScooterFeeResponse(BaseModel):
    """Response body for the scooter fee calculation endpoint."""

    fee: float


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Return HTTP 400 (instead of FastAPI's default 422) for invalid input.

    This satisfies the error contract stated in the spec (Q-07): invalid
    input (missing field, non-numeric value, negative duration) must
    result in a 400 Bad Request response.
    """
    return JSONResponse(
        status_code=400, content={"detail": jsonable_encoder(exc.errors())}
    )


@app.post("/scooter-fee", response_model=ScooterFeeResponse)
def calculate_scooter_fee(payload: ScooterFeeRequest) -> ScooterFeeResponse:
    """Calculate the fee to be paid for a scooter ride.

    fee = min(MAX_FEE, BASE_FEE + PER_MINUTE_FEE * ceil(duration_minutes))
    """
    rounded_minutes = math.ceil(payload.duration_minutes)
    raw_fee = BASE_FEE + PER_MINUTE_FEE * rounded_minutes
    capped_fee = min(raw_fee, MAX_FEE)
    return ScooterFeeResponse(fee=round(capped_fee, 2))
