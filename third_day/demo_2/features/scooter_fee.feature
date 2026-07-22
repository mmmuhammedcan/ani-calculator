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

  Senaryo: Başarılı yanıt şeffaflık alanlarını içerir (AC-12)
    Given sürüş süresi 45 dakikadır
    When "/scooter-fee" adresine ücret hesaplama isteği gönderilir
    Then yanıt kodu 200 olur
    And para birimi "TRY" olur
    And faturalanan süre 45 dakika olarak döner
