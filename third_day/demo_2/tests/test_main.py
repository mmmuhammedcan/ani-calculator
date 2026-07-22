"""Integration tests for the /scooter-fee HTTP endpoint in app/main.py."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_scooter_fee_endpoint_one_minute_ride():
    response = client.post("/scooter-fee", json={"duration_minutes": 1})

    assert response.status_code == 200
    body = response.json()
    assert body["fee"] == "15.00"
    assert body["currency"] == "TRY"
    assert body["duration_minutes_billed"] == 1
    assert body["tax_amount"] == "0.00"


def test_scooter_fee_endpoint_rounds_fractional_duration_up():
    response = client.post("/scooter-fee", json={"duration_minutes": 3.2})

    assert response.status_code == 200
    body = response.json()
    assert body["duration_minutes_billed"] == 4
    assert body["fee"] == "30.00"


def test_scooter_fee_endpoint_applies_discounted_tier():
    response = client.post("/scooter-fee", json={"duration_minutes": 45})

    assert response.status_code == 200
    body = response.json()
    assert body["fee"] == "220.00"


def test_scooter_fee_endpoint_caps_fee_at_thousand_try():
    response = client.post("/scooter-fee", json={"duration_minutes": 500})

    assert response.status_code == 200
    body = response.json()
    assert body["fee"] == "1000.00"


def test_scooter_fee_endpoint_applies_tax_percent():
    response = client.post(
        "/scooter-fee", json={"duration_minutes": 45, "tax_percent": 20}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "44.00"
    assert body["fee"] == "264.00"


def test_scooter_fee_endpoint_rejects_zero_duration():
    response = client.post("/scooter-fee", json={"duration_minutes": 0})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "NON_POSITIVE_DURATION"


def test_scooter_fee_endpoint_rejects_negative_duration():
    response = client.post("/scooter-fee", json={"duration_minutes": -5})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "NEGATIVE_DURATION"


def test_scooter_fee_endpoint_rejects_missing_duration_field():
    response = client.post("/scooter-fee", json={})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "MISSING_DURATION"


def test_scooter_fee_endpoint_rejects_non_numeric_duration():
    response = client.post("/scooter-fee", json={"duration_minutes": "abc"})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_DURATION_TYPE"


def test_scooter_fee_endpoint_rejects_duration_over_limit():
    response = client.post("/scooter-fee", json={"duration_minutes": 1441})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "DURATION_TOO_LONG"


def test_scooter_fee_endpoint_rejects_tax_percent_out_of_range():
    response = client.post(
        "/scooter-fee", json={"duration_minutes": 10, "tax_percent": 150}
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_TAX_PERCENT"


def test_scooter_fee_endpoint_response_includes_transparency_fields():
    response = client.post("/scooter-fee", json={"duration_minutes": 45})

    assert response.status_code == 200
    body = response.json()
    assert body["currency"] == "TRY"
    assert body["duration_minutes_billed"] == 45
