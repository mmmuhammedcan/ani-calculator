# Mini-Spec: Scooter Fee Hesaplama Servisi

## 1. Spec Card

- **Servis:** `POST /scooter-fee`
- **Amaç:** Scooter sürüşünün süresine göre ödenecek ücretin hesaplanması
- **Durum:** Pending decision *(Q-09 açık kaldığı için)*

## 2. Amaç ve Başarı Sinyali

Kullanıcı, bir scooter sürüşünün süresini gönderdiğinde API'nin ödenecek ücreti hesaplayıp döndürmesi beklenmektedir. Başarı sinyali, verilen sürüş süresine karşılık doğru ve tutarlı bir ücretin döndürülmesidir. Ücretin nasıl hesaplanacağına dair (dakika başı ücret, taban ücret, vb.) iş kuralları henüz belirlenmediğinden başarı kriteri şu an için netleştirilememektedir.

## 3. Kapsam / Kapsam Dışı

**Kapsam:**
- `POST /scooter-fee` endpoint'i üzerinden sürüş süresine göre ücret hesaplama

**Kapsam Dışı:**
- Kalıcılık / veritabanı katmanı (sadece in-memory çalışılacak)
- Kullanıcı yönetimi, kimlik doğrulama, ödeme işlemleri
- Scooter/lokasyon takibi

## 4. Girdi, Çıktı ve Hata Sözleşmesi

**Girdi (İstek):** `POST /scooter-fee`
```json
{
  "duration_minutes": 7.5
}
```
- `duration_minutes`: sürüş süresi, dakika cinsinden sayısal değer (ondalık olabilir). *(Q-05 yanıtıyla karara bağlanmıştır.)*

**Çıktı (Başarılı Yanıt):**
```json
{
  "fee": 47.50
}
```
- `fee`: TL cinsinden ödenecek ücret; en fazla 2 basamaklı ondalık küsürat içerir. *(Q-06 kapsamında alan adı örnek olarak sunulmuş ve kullanıcı tarafından onaylanmıştır.)*

**Hata Sözleşmesi:**
- Geçersiz girdi durumunda (örn. eksik alan, negatif süre, sayısal olmayan değer) API **HTTP 400** döner. *(Q-07 yanıtıyla karara bağlanmıştır.)*
- Hata gövdesinin tam mesaj/alan formatı henüz belirlenmemiştir (bkz. Open Decisions, Q-09).
- `duration_minutes` için geçerli minimum değer (örn. 0 kabul edilir mi, yoksa >0 mı zorunludur) henüz belirlenmemiştir (bkz. Open Decisions, Q-09).

## 5. Business Rules

- **BR-01:** Ücret, sürüş süresine dakika bazında hesaplanır; dakika başına ücret **5 TL**'dir. *(Q-01 yanıtıyla karara bağlanmıştır.)*
- **BR-02:** Her sürüşte sabit bir açılış (kilit açma) ücreti uygulanır; tutarı **10 TL**'dir. *(Q-02 yanıtıyla karara bağlanmıştır.)*
- **BR-03:** Ücretsiz bir başlangıç süresi yoktur; sürüşün tamamı ücretlendirilir. *(Q-03 yanıtıyla karara bağlanmıştır.)*
- **BR-04:** Toplam ücrete **1000 TL** üst limit (tavan) uygulanır; hesaplanan ücret bu değeri aşarsa 1000 TL olarak sınırlandırılır. *(Q-04 yanıtıyla karara bağlanmıştır.)*
- **BR-05:** Ücret hesaplamasından önce sürüş süresi (dakika) **yukarı yuvarlanır** (örn. 3.2 dakika -> 4 dakika olarak ücretlendirilir). *(Q-08 yanıtıyla karara bağlanmıştır.)*
- **Hesaplama formülü:** `fee = min(1000, 10 + 5 * ceil(duration_minutes))` (TL, en fazla 2 basamaklı ondalık küsürat ile)

## 6. Acceptance Criteria

