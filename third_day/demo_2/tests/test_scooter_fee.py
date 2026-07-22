"""ATDD tests for the POST /scooter-fee endpoint.

Each test below maps 1:1 to a scenario defined in
features/scooter_fee.feature (Gherkin), which in turn is derived from
docs/spec/mini-spec.md Acceptance Criteria (AC-01 .. AC-05).
"""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_one_minute_ride_returns_base_fee_plus_one_minute_fee():
    """Scenario: Bir dakikalık sürüş için ücret hesaplanır (AC-01).

    10 TL base fee + 1 minute * 5 TL/minute = 15.00 TL.
    """
    response = client.post("/scooter-fee", json={"duration_minutes": 1})

    assert response.status_code == 200
    assert response.json() == {"fee": 15.00}


def test_fractional_duration_is_rounded_up_before_fee_calculation():
    """Scenario: Kesirli sürüş süresi yukarı yuvarlanır (AC-02).

    3.2 minutes is rounded up to 4 minutes:
    10 TL base fee + 4 minutes * 5 TL/minute = 30.00 TL.
    """
    response = client.post("/scooter-fee", json={"duration_minutes": 3.2})

    assert response.status_code == 200
    assert response.json() == {"fee": 30.00}


def test_fee_is_capped_at_maximum_limit():
    """Scenario: Ücret üst limiti aşıldığında tavan uygulanır (AC-03).

    A long ride whose raw fee exceeds 1000 TL must be capped at 1000.00 TL.
    """
    response = client.post("/scooter-fee", json={"duration_minutes": 500})

    assert response.status_code == 200
    assert response.json() == {"fee": 1000.00}


def test_negative_duration_returns_bad_request():
    """Scenario: Negatif süre geçersiz kabul edilir (AC-04)."""
    response = client.post("/scooter-fee", json={"duration_minutes": -5})

    assert response.status_code == 400


def test_missing_duration_field_returns_bad_request():
    """Scenario: Eksik süre alanı geçersiz kabul edilir (AC-05)."""
    response = client.post("/scooter-fee", json={})

    assert response.status_code == 400


def test_non_numeric_duration_returns_bad_request():
    """Scenario: Sayısal olmayan süre değeri geçersiz kabul edilir (AC-05)."""
    response = client.post("/scooter-fee", json={"duration_minutes": "abc"})

    assert response.status_code == 400
