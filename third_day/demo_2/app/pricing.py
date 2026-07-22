"""Business logic for scooter ride fee calculations.

All monetary calculations use Decimal (never float) and are rounded to
2 decimal places using ROUND_HALF_UP, per mini-spec Technical
Constraint #5 (Q-13).
"""

from dataclasses import dataclass
from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal

TWO_PLACES = Decimal("0.01")

UNLOCK_FEE = Decimal("10")
TIER1_LIMIT_MINUTES = Decimal("30")
TIER1_RATE_PER_MINUTE = Decimal("5")
TIER2_RATE_PER_MINUTE = Decimal("4")
FEE_CAP = Decimal("1000")
MAX_DURATION_MINUTES = Decimal("1440")
CURRENCY = "TRY"


class DomainError(Exception):
    """Raised when a business rule is violated.

    Attributes:
        code: Machine-readable error code (see mini-spec BR-08).
        message: Human-readable error message.
    """

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class FeeResult:
    """Result of a scooter ride fee calculation."""

    fee: Decimal
    currency: str
    duration_minutes_billed: int
    tax_amount: Decimal


def _round(value: Decimal) -> Decimal:
    """Round a Decimal value to 2 decimal places using ROUND_HALF_UP."""
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def calculate_fee(
    duration_minutes: Decimal,
    tax_percent: Decimal = Decimal("0"),
) -> FeeResult:
    """Calculate the fee owed for a scooter ride given its duration.

    Pricing (mini-spec BR-01..BR-07):
        - A fixed unlock fee of 10 TRY is charged per ride.
        - The first 30 billed minutes cost 5 TRY/minute.
        - Every billed minute beyond 30 costs a discounted 4 TRY/minute.
        - Duration is rounded up to the next whole minute before billing.
        - The ride fee (unlock + tiered minutes, before tax) is capped at
          1000 TRY.
        - An optional tax_percent is applied on top of the capped ride fee.

    Args:
        duration_minutes: Ride duration in minutes. Must be > 0 and
            <= 1440.
        tax_percent: Tax percentage applied to the ride fee. Must be
            within [0, 100]. Defaults to 0.

    Returns:
        A FeeResult containing fee, currency, duration_minutes_billed
        and tax_amount.

    Raises:
        DomainError: If duration_minutes or tax_percent violates a
            business rule (see mini-spec BR-08 for exact codes).
    """
    if duration_minutes < 0:
        raise DomainError(
            "NEGATIVE_DURATION", "duration_minutes must not be negative."
        )

    if duration_minutes == 0:
        raise DomainError(
            "NON_POSITIVE_DURATION", "duration_minutes must be greater than zero."
        )

    if duration_minutes > MAX_DURATION_MINUTES:
        raise DomainError(
            "DURATION_TOO_LONG",
            f"duration_minutes must not exceed {MAX_DURATION_MINUTES}.",
        )

    if tax_percent < 0 or tax_percent > 100:
        raise DomainError(
            "INVALID_TAX_PERCENT", "tax_percent must be between 0 and 100."
        )

    billed_minutes = duration_minutes.to_integral_value(rounding=ROUND_CEILING)

    tier1_minutes = min(billed_minutes, TIER1_LIMIT_MINUTES)
    tier2_minutes = max(billed_minutes - TIER1_LIMIT_MINUTES, Decimal("0"))

    ride_fee = (
        UNLOCK_FEE
        + tier1_minutes * TIER1_RATE_PER_MINUTE
        + tier2_minutes * TIER2_RATE_PER_MINUTE
    )
    ride_fee = min(ride_fee, FEE_CAP)
    ride_fee = _round(ride_fee)

    tax_amount = _round(ride_fee * tax_percent / Decimal("100"))
    fee = ride_fee + tax_amount

    return FeeResult(
        fee=fee,
        currency=CURRENCY,
        duration_minutes_billed=int(billed_minutes),
        tax_amount=tax_amount,
    )