- **AC-01:** `duration_minutes = 1` gönderildiğinde `fee = 15.00` (10 açılış + 1 dakika * 5 TL) dönmelidir.
- **AC-02:** `duration_minutes = 3.2` gönderildiğinde süre yukarı yuvarlanarak 4 dakika olarak hesaplanır ve `fee = 30.00` (10 + 4*5) dönmelidir.
- **AC-03:** Hesaplanan ücret 1000 TL'yi aşan durumlarda (örn. çok uzun sürüş süresi) `fee = 1000.00` olarak sınırlandırılmalıdır.
- **AC-04:** Negatif bir `duration_minutes` değeri gönderildiğinde API **HTTP 400** hatası dönmelidir.
- **AC-05:** `duration_minutes` alanı eksik veya sayısal olmayan bir değerle gönderildiğinde API **HTTP 400** hatası dönmelidir.
- **AC-06 (yazılamıyor):** `duration_minutes = 0` (veya negatif olmayan sınır değerler) için beklenen davranış, Q-09 yanıtlanmadan tanımlanamamaktadır.

### Gherkin Senaryoları

```gherkin
# language: tr
Özellik: Scooter ücret hesaplama
  Kullanıcı olarak, sürüş süremi gönderdiğimde ödeyeceğim ücretin
  doğru şekilde hesaplanmasını istiyorum.

  Senaryo: Bir dakikalık sürüş için ücret hesaplanır (AC-01)
    Given sürüş süresi 1 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 15.00 TL olarak hesaplanır

  Senaryo: Kesirli sürüş süresi yukarı yuvarlanır (AC-02)
    Given sürüş süresi 3.2 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And süre 4 dakikaya yuvarlanır
    And ücret 30.00 TL olarak hesaplanır

  Senaryo: Ücret üst limiti aşıldığında tavan uygulanır (AC-03)
    Given sürüş süresi, hesaplanan ücretin 1000 TL'yi aşmasına neden olacak kadar uzundur
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And ücret 1000.00 TL olarak sınırlandırılır

  Senaryo: Negatif süre geçersiz kabul edilir (AC-04)
    Given sürüş süresi negatif bir değerdir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur

  Senaryo: Eksik süre alanı geçersiz kabul edilir (AC-05)
    Given istek gövdesinde "duration_minutes" alanı bulunmaz
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur

  Senaryo: Sayısal olmayan süre değeri geçersiz kabul edilir (AC-05)
    Given "duration_minutes" alanı sayısal olmayan bir değer içerir
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 400 olur
```

Yukarıdaki senaryoların birebir aynısı `features/scooter_fee.feature` dosyasında da bulunmaktadır. Bu senaryolara karşılık gelen pytest testleri `tests/test_scooter_fee.py` dosyasında (İngilizce test isimleriyle) yer almaktadır.

## 7. Technical Constraints

1. **Teknoloji Yığını:** Python 3.11, FastAPI, pytest
2. **Kalıcılık / Veritabanı:** Kapsam dışı (yalnızca in-memory, kalıcı katman yok)
3. **Dil Konvansiyonu:** Kod yorumları, docstring'ler ve test isimleri İngilizce; spec ve feature dosyaları Türkçe yazılacak
4. **Süreç Kısıtı:** Spec-Driven Development sırası (ham talep -> mini-spec -> kabul kriterleri -> testler -> kod) ihlal edilmeyecek; talep edilmeden implementasyon kodu veya adım atlaması yapılmayacak
5. **Yuvarlama:** Çıktıdaki `fee` değeri en fazla 2 basamaklı ondalık küsürat ile döndürülür. *(Q-06 yanıtıyla karara bağlanmıştır.)*
6. **Süre Yuvarlama:** Girdideki `duration_minutes` değeri, ücret hesaplanmadan önce bir üst tam sayıya yuvarlanır (ceiling). *(Q-08 yanıtıyla karara bağlanmıştır.)*

## 8. Open Decisions

- **Q-09:** `duration_minutes` için geçerli minimum değer nedir? 0 (veya 0'a çok yakın küçük bir değer) geçerli bir girdi midir, yoksa süre sıfırdan büyük mü olmalıdır? Bu, hata sözleşmesinin (400 dönen durumlar) net sınırını belirlemek için gereklidir. *(Yanıtlayacak: Ürün sahibi / İş birimi)*

## 9. Readiness Check

Q-01 ... Q-08 karara bağlanmıştır. Ancak **Q-09** (`duration_minutes` için minimum geçerli değer) hâlâ açık olduğundan ve bu, hata sözleşmesinin tam sınırını etkilediğinden, döküman durumu **"Pending decision"** olarak işaretlenmiştir; **"Ready for implementation"** değildir.
