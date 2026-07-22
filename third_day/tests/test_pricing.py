"""Unit tests for business logic in app/pricing.py."""

from decimal import Decimal

import pytest

from app.pricing import DomainError, calculate_price


def test_calculate_price_basic_discount():
    result = calculate_price(Decimal("200"), Decimal("15"))

    assert result.price == Decimal("200.00")
    assert result.discount_amount == Decimal("30.00")
    assert result.final_price == Decimal("170.00")
    assert "170.00" in result.display


def test_discount_amount_plus_final_price_equals_price():
    result = calculate_price(Decimal("199.99"), Decimal("33"))

    assert result.discount_amount + result.final_price == result.price


def test_zero_discount_returns_full_price():
    result = calculate_price(Decimal("100"), Decimal("0"))

    assert result.discount_amount == Decimal("0.00")
    assert result.final_price == Decimal("100.00")


def test_full_discount_returns_zero_final_price():
    result = calculate_price(Decimal("100"), Decimal("100"))

    assert result.discount_amount == Decimal("100.00")
    assert result.final_price == Decimal("0.00")


def test_negative_price_raises_domain_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_price(Decimal("-10"), Decimal("10"))

    assert exc_info.value.code == "INVALID_PRICE"


def test_discount_percent_below_zero_raises_domain_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_price(Decimal("100"), Decimal("-1"))

    assert exc_info.value.code == "INVALID_DISCOUNT_PERCENT"


def test_discount_percent_above_hundred_raises_domain_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_price(Decimal("100"), Decimal("101"))

    assert exc_info.value.code == "INVALID_DISCOUNT_PERCENT"


def test_rounding_uses_round_half_up():
    # 10.005 * 12.5% = 1.250625 -> rounds to 1.25
    result = calculate_price(Decimal("10.005"), Decimal("12.5"))

    assert result.price == Decimal("10.01")
    assert result.discount_amount + result.final_price == result.price
