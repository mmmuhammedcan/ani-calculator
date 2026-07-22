# Mini Spec: Scooter Fee Servisi

## 1. Spec Card

| Alan | Değer |
|---|---|
| Servis | Scooter sürüş süresine göre ücret hesaplama (indirim + opsiyonel vergi dahil) |
| Endpoint | `POST /scooter-fee` |
| Durum | **Ready for implementation** |
| Sahip | İş Analisti (bu doküman) |
| Bağımlılık | Tüm Open Decisions (Q-01 ... Q-15) yanıtlandı |

## 2. Amaç ve Başarı Sinyali

**Amaç:** Bir scooter sürüşünün süresine göre kullanıcının ödeyeceği
ücreti; kademeli (hacim) indirim ve opsiyonel KDV dahil olacak şekilde
hesaplayan bir REST endpoint sağlamak.

**Başarı Sinyali:** Geçerli bir sürüş süresi verildiğinde, servis
BR-01...BR-08'e göre doğru ve tutarlı bir ücret döndürür; geçersiz
girdilerde (negatif/sıfır/eksik/tip hatası/aşırı uzun süre) tutarlı bir
hata gövdesiyle HTTP 400 döner.

## 3. Kapsam / Kapsam Dışı

**Kapsam:**
- Tek bir sürüşün süresi girdi olarak alınır, ücret hesaplanıp döndürülür.
- Kademeli (hacim) indirim: 30 dakikadan sonraki süre indirimli
  ücretlendirilir (bkz. BR-04, Q-12).
- Opsiyonel KDV hesabı: istek üzerinde `tax_percent` verilirse uygulanır
  (bkz. BR-07, Q-11).

**Kapsam Dışı:**
- Ödeme/tahsilat işlemi (gerçek bir ödeme sağlayıcısına entegrasyon yok).
- Kullanıcı, scooter, sürüş geçmişi gibi verilerin kalıcı olarak
  saklanması (AGENTS.md gereği persistence yok, in-memory).
- Kimlik doğrulama / yetkilendirme.
- İndirim kodu, kampanya, üyelik planı gibi kullanıcıya özel fiyatlandırma
  mekanizmaları (bu iterasyonda yalnızca süreye bağlı kademeli indirim var).

## 4. Girdi-Çıktı-Hata Sözleşmesi

**Girdi:**
```json
POST /scooter-fee
{
  "duration_minutes": 45,
  "tax_percent": 20
}
```
- `duration_minutes`: sayısal (Decimal), zorunlu. Sıfırdan büyük olmalı
  (bkz. Q-15). 1440'ı (24 saat) aşamaz (bkz. Q-09).
- `tax_percent`: sayısal (Decimal), **opsiyonel**, varsayılan `0`.
  `[0, 100]` aralığında olmalı (bkz. Q-11).

**Çıktı (Başarılı Yanıt, HTTP 200):**
```json
{
  "fee": 264.00,
  "currency": "TRY",
  "duration_minutes_billed": 45,
  "tax_amount": 44.00
}
```
- `fee`: nihai ödenecek tutar (vergi dahil), 2 basamak ondalık (bkz. Q-06, Q-13).
- `currency`: sabit `"TRY"` (bkz. Q-10).
- `duration_minutes_billed`: yuvarlama sonrası faturalanan dakika (şeffaflık için, bkz. Q-10).
- `tax_amount`: hesaplanan vergi tutarı; `tax_percent` gönderilmediyse `0.00` (bkz. Q-11).

**Hata Sözleşmesi (HTTP 400):**
```json
{
  "error": {
    "code": "NEGATIVE_DURATION",
    "message": "duration_minutes must not be negative."
  }
}
```
Şema, bu repodaki `demo_1/app/pricing.py` (`DomainError`) ile
tutarlıdır (bkz. Q-08, Q-14). Olası `code` değerleri: BR-08 tablosuna bakınız.

## 5. Business Rules

- **BR-01:** Sürüş süresi `duration_minutes` alanıyla, doğrudan dakika
  cinsinden gönderilir (zaman damgası değil). *(Q-01, Q-02 yanıtıyla karara bağlanmıştır.)*
