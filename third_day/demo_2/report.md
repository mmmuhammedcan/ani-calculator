# Test & Implementation Report — Scooter Fee Servisi

Bu rapor, `docs/spec/mini-spec.md` (durum: **Ready for implementation**)
temel alınarak yürütülen TDD döngüsünü belgeler: Gherkin senaryolarının
pytest testlerine dönüştürülmesi → testlerin implementasyon olmadan
**fail** ettiğinin gösterilmesi (Red) → implementasyonun yazılması →
testlerin **pass** ettiğinin doğrulanması (Green) → manuel test.

## 1. Kapsam

| Dosya | İçerik |
|---|---|
| `features/scooter_fee.feature` | AC-01...AC-12'yi kapsayan Türkçe Gherkin senaryoları |
| `tests/test_pricing.py` | `app.pricing.calculate_fee` için 12 birim testi |
| `tests/test_main.py` | `POST /scooter-fee` endpoint'i için 12 entegrasyon testi |
| `app/pricing.py` | İş kuralları (BR-01...BR-08) — `DomainError`, `calculate_fee` |
| `app/main.py` | FastAPI HTTP katmanı, hata → HTTP şeması dönüşümü |

## 2. Red Phase — Testler implementasyon öncesi fail ediyor

`app/pricing.py` ve `app/main.py` yazılmadan önce, yalnızca testler
mevcutken `pytest -v` çalıştırıldı:

```
collected 0 items / 2 errors

ERROR collecting tests/test_main.py
ModuleNotFoundError: No module named 'app.main'

ERROR collecting tests/test_pricing.py
ModuleNotFoundError: No module named 'app.pricing'

!!!!!!!!!!!!!!!!!!! Interrupted: 2 errors during collection !!!!!!!!!!!!!!!!!!!!
========================= 1 warning, 2 errors in 0.34s =========================
```

