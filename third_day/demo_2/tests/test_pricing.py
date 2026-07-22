"""Unit tests for business logic in app/pricing.py."""

from decimal import Decimal

import pytest

from app.pricing import DomainError, calculate_fee


def test_one_minute_ride_charges_unlock_fee_plus_one_minute():
    result = calculate_fee(Decimal("1"))

    assert result.fee == Decimal("15.00")
    assert result.tax_amount == Decimal("0.00")
    assert result.duration_minutes_billed == 1
    assert result.currency == "TRY"


def test_fractional_duration_is_rounded_up_before_billing():
    result = calculate_fee(Decimal("3.2"))

    assert result.duration_minutes_billed == 4
    assert result.fee == Decimal("30.00")


def test_duration_over_thirty_minutes_uses_discounted_rate():
    result = calculate_fee(Decimal("45"))

    assert result.fee == Decimal("220.00")


def test_fee_is_capped_at_thousand_try():
    result = calculate_fee(Decimal("500"))

    assert result.fee == Decimal("1000.00")


def test_tax_percent_is_applied_on_top_of_capped_ride_fee():
    result = calculate_fee(Decimal("45"), Decimal("20"))

    assert result.tax_amount == Decimal("44.00")
    assert result.fee == Decimal("264.00")


def test_zero_duration_raises_non_positive_duration_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_fee(Decimal("0"))

    assert exc_info.value.code == "NON_POSITIVE_DURATION"


def test_negative_duration_raises_negative_duration_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_fee(Decimal("-5"))

    assert exc_info.value.code == "NEGATIVE_DURATION"


def test_duration_over_limit_raises_duration_too_long_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_fee(Decimal("1441"))

    assert exc_info.value.code == "DURATION_TOO_LONG"


def test_duration_at_limit_is_accepted():
    result = calculate_fee(Decimal("1440"))

    assert result.duration_minutes_billed == 1440


def test_tax_percent_out_of_range_raises_invalid_tax_percent_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_fee(Decimal("10"), Decimal("150"))

    assert exc_info.value.code == "INVALID_TAX_PERCENT"


def test_negative_tax_percent_raises_invalid_tax_percent_error():
    with pytest.raises(DomainError) as exc_info:
        calculate_fee(Decimal("10"), Decimal("-1"))

    assert exc_info.value.code == "INVALID_TAX_PERCENT"


def test_omitted_tax_percent_defaults_to_zero():
    result = calculate_fee(Decimal("10"))

    assert result.tax_amount == Decimal("0.00")