- **BR-02:** Her sürüşte sabit **10 TL** açılış (kilit açma) ücreti uygulanır. *(Q-05)*
- **BR-03:** Ücretsiz bir başlangıç süresi yoktur; sürüşün tamamı ücretlendirilir. *(Q-04)*
- **BR-04 (Kademeli İndirim):** İlk 30 dakika tam ücretle (**5 TL/dakika**)
  ücretlendirilir; 30 dakikayı aşan her dakika **%20 indirimli**
  (**4 TL/dakika**) ücretlendirilir. *(Q-03, Q-12 yanıtıyla karara bağlanmıştır — bu proje kapsamında yeni eklenen indirim mekanizması.)*
- **BR-05:** Ücret hesaplanmadan önce sürüş süresi (dakika) **yukarı
  yuvarlanır** (`ceil`); örn. 3.2 dk → 4 dk. *(Q-07)*
- **BR-06 (Tavan):** Açılış ücreti + kademeli dakika ücretinin toplamı
  (vergi hariç) **1000 TL** ile sınırlandırılır. Bu tavan vergi
  eklenmeden **önce**, indirim uygulanmış tutara göre hesaplanır.
- **BR-07 (KDV):** `tax_percent` gönderilirse, **tavanlanmış** sürüş
  ücreti üzerinden `tax_amount = ride_fee * tax_percent / 100` hesaplanır
  ve nihai `fee`'ye eklenir. `tax_percent` gönderilmezse `0` kabul edilir.
  Vergi eklenmesi, nihai `fee`'nin 1000 TL tavanını aşmasına neden
  olabilir — bu beklenen bir durumdur (tavan yalnızca vergi öncesi
  sürüş ücretine uygulanır). *(Q-11 yanıtıyla karara bağlanmıştır.)*
- **BR-08 (Geçersiz Girdi Kodları):**

  | Durum | HTTP | `error.code` |
  |---|---|---|
  | `duration_minutes` negatif | 400 | `NEGATIVE_DURATION` |
  | `duration_minutes` sıfır | 400 | `NON_POSITIVE_DURATION` *(Q-15)* |
  | `duration_minutes` eksik | 400 | `MISSING_DURATION` |
  | `duration_minutes` sayısal değil | 400 | `INVALID_DURATION_TYPE` |
  | `duration_minutes` > 1440 | 400 | `DURATION_TOO_LONG` *(Q-09)* |
  | `tax_percent` [0,100] dışında | 400 | `INVALID_TAX_PERCENT` |

- **Hesaplama formülü (özet):**
  ```
  rounded  = ceil(duration_minutes)
  tier1    = min(rounded, 30)
  extra    = max(rounded - 30, 0)
  ride_fee = min(10 + tier1*5 + extra*4, 1000)      # BR-01..BR-06
  tax      = ride_fee * tax_percent / 100            # BR-07
  fee      = ride_fee + tax
  ```

## 6. Acceptance Criteria

- **AC-01:** `duration_minutes=1` → `fee=15.00`, `tax_amount=0.00` (10 + 1×5).
- **AC-02:** `duration_minutes=3.2` → 4 dakikaya yuvarlanır → `fee=30.00` (10 + 4×5).
- **AC-03 (kademeli indirim):** `duration_minutes=45` → ilk 30 dk × 5 TL (150) + 15 dk × 4 TL (60) + 10 TL açılış = `fee=220.00`.
- **AC-04 (tavan):** `duration_minutes=500` → ham tutar tavanı aşar, `fee=1000.00` olarak sınırlandırılır.
- **AC-05 (KDV):** `duration_minutes=45`, `tax_percent=20` → `ride_fee=220.00`, `tax_amount=44.00`, `fee=264.00`.
- **AC-06:** `duration_minutes=0` → HTTP 400, `code=NON_POSITIVE_DURATION`.
- **AC-07:** `duration_minutes=-5` → HTTP 400, `code=NEGATIVE_DURATION`.
- **AC-08:** `duration_minutes` alanı eksik → HTTP 400, `code=MISSING_DURATION`.
- **AC-09:** `duration_minutes="abc"` (sayısal değil) → HTTP 400, `code=INVALID_DURATION_TYPE`.
- **AC-10:** `duration_minutes=1441` → HTTP 400, `code=DURATION_TOO_LONG`.
- **AC-11:** `tax_percent=150` (aralık dışı) → HTTP 400, `code=INVALID_TAX_PERCENT`.
- **AC-12 (şeffaflık):** Her başarılı yanıt `currency="TRY"` ve doğru `duration_minutes_billed` alanlarını içerir.

