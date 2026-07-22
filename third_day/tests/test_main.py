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
