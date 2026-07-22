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


def test_omitted_tax_percent_defaults_to_zero():
    result = calculate_price(Decimal("200"), Decimal("15"))

    assert result.tax_amount == Decimal("0.00")
    assert result.final_price == Decimal("170.00")


def test_zero_tax_percent_leaves_final_price_unchanged():
    result = calculate_price(Decimal("200"), Decimal("15"), Decimal("0"))

    assert result.tax_amount == Decimal("0.00")
    assert result.final_price == Decimal("170.00")


def test_normal_tax_percent_is_applied_after_discount():
    # discounted_price = 200 - 30 = 170; tax = 170 * 10% = 17
    result = calculate_price(Decimal("200"), Decimal("15"), Decimal("10"))

    assert result.discount_amount == Decimal("30.00")
    assert result.tax_amount == Decimal("17.00")
    assert result.final_price == Decimal("187.00")
    assert "187.00" in result.display


def test_decimal_tax_percent_rounds_half_up():
    # discounted_price = 100 - 0 = 100; tax = 100 * 12.5% = 12.5
    result = calculate_price(Decimal("100"), Decimal("0"), Decimal("12.5"))

    assert result.tax_amount == Decimal("12.50")
    assert result.final_price == Decimal("112.50")


def test_hundred_percent_tax_doubles_discounted_price():
    result = calculate_price(Decimal("100"), Decimal("0"), Decimal("100"))

    assert result.tax_amount == Decimal("100.00")
    assert result.final_price == Decimal("200.00")


def test_full_discount_with_tax_produces_zero_tax_amount():
    # discounted_price is 0, so tax on it must also be 0 regardless of tax_percent.
    result = calculate_price(Decimal("100"), Decimal("100"), Decimal("20"))

    assert result.discount_amount == Decimal("100.00")
    assert result.tax_amount == Decimal("0.00")
    assert result.final_price == Decimal("0.00")


def test_tax_percent_below_zero_raises_domain_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_price(Decimal("100"), Decimal("10"), Decimal("-1"))

    assert exc_info.value.code == "INVALID_TAX_PERCENT"


def test_tax_percent_above_hundred_raises_domain_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_price(Decimal("100"), Decimal("10"), Decimal("101"))

    assert exc_info.value.code == "INVALID_TAX_PERCENT"


def test_tax_rounding_uses_round_half_up():
    # discounted_price = 10.01 - 1.25 = 8.76; tax = 8.76 * 12.5% = 1.095 -> 1.10
    result = calculate_price(Decimal("10.005"), Decimal("12.5"), Decimal("12.5"))

    assert result.tax_amount == Decimal("1.10")
    discounted_price = result.price - result.discount_amount
    assert discounted_price + result.tax_amount == result.final_price