### Gherkin Senaryoları

```gherkin
# language: tr
Özellik: Scooter ücret hesaplama
  Kullanıcı olarak, sürüş süremi gönderdiğimde ödeyeceğim ücretin
  kademeli indirim ve opsiyonel KDV dahil doğru hesaplanmasını istiyorum.

  Senaryo: Bir dakikalık sürüş için ücret hesaplanır (AC-01)
    Given sürüş süresi 1 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 15.00 TL olarak hesaplanır

  Senaryo: Kesirli sürüş süresi yukarı yuvarlanır (AC-02)
    Given sürüş süresi 3.2 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 30.00 TL olarak hesaplanır

  Senaryo: 30 dakikayı aşan süre kademeli indirimle ücretlendirilir (AC-03)
    Given sürüş süresi 45 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 220.00 TL olarak hesaplanır

  Senaryo: Ücret üst limiti aşıldığında tavan uygulanır (AC-04)
    Given sürüş süresi, hesaplanan ücretin 1000 TL'yi aşmasına neden olacak kadar uzundur
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 1000.00 TL olarak sınırlandırılır

  Senaryo: KDV oranı verildiğinde nihai ücrete eklenir (AC-05)
    Given sürüş süresi 45 dakikadır
    And vergi oranı %20'dir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And vergi tutarı 44.00 TL olarak hesaplanır
    And ücret 264.00 TL olarak hesaplanır

  Senaryo: Sıfır süre geçersiz kabul edilir (AC-06)
    Given sürüş süresi 0 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "NON_POSITIVE_DURATION" olur

  Senaryo: Negatif süre geçersiz kabul edilir (AC-07)
    Given sürüş süresi negatif bir değerdir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "NEGATIVE_DURATION" olur

  Senaryo: Eksik süre alanı geçersiz kabul edilir (AC-08)
    Given istek gövdesinde "duration_minutes" alanı bulunmaz
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "MISSING_DURATION" olur

  Senaryo: Sayısal olmayan süre değeri geçersiz kabul edilir (AC-09)
    Given "duration_minutes" alanı sayısal olmayan bir değer içerir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "INVALID_DURATION_TYPE" olur

  Senaryo: Aşırı uzun süre geçersiz kabul edilir (AC-10)
    Given sürüş süresi 1441 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "DURATION_TOO_LONG" olur

  Senaryo: Geçersiz vergi oranı reddedilir (AC-11)
    Given sürüş süresi 10 dakikadır
    And vergi oranı %150'dir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
    And hata kodu "INVALID_TAX_PERCENT" olur
```

Yukarıdaki senaryolar `features/scooter_fee.feature` dosyasında da
bulunacaktır (bir sonraki adımda oluşturulacak). Bu senaryolara karşılık
gelen pytest testleri `tests/test_scooter_fee.py` dosyasında (İngilizce
test isimleriyle) yer alacaktır.

## 7. Technical Constraints

1. **Teknoloji Yığını:** Python 3.11, FastAPI, pytest.
2. **Kalıcılık / Veritabanı:** Kapsam dışı (yalnızca in-memory, kalıcı katman yok).
3. **Dil Konvansiyonu:** Kod yorumları, docstring'ler ve test isimleri
   İngilizce; spec ve feature dosyaları Türkçe yazılacak.
4. **Süreç Kısıtı:** Spec-Driven Development sırası (ham talep → mini-spec
   → kabul kriterleri → testler → kod) ihlal edilmeyecek.
