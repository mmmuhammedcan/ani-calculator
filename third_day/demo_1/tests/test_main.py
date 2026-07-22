"""Integration tests for the /price HTTP endpoint in app/main.py."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_price_endpoint_returns_correct_calculation():
    response = client.post("/price", json={"price": 200, "discount_percent": 15})

    assert response.status_code == 200
    body = response.json()
    assert body["price"] == "200.00"
    assert body["discount_amount"] == "30.00"
    assert body["final_price"] == "170.00"
    assert "display" in body


def test_price_endpoint_rejects_negative_price():
    response = client.post("/price", json={"price": -50, "discount_percent": 10})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_PRICE"


def test_price_endpoint_rejects_discount_percent_out_of_range():
    response = client.post("/price", json={"price": 100, "discount_percent": 150})

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_DISCOUNT_PERCENT"


def test_price_endpoint_response_amounts_sum_to_price():
    response = client.post("/price", json={"price": 99.99, "discount_percent": 33})

    assert response.status_code == 200
    body = response.json()
    from decimal import Decimal

    total = Decimal(body["discount_amount"]) + Decimal(body["final_price"])
    assert total == Decimal(body["price"])


def test_price_endpoint_omitted_tax_percent_defaults_to_zero():
    response = client.post("/price", json={"price": 200, "discount_percent": 15})

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "0.00"
    assert body["final_price"] == "170.00"


def test_price_endpoint_zero_tax_percent():
    response = client.post(
        "/price",
        json={"price": 200, "discount_percent": 15, "tax_percent": 0},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "0.00"
    assert body["final_price"] == "170.00"


def test_price_endpoint_normal_tax_percent():
    response = client.post(
        "/price",
        json={"price": 200, "discount_percent": 15, "tax_percent": 10},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "17.00"
    assert body["final_price"] == "187.00"
    assert "187.00" in body["display"]


def test_price_endpoint_decimal_tax_percent():
    response = client.post(
        "/price",
        json={"price": 100, "discount_percent": 0, "tax_percent": 12.5},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "12.50"
    assert body["final_price"] == "112.50"


def test_price_endpoint_hundred_percent_tax():
    response = client.post(
        "/price",
        json={"price": 100, "discount_percent": 0, "tax_percent": 100},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "100.00"
    assert body["final_price"] == "200.00"


def test_price_endpoint_full_discount_with_tax():
    response = client.post(
        "/price",
        json={"price": 100, "discount_percent": 100, "tax_percent": 20},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "0.00"
    assert body["final_price"] == "0.00"


def test_price_endpoint_rejects_tax_percent_out_of_range():
    response = client.post(
        "/price",
        json={"price": 100, "discount_percent": 10, "tax_percent": 150},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_TAX_PERCENT"


def test_price_endpoint_negative_tax_percent_is_rejected():
    response = client.post(
        "/price",
        json={"price": 100, "discount_percent": 10, "tax_percent": -1},
    )

    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "INVALID_TAX_PERCENT"


def test_price_endpoint_tax_rounding_uses_round_half_up():
    response = client.post(
        "/price",
        json={"price": 10.005, "discount_percent": 12.5, "tax_percent": 12.5},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["tax_amount"] == "1.10"
    assert body["final_price"] == "9.86"
