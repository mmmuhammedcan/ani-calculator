"""HTTP layer: FastAPI application and route definitions for the
scooter fee service."""

from decimal import Decimal

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.pricing import DomainError, calculate_fee

app = FastAPI(title="Scooter Fee API")


class ScooterFeeRequest(BaseModel):
    """Request body for the /scooter-fee endpoint."""

    duration_minutes: Decimal
    tax_percent: Decimal = Decimal("0")


class ScooterFeeResponse(BaseModel):
    """Response body for the /scooter-fee endpoint."""

    fee: Decimal
    currency: str
    duration_minutes_billed: int
    tax_amount: Decimal


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    """Translate DomainError exceptions into the standard error response shape."""
    return JSONResponse(
        status_code=400,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Map request body schema errors to the standard error response shape.

    duration_minutes is required and Decimal-typed at the schema level,
    so a missing or non-numeric value never reaches the domain layer; it
    is translated here into MISSING_DURATION / INVALID_DURATION_TYPE
    (mini-spec BR-08), keeping the error contract identical to
    DomainError-raised business rule violations.
    """
    for error in exc.errors():
        if "duration_minutes" in error.get("loc", ()):
            code = (
                "MISSING_DURATION"
                if error["type"] == "missing"
                else "INVALID_DURATION_TYPE"
            )
            return JSONResponse(
                status_code=400,
                content={"error": {"code": code, "message": error["msg"]}},
            )
    return JSONResponse(
        status_code=400,
        content={
            "error": {"code": "INVALID_REQUEST", "message": "Invalid request body."}
        },
    )


@app.post("/scooter-fee", response_model=ScooterFeeResponse)
async def scooter_fee_endpoint(request: ScooterFeeRequest) -> ScooterFeeResponse:
    """Calculate the fee owed for a scooter ride given its duration in minutes."""
    result = calculate_fee(request.duration_minutes, request.tax_percent)
    return ScooterFeeResponse(
        fee=result.fee,
        currency=result.currency,
        duration_minutes_billed=result.duration_minutes_billed,
        tax_amount=result.tax_amount,
    )
