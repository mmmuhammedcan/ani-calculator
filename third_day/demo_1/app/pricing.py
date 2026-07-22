"""Business logic for price/discount calculations.

All monetary calculations use Decimal (never float) and are rounded
to 2 decimal places using ROUND_HALF_UP.
"""

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

TWO_PLACES = Decimal("0.01")


class DomainError(Exception):
    """Raised when a business rule is violated.

    Attributes:
        code: Machine-readable error code.
        message: Human-readable error message.
    """

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class PriceResult:
    """Result of a price/discount/tax calculation."""

    price: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    final_price: Decimal
    display: str


def _round(value: Decimal) -> Decimal:
    """Round a Decimal value to 2 decimal places using ROUND_HALF_UP."""
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def calculate_price(
    price: Decimal,
    discount_percent: Decimal,
    tax_percent: Decimal = Decimal("0"),
) -> PriceResult:
    """Calculate discount amount, tax amount and final price for a given price.

    The discount is applied first, then tax is calculated on the discounted
    price:

        discounted_price = price - discount_amount
        tax_amount = discounted_price * tax_percent / 100
        final_price = discounted_price + tax_amount

    Args:
        price: The original price. Must be >= 0.
        discount_percent: The discount percentage. Must be within [0, 100].
        tax_percent: The tax percentage applied after the discount. Must be
            within [0, 100]. Defaults to 0 so existing callers are unaffected.

    Returns:
        A PriceResult containing price, discount_amount, tax_amount,
        final_price and a human-readable display string.

    Raises:
        DomainError: If price is negative, or discount_percent/tax_percent
            is out of the [0, 100] range.
    """
    if price < 0:
        raise DomainError("INVALID_PRICE", "Price must not be negative.")

    if discount_percent < 0 or discount_percent > 100:
        raise DomainError(
            "INVALID_DISCOUNT_PERCENT",
            "Discount percent must be between 0 and 100.",
        )

    if tax_percent < 0 or tax_percent > 100:
        raise DomainError(
            "INVALID_TAX_PERCENT",
            "Tax percent must be between 0 and 100.",
        )

    rounded_price = _round(price)

    # Round discount_amount first, then derive the discounted price by
    # subtraction so that discount_amount + discounted_price always equals
    # price exactly.
    discount_amount = _round(rounded_price * discount_percent / Decimal("100"))
    discounted_price = rounded_price - discount_amount

    # Tax is calculated on the discounted price, rounded first, then the
    # final price is derived by addition for the same exactness reason.
    tax_amount = _round(discounted_price * tax_percent / Decimal("100"))
    final_price = discounted_price + tax_amount

    display = (
        f"Price: {rounded_price} | "
        f"Discount: {discount_amount} ({discount_percent}%) | "
        f"Tax: {tax_amount} ({tax_percent}%) | "
        f"Final Price: {final_price}"
    )

    return PriceResult(
        price=rounded_price,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        final_price=final_price,
        display=display,
    )
