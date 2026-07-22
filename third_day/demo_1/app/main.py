"""HTTP layer: FastAPI application and route definitions."""

from decimal import Decimal

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.pricing import DomainError, calculate_price

app = FastAPI(title="Pricing API")


class PriceRequest(BaseModel):
    """Request body for the /price endpoint."""

    price: Decimal
    discount_percent: Decimal = Field(alias="discount_percent")
    tax_percent: Decimal = Field(default=Decimal("0"), alias="tax_percent")


class PriceResponse(BaseModel):
    """Response body for the /price endpoint."""

    price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    final_price: Decimal
    display: str


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    """Translate DomainError exceptions into the standard error response shape."""
    return JSONResponse(
        status_code=400,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.post("/price", response_model=PriceResponse)
async def price_endpoint(request: PriceRequest) -> PriceResponse:
    """Calculate discount amount, tax amount and final price for a given price."""
    result = calculate_price(
        request.price, request.discount_percent, request.tax_percent
    )
    return PriceResponse(
        price=result.price,
        discount_amount=result.discount_amount,
        tax_amount=result.tax_amount,
        final_price=result.final_price,
        display=result.display,
    )
