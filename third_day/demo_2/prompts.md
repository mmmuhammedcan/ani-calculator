# Prompts Log

## Prompt 1

```
ROLE: Sen bu projenin teknik lideri ve süreç bekçisisin.

CONTEXT: Yeni bir proje başlıyoruz. Servis: scooter sürüş süresine göre
ücret hesaplayan bir REST API.

RULES:
- Bu projede geliştirme SIRASI şudur ve asla bozulmaz:
  raw request -> mini-spec -> acceptance criteria (Gherkin) -> tests -> code
- Bir sonraki adıma, kullanıcı açıkça "devam et / şu adıma geç" demeden geçme.
- Hiçbir iş kararını (fiyat, limit, kural) varsayma; belirsizse Open Decisions
  altında soru olarak listele.
- Kod: Python 3.11 + FastAPI + pytest. Persistence yok, in-memory.
- Yorum/docstring/test isimleri İngilizce; spec ve feature dosyaları Türkçe.
- Her kullanıcı promptunu prompts.md'ye ekleyerek logla.

OUTPUT: Sadece AGENTS.md dosyasını oluştur (yukarıdaki kuralları içerecek
şekilde). Başka hiçbir dosya oluşturma. İşin bitince "AGENTS.md hazır,
onay bekliyorum" de ve dur.
```

## Prompt 2

```
ROLE: Sen bir iş analistisin. Bu adımda KOD YAZMIYORSUN.

CONTEXT: AGENTS.md'deki kurallara uyuyorsun (oku ve uygula).

RAW REQUEST:
"Scooter sürüşünün süresine göre ödenecek ücreti hesaplayan bir servis
istiyoruz. POST /scooter-fee endpoint'i olacak."

RULES:
- Bilmediğin her iş kararını (fiyat, limit, ücretsiz süre, hata kodu,
  yuvarlama yönü, alan adları) VARSAYMA. Q-01, Q-02... formatında sor,
  kimin cevaplayacağını belirt.
- Business Rule (fiyat/limit/eşik) ile Technical Constraint (framework/
  dil/veri tipi) ayrı bölümlerde olsun.
- Açık soru varken durum "Ready for implementation" OLAMAZ.

OUTPUT (docs/spec/mini-spec.md, bu sırayla, TÜRKÇE):
1. Spec Card (durum: Draft/Pending decision/Ready)
2. Amaç ve Başarı Sinyali
3. Kapsam / Kapsam Dışı
4. Girdi-Çıktı-Hata Sözleşmesi
5. Business Rules (kararı verilmişse)
6. Acceptance Criteria (yazılamıyorsa neden yazılamadığını belirt)
7. Technical Constraints
8. Open Decisions (Q-01, Q-02...)
9. Readiness Check
```

## Prompt 3

```
Tamamdır, şimdi bunu sektör standartlarında yapmamız lazım. Sen olsan şu
aşamada nasıl ilerlerdin, nasıl bir yol izlerdin, neyi farklı yapardın ya
da eklenecek bir adım var mı? Şimdi specleri görüyoruz, mini-spec.md
dosyasını okuyalım, eksik bir kısım var mı onu cevaplayalım. Onun
dışında hazır sorular var ya, biz sadece şimdilik deneme yapıyoruz,
bunların herhangi birini cevap olarak işaretleyebiliriz; onları da
doldurmanı istiyorum. Mesela spec olarak indirim eklenebilir, hani her
saatte bir indirim olabilir gibi. Bir de mesela vergi durumu eklenebilir.
Sektör standartlarına getirmek için aklına neler geliyor şu an? Mesela
bir başlangıç ücreti olur, mesela onun dışında da işte dediğim gibi
yarım saatte bir indirim olabilir ya da farklı şeyler, bilmiyorum,
sektör best practice olmasını istiyorum şu an.
```

## Prompt 4

```
Doldurduktan sonra bu aşamada dur ve AGENTS.md kurallarına sen de riayet
et. Sonra sektör best practice için benim promptlarımı bekle, öneriler
sunabilirsin.
```

## Prompt 5

```
fro now you should create and fill gherking files iniate testing by
using pytest see the fails then apply implementation see validaitons
write an report about this in a report.md which explains fails and
validations in different parts also in order to do manual testing
write the deployment code and manual test examples to see it in fast
api
```