**Sonuç:** 24 testin tamamı toplanamadı (collection error) — beklenen
Red durumu doğrulandı. Bu, testlerin implementasyondan *önce* yazıldığını
ve implementasyona bağımlı olduğunu kanıtlar (TDD'nin amacı).

## 3. Implementasyon Özeti

- **`app/pricing.py`:** Saf iş mantığı. `Decimal` + `ROUND_HALF_UP` (Q-13),
  `ROUND_CEILING` ile süre yuvarlama (BR-05), kademeli fiyatlandırma
  (BR-01...BR-04), 1000 TL tavan (BR-06), opsiyonel KDV (BR-07). Geçersiz
  girdilerde `DomainError(code, message)` fırlatır (BR-08).
- **`app/main.py`:** FastAPI katmanı. `ScooterFeeRequest`/`ScooterFeeResponse`
  pydantic modelleri; `duration_minutes` eksik/sayısal-olmayan girdiler
  pydantic `RequestValidationError`'a düşer ve özel bir handler ile
  `MISSING_DURATION` / `INVALID_DURATION_TYPE` koduna, iş kuralı ihlalleri
  ise `DomainError` handler'ı ile ilgili koda çevrilir — ikisi de aynı
  `{"error": {"code", "message"}}` şeklini, HTTP 400 ile döner (BR-08 ile
  tutarlı, `demo_1/app/main.py` deseniyle aynı yaklaşım).

## 4. Green Phase — Testler implementasyon sonrası pass ediyor

```
collected 24 items

tests/test_main.py::test_scooter_fee_endpoint_one_minute_ride PASSED
tests/test_main.py::test_scooter_fee_endpoint_rounds_fractional_duration_up PASSED
tests/test_main.py::test_scooter_fee_endpoint_applies_discounted_tier PASSED
tests/test_main.py::test_scooter_fee_endpoint_caps_fee_at_thousand_try PASSED
tests/test_main.py::test_scooter_fee_endpoint_applies_tax_percent PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_zero_duration PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_negative_duration PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_missing_duration_field PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_non_numeric_duration PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_duration_over_limit PASSED
tests/test_main.py::test_scooter_fee_endpoint_rejects_tax_percent_out_of_range PASSED
tests/test_main.py::test_scooter_fee_endpoint_response_includes_transparency_fields PASSED
tests/test_pricing.py::test_one_minute_ride_charges_unlock_fee_plus_one_minute PASSED
tests/test_pricing.py::test_fractional_duration_is_rounded_up_before_billing PASSED
tests/test_pricing.py::test_duration_over_thirty_minutes_uses_discounted_rate PASSED
tests/test_pricing.py::test_fee_is_capped_at_thousand_try PASSED
tests/test_pricing.py::test_tax_percent_is_applied_on_top_of_capped_ride_fee PASSED
tests/test_pricing.py::test_zero_duration_raises_non_positive_duration_error PASSED
tests/test_pricing.py::test_negative_duration_raises_negative_duration_error PASSED
tests/test_pricing.py::test_duration_over_limit_raises_duration_too_long_error PASSED
tests/test_pricing.py::test_duration_at_limit_is_accepted PASSED
tests/test_pricing.py::test_tax_percent_out_of_range_raises_invalid_tax_percent_error PASSED
tests/test_pricing.py::test_negative_tax_percent_raises_invalid_tax_percent_error PASSED
tests/test_pricing.py::test_omitted_tax_percent_defaults_to_zero PASSED

======================== 24 passed, 1 warning in 0.37s =========================
```

**Sonuç:** 24/24 test pass etti. Tek implementasyon denemesinde tüm
testler geçti; ek düzeltme turuna gerek kalmadı.

### Acceptance Criteria → Test İzlenebilirlik Tablosu

| AC | Senaryo | Unit test (`test_pricing.py`) | Integration test (`test_main.py`) |
|---|---|---|---|
| AC-01 | 1 dk sürüş | `test_one_minute_ride_charges_unlock_fee_plus_one_minute` | `test_scooter_fee_endpoint_one_minute_ride` |
| AC-02 | Kesirli süre yukarı yuvarlanır | `test_fractional_duration_is_rounded_up_before_billing` | `test_scooter_fee_endpoint_rounds_fractional_duration_up` |
| AC-03 | Kademeli indirim | `test_duration_over_thirty_minutes_uses_discounted_rate` | `test_scooter_fee_endpoint_applies_discounted_tier` |
| AC-04 | 1000 TL tavan | `test_fee_is_capped_at_thousand_try` | `test_scooter_fee_endpoint_caps_fee_at_thousand_try` |
| AC-05 | KDV uygulanır | `test_tax_percent_is_applied_on_top_of_capped_ride_fee` | `test_scooter_fee_endpoint_applies_tax_percent` |
| AC-06 | Sıfır süre reddi | `test_zero_duration_raises_non_positive_duration_error` | `test_scooter_fee_endpoint_rejects_zero_duration` |
| AC-07 | Negatif süre reddi | `test_negative_duration_raises_negative_duration_error` | `test_scooter_fee_endpoint_rejects_negative_duration` |
| AC-08 | Eksik alan reddi | — (şema katmanı sorumluluğunda) | `test_scooter_fee_endpoint_rejects_missing_duration_field` |
| AC-09 | Sayısal olmayan değer reddi | — (şema katmanı sorumluluğunda) | `test_scooter_fee_endpoint_rejects_non_numeric_duration` |
| AC-10 | Aşırı uzun süre reddi | `test_duration_over_limit_raises_duration_too_long_error` | `test_scooter_fee_endpoint_rejects_duration_over_limit` |
| AC-11 | Geçersiz KDV oranı reddi | `test_tax_percent_out_of_range_raises_invalid_tax_percent_error` | `test_scooter_fee_endpoint_rejects_tax_percent_out_of_range` |
| AC-12 | Şeffaflık alanları | (dolaylı, tüm başarı testlerinde doğrulanır) | `test_scooter_fee_endpoint_response_includes_transparency_fields` |

AC-08/AC-09'un birim test karşılığı yoktur çünkü bu iki doğrulama
`app/pricing.py`'a hiç ulaşmaz; pydantic şema katmanında (`app/main.py`)
yakalanır (bkz. Bölüm 3).

### Not — spec'in ötesinde eklenen bir güvenlik ağı

`app/main.py` içindeki `validation_error_handler`, `duration_minutes`
dışında bir alanda (örn. `tax_percent` tipi bozuksa) şema hatası
oluşursa, BR-08 tablosunda karşılığı olmayan genel bir
`INVALID_REQUEST` (HTTP 400) kodu döner. Bu, hiçbir AC tarafından test
edilmiyor; sadece spec'te öngörülmemiş girdilerde sunucunun 422 yerine
projenin standart hata şemasıyla (400) tutarlı kalmasını sağlayan bir
teknik güvenlik ağıdır. Kapsamı BR-08'e eklenip eklenmeyeceği bir
sonraki spec revizyonunda karara bağlanabilir.

## 5. Manuel Test — FastAPI'yi Çalıştırma ve Doğrulama

### 5.1 Deployment / Çalıştırma Kodu

`run.sh` (proje kökünde, `third_day/demo_2/run.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

.venv/bin/pip install -q --upgrade pip
.venv/bin/pip install -q -r requirements.txt

exec .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Çalıştırmak için:

```bash
cd third_day/demo_2
./run.sh
```

Sunucu ayağa kalktıktan sonra interaktif dokümantasyon:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### 5.2 Manuel Test Örnekleri (curl) — gerçek sunucuya karşı çalıştırıldı

Aşağıdaki komutlar, `.venv/bin/uvicorn app.main:app --port 8123` ile
ayağa kaldırılan gerçek bir sunucuya karşı çalıştırılmış ve çıktılar
doğrudan buraya kopyalanmıştır (elle uydurulmamıştır).

**Başarılı senaryolar:**

```bash
curl -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 1}'
# → {"fee":"15.00","currency":"TRY","duration_minutes_billed":1,"tax_amount":"0.00"}

curl -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 3.2}'
# → {"fee":"30.00","currency":"TRY","duration_minutes_billed":4,"tax_amount":"0.00"}