5. **Para Hesaplamaları (Q-13):** Tüm parasal hesaplamalar **`Decimal`**
   tipiyle yapılacaktır; `float` **kullanılmayacaktır**. Bu repodaki
   `demo_1/app/pricing.py` ile aynı standart. Yuvarlama **`ROUND_HALF_UP`**
   ile 2 basamağa yapılır (Python'un yerleşik `round()` fonksiyonu
   banker's rounding — round-half-to-even — yaptığı için bu kural
   açıkça belirtilir; `round()` kullanmak bu standardı ihlal eder).
6. **Hata Şeması (Q-08, Q-14):** Hatalar `DomainError` benzeri bir
   yapı üzerinden `{"error": {"code": "...", "message": "..."}}`
   şeklinde, HTTP 400 ile döndürülür. `code` alanı `SCREAMING_SNAKE_CASE`
   formatındadır (bkz. BR-08 tablosu).
7. **Süre Yuvarlama:** Girdideki `duration_minutes` değeri, ücret
   hesaplanmadan önce bir üst tam sayıya yuvarlanır (`ceil`).

## 8. Open Decisions

Tüm sorular yanıtlanmış ve kararlar Business Rules / Technical
Constraints bölümlerine işlenmiştir. Bu bölüm, karar geçmişinin izlenebilir
olması için referans amaçlı korunmuştur.

| ID | Soru | Karar |
|---|---|---|
| Q-01 | Süre nasıl temsil edilecek? | Doğrudan dakika değeri (zaman damgası değil) |
| Q-02 | Alan adı/tipi? | `duration_minutes: Decimal` |
| Q-03 | Dakika başı ücret ve para birimi? | 5 TL/dk (ilk 30 dk), TRY |
| Q-04 | Ücretsiz başlangıç süresi var mı? | Hayır |
| Q-05 | Sabit açılış ücreti var mı? | Evet, 10 TL |
| Q-06 | Para birimi/hassasiyet? | TRY, 2 basamak ondalık |
| Q-07 | Kısmi dakika yuvarlama yönü? | Yukarı (`ceil`) |
| Q-08 | Geçersiz girdi HTTP/format? | 400, `{"error": {"code","message"}}` |
| Q-09 | Azami süre limiti? | 1440 dk (24 saat), aşarsa `DURATION_TOO_LONG` hatası |
| Q-10 | Response'da ek alanlar? | `currency`, `duration_minutes_billed`, `tax_amount` |
| Q-11 *(yeni — sektör standardı)* | KDV/vergi mekanizması olacak mı? | Evet, opsiyonel `tax_percent` (varsayılan 0, [0,100]), tavan sonrası uygulanır |
| Q-12 *(yeni — sektör standardı)* | İndirim politikası olacak mı? | Evet, 30 dk sonrası %20 indirimli (kademeli/hacim indirimi) |
| Q-13 *(yeni — sektör standardı)* | Ondalık/yuvarlama standardı? | `Decimal` + `ROUND_HALF_UP`, float yasak (`demo_1` ile tutarlı) |
| Q-14 *(yeni — sektör standardı)* | Hata kodu isimlendirme şeması? | `SCREAMING_SNAKE_CASE`, `demo_1/DomainError` şemasıyla tutarlı |
| Q-15 *(yeni — sektör standardı)* | `duration_minutes = 0` geçerli mi? | Hayır, `NON_POSITIVE_DURATION` ile reddedilir |

## 9. Readiness Check

- [x] Tüm Open Decisions (Q-01 ... Q-15) yanıtlandı.
- [x] Business Rules bölümü dolduruldu (BR-01 ... BR-08).
- [x] Acceptance Criteria yazıldı (AC-01 ... AC-12) ve Gherkin senaryolarına dönüştürüldü.

**Durum: Ready for implementation.** Bir sonraki adım: `features/scooter_fee.feature`
dosyasının oluşturulması ve ardından pytest testlerinin (önce fail, sonra
implementasyon) yazılması — kullanıcı onayı ile.
