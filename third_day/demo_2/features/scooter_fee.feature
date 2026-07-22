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