curl -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 45}'
# → {"fee":"220.00","currency":"TRY","duration_minutes_billed":45,"tax_amount":"0.00"}

curl -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 500}'
# → {"fee":"1000.00","currency":"TRY","duration_minutes_billed":500,"tax_amount":"0.00"}

curl -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" \
  -d '{"duration_minutes": 45, "tax_percent": 20}'
# → {"fee":"264.00","currency":"TRY","duration_minutes_billed":45,"tax_amount":"44.00"}
```

**Hata senaryoları:**

```bash
curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{"duration_minutes": 0}'
# → HTTP 400 — {"error":{"code":"NON_POSITIVE_DURATION","message":"duration_minutes must be greater than zero."}}

curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{"duration_minutes": -5}'
# → HTTP 400 — {"error":{"code":"NEGATIVE_DURATION","message":"duration_minutes must not be negative."}}

curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{}'
# → HTTP 400 — {"error":{"code":"MISSING_DURATION","message":"Field required"}}

curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{"duration_minutes": "abc"}'
# → HTTP 400 — {"error":{"code":"INVALID_DURATION_TYPE","message":"Input should be a valid decimal"}}

curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{"duration_minutes": 1441}'
# → HTTP 400 — {"error":{"code":"DURATION_TOO_LONG","message":"duration_minutes must not exceed 1440."}}

curl -i -X POST http://127.0.0.1:8000/scooter-fee \
  -H "Content-Type: application/json" -d '{"duration_minutes": 10, "tax_percent": 150}'
# → HTTP 400 — {"error":{"code":"INVALID_TAX_PERCENT","message":"tax_percent must be between 0 and 100."}}
```

Tüm çıktılar mini-spec Bölüm 4/6'daki beklenen sözleşme ve AC-01...AC-11
ile birebir eşleşti; sunucu, test tamamlandıktan sonra durduruldu (bu
rapor bir arka plan servis bırakmaz).

### 5.3 Swagger UI üzerinden manuel test

1. `./run.sh` ile sunucuyu başlatın.
2. Tarayıcıda http://127.0.0.1:8000/docs adresini açın.
3. `POST /scooter-fee` satırını genişletin → **Try it out**.
4. Request body'yi düzenleyip (ör. `{"duration_minutes": 45, "tax_percent": 20}`) **Execute**'e basın.
5. Response gövdesi ve HTTP status kodu doğrudan sayfada görünür.

## 6. Sonuç

- Red → Green döngüsü uygulandı ve belgelendi (Bölüm 2, 4).
- 24/24 pytest testi geçiyor; tüm AC-01...AC-12 izlenebilir şekilde
  test edildi (Bölüm 4 tablosu).
- Gerçek FastAPI sunucusuna karşı manuel curl testleri, otomatik testlerle
  aynı sonuçları üretti (Bölüm 5.2) — implementasyon hem otomatik hem
  manuel doğrulamadan geçti.
- Spec'in ötesinde eklenen tek davranış, BR-08 dışı şema hataları için
  genel bir `INVALID_REQUEST` güvenlik ağıdır (Bölüm 4, Not); bu bir
  Open Decision olarak değil, dokümante edilmiş bir implementasyon
  detayı olarak bırakılmıştır çünkü hiçbir AC'yi ihlal etmez veya
  değiştirmez.
