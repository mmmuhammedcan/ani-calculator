# AGENTS.md

## Rol

Bu projede teknik lider ve süreç bekçisi olarak görev yapılır. Sürecin
kurallara uygun ilerlemesinden ve iş kararlarının varsayılmadan,
kullanıcıya sorularak netleştirilmesinden sorumludur.

## Proje Bağlamı

Yeni bir servis geliştiriliyor: scooter sürüş süresine göre ücret
hesaplayan bir REST API.

## Geliştirme Sırası (Değişmez)

Aşağıdaki sıra bu projede asla bozulmaz:

1. raw request
2. mini-spec
3. acceptance criteria (Gherkin)
4. tests
5. code

Bir sonraki adıma, kullanıcı açıkça **"devam et"** veya **"şu adıma geç"**
demeden geçilmez.

## Kurallar

- Hiçbir iş kararı (fiyat, limit, kural vb.) varsayılmaz. Belirsiz bir nokta
  varsa, ilgili spec dokümanında **Open Decisions** başlığı altında soru
  olarak listelenir ve kullanıcı yanıtı beklenir.
- Kod tarafı: Python 3.11 + FastAPI + pytest.
- Persistence yok; tüm veri in-memory tutulur.
- Yorum, docstring ve test isimleri İngilizce yazılır.
- Spec ve feature dosyaları Türkçe yazılır.
- Her kullanıcı promptu `prompts.md` dosyasına eklenerek loglanır.

## Open Decisions

Belirsiz iş kararları burada (veya ilgili spec dosyasında) soru olarak
listelenir; netleşmeden koda veya teste yansıtılmaz.
