# Review Notu — Calculator Parentheses / Negative Number Feature

Bu doküman, workshop'un tanımladığı 4 adımlı review sürecinin ilk iki
adımını (**Review Checklist** ve **Review Notu**) bu geliştirme süreci
boyunca zaten yapılmış olan incelemeler üzerinden geriye dönük olarak
formalize eder. 3. adım (**Düzeltme Prompt'u**) daha önce bu oturumda
fiilen uygulanmıştı; bu doküman o adımın eşiğinde duruyor — yeni bir
düzeltme prompt'u burada tasarlanmıyor, onay bekleniyor.

---

## 1. Review Checklist (4 eksen)

| Eksen | Kontrol edildi mi? | Sonuç |
|---|---|---|
| Edge Case | ✅ | 2 eksik bulundu, ikisi de kapatıldı |
| Güvenlik | ✅ | 2 gerçek, canlı testle doğrulanmış (CONFIRMED) açık bulundu, ikisi de kapatıldı |
| Performans | ✅ | Güvenlik açığıyla örtüşen 1 bulgu, ayrıca kontrol edilen alanlar temiz |
| Business Uyumu | ✅ | 1 sessiz iş kuralı ihlali bulundu ve kapatıldı; geri kalanı tam uyumlu |

---

## 2. Review Notu (bulgu bazlı)

### Edge Case #1 — Negatif sayı literali tamamen eksikti

- **Ne gördüm:** Orijinal tokenizer/evaluator, `-5` gibi bir formülün
  başındaki veya bir operatörden hemen sonraki `-` işaretini "sayının bir
  parçası" (unary minus) olarak değil, geçersiz bir sözdizimi olarak
  yorumluyordu. `-5 + 3`, `3 * -2`, `10 / -2` gibi tüm formüller
  reddediliyordu; sadece çıkarma yoluyla elde edilen negatif *sonuçlar*
  destekleniyordu, negatif *operandlar* değil.
- **Neden önemli:** Gerçek bir hesap makinesi API'sinde negatif sayı
  girilebilmesi temel bir beklenti; bu eksiklik hem `calculator.feature`
  hem de yeni eklenen `calculator_parentheses.feature` için AC
  kapsamının eksik olduğu anlamına geliyordu.
- **Öneri / yapılan:** Hem temel hem parantez feature dosyalarına
  toplam 11 yeni Gherkin senaryosu eklendi (ilk operand, operatörden
  sonra, bölme/çarpma ile, parantez içinde, parantezi negatife çevirme
  vb.), parser recursive-descent'e çevrilerek `factor := "-" factor |
  "(" expression ")" | NUMBER` kuralıyla doğal şekilde desteklendi.

### Edge Case #2 — Parantezle ilgili eksik senaryolar

- **Ne gördüm:** İlk yazılan parantez AC'lerinde şu durumlar test
  edilmiyordu: tüm formülü saran gereksiz parantez, parantezden negatif
  sonuç, operatörsüz bitişik iki parantez grubu (örtük çarpma), fazla
  kapanış parantezi, parantez içinde tam bölünmeyen/sıfıra bölme.
- **Neden önemli:** Bu senaryolar yazılmadan implementasyona geçilseydi,
  parser bu durumları ya yanlış kabul edecek ya da yanlış hata mesajıyla
  reddedecekti — nitekim ilk implementasyonda parantez içi bölme
  hataları "not valid" olarak yanlış sınıflandırılıyordu.
- **Öneri / yapılan:** 6 yeni senaryo eklendi; implementasyon sonrası
  hepsi doğru hata mesajlarıyla (`must be an integer`,
  `Division by zero...`) geçer hale geldi.

### Güvenlik #1 — Sınırsız recursion derinliği → stack overflow (DoS) + bilgi sızıntısı

- **Ne gördüm:** Parser, iç içe parantez veya art arda `-` işaretlerini
  `parseFactor`'ün kendini çağırmasıyla çözüyordu; derinliğe hiçbir üst
  sınır yoktu. Canlı sunucuya karşı **doğrulandı**: yaklaşık 30KB'lık,
  15.000 seviye iç içe parantez içeren tek bir istek
  (`RangeError: Maximum call stack size exceeded`) sunucudan HTTP 500
  döndürdü ve yanıt gövdesinde **tam stack trace + sunucunun mutlak
  dosya yolları** göründü.
- **Neden önemli:** Bu, kimliği doğrulanmamış herhangi bir istemcinin
  makul boyutta tek bir istekle servisi bozabileceği (DoS) ve sunucunun
  iç dosya yapısını öğrenebileceği (information disclosure) ciddi bir
  güvenlik açığı; `NODE_ENV` production olarak ayarlanmadığı için
  Express'in varsayılan hata sayfası stack trace'i olduğu gibi
  yansıtıyordu.
- **Öneri / yapılan:** `Parser` sınıfına `MAX_DEPTH = 20` derinlik
  sayacı eklendi (try/finally ile güvenli sayım); sınır aşılınca normal
  bir "formula is not valid" (400) hatası dönüyor, stack overflow'a hiç
  gidilmiyor. Ayrıca canlı testle tekrar doğrulandı: aynı istek artık
  400 dönüyor, sızıntı yok.

### Güvenlik #2 (aynı kökten ikinci bulgu) — Genel hata yönetimi stack trace sızdırıyordu

- **Ne gördüm:** `app.ts`, `CalculationError` dışındaki her hatayı
  (`throw error`) doğrudan Express'in varsayılan hata işleyicisine
  bırakıyordu. Bu sadece yukarıdaki RangeError için değil, body-parser'ın
  ürettiği `PayloadTooLargeError` (413, aşırı büyük istek gövdesi) için
  de aynı şekilde tam stack trace + dosya yolu döndürdüğü canlı testle
  görüldü.
- **Neden önemli:** Tek bir noktada (route handler) hata yakalamak
  yeterli değil; middleware zincirinin herhangi bir yerinde (body-parser
  dahil) oluşan hatalar da aynı sızıntıya açıktı — kapsamı route
  handler'dan ibaret sanmak yanıltıcıydı.
- **Öneri / yapılan:** Express uygulamasının sonuna, 4 parametreli genel
  bir hata middleware'i eklendi; gerçek hatayı sadece sunucu tarafında
  (`console.error`) loglayıp istemciye her zaman genel bir mesaj
  (`{"error": "The request could not be processed."}`) dönüyor, durum
  kodu hatanın kendi `status`'u varsa onu (örn. 413), yoksa 500
  kullanıyor.

### Performans — Güvenlik #1 ile aynı bulgu, performans/availability açısından

- **Ne gördüm:** Derinlik sınırı olmayan recursion aynı zamanda bir
  performans/kullanılabilirlik riskiydi: kötü niyetli olmayan ama çok
  karmaşık bir formül bile servisi (o isteğin işlendiği süre boyunca)
  meşgul edip 500'e düşürebilirdi.
- **Neden önemli:** Güvenlik ve performans burada aynı kökten
  (sınırsız girdi karmaşıklığı) kaynaklanıyor; ayrı ayrı çözüm
  gerektirmiyor.
- **Öneri / yapılan:** Yukarıdaki `MAX_DEPTH` düzeltmesiyle birlikte
  kapatıldı. Ayrıca kontrol edilip temiz bulunanlar: tokenizer/parser
  O(n) karmaşıklıkta (ek bir performans sorunu yok), veritabanı/persistans
  katmanı olmadığı için index kullanımı konusu bu proje kapsamında
  uygulanabilir değil (N/A).

### Business Uyumu — Sayısal literal taşması, "integer" iş kuralını sessizce ihlal ediyordu

- **Ne gördüm:** `Number.parseInt` çok uzun bir rakam dizisini (örn.
  400 haneli) sınırsız kabul ediyordu; sonuç `Infinity`'e taşıyordu.
  `calculate()` bunu hata saymadan **başarılı (200)** olarak
  döndürüyordu. `JSON.stringify(Infinity)` ise `null`'a dönüştüğü için
  istemci `{"result": null, ...}` alıyordu ama `formattedExpression`
  alanı hâlâ `"... = Infinity"` yazıyordu — içsel olarak tutarsız bir
  yanıt.
- **Neden önemli:** Feature dosyalarının en başında "Operands and
  results are integers" diye net bir iş kuralı var; bu durum o kuralı
  sessizce (hata döndürmeden) ihlal ediyordu — diğer tüm integer
  ihlalleri (tam bölünmeyen bölme, sıfıra bölme) doğru şekilde 400
  dönerken, bu durum farklı davranıyordu.
- **Öneri / yapılan:** Tokenizer'a `Number.isSafeInteger` kontrolü
  eklendi; sınırı aşan literaller artık diğerleriyle tutarlı şekilde
  "formula is not valid" (400) olarak reddediliyor. Karşılık gelen
  Gherkin senaryosu da eklendi.

### Temiz çıkan kontroller (bulgu değil, ama checklist'in parçası)

- **Race condition:** Yok — `calculate()` tamamen senkron, paylaşılan
  mutable state yok, her istek kendi `Parser` örneğini oluşturuyor.
- **Kod injection / `eval` riski:** Yok — formül sadece tokenize
  ediliyor, dinamik kod çalıştırma yok.
- **AGENTS.md / ATDD sürecine uyum:** Korundu — İngilizce dokümantasyon,
  Gherkin → test → implementasyon sırası, testler sadece gerçek HTTP
  üzerinden (`tests/steps`, `tests/support` hiç değiştirilmedi).
- **Regresyon:** Yok — 37/37 Gherkin senaryosu ve `tsc --noEmit` tüm
  düzeltmelerden sonra da yeşil.

---

## 3. Düzeltme Prompt'u

Review notundaki bulguları doğrudan referans alan, spesifik ve
uygulanabilir düzeltme prompt'u:

```
ROLE: Sen bu projenin implementasyon geliştiricisisin. Review'de bulunan
sorunları gidereceksin.

CONTEXT: backend/docs/features/calculator.feature ve
calculator_parentheses.feature altında ATDD ile yazılmış bir hesap
makinesi API'si var (proje o an tek klasördeydi; sonradan backend/frontend
olarak ayrıldı). Review'de iki gerçek, canlı testle doğrulanmış sorun
bulundu:

1. backend/src/calculator.ts'teki Parser, iç içe parantez veya ardışık
   unary minus derinliğine hiçbir üst sınır koymuyor; ~15.000 seviyede
   stack overflow (RangeError) oluşuyor. backend/src/app.ts:27'deki
   `throw error` bunu Express'in varsayılan hata sayfasına düşürüyor ve
   tam stack trace + sunucu dosya yollarını istemciye sızdırıyor
   (doğrulandı: HTTP 500).

2. Aynı dosyada sayı literalleri (Number.parseInt) için üst sınır yok;
   400 haneli bir sayı Infinity'e taşıyor, calculate() bunu hata
   saymadan 200 dönüyor; JSON.stringify(Infinity) => null olduğundan
   client "result": null görürken formattedExpression hâlâ "= Infinity"
   yazıyor — "operands/results are integers" kuralının sessiz ihlali.

RULES:
- ATDD sırasına uy: önce backend/docs/features/*.feature'a bu iki durumu
  kapsayan yeni Gherkin senaryoları ekle, sonra implementasyona geç.
- Mevcut test altyapısına (backend/tests/steps, backend/tests/support,
  backend/cucumber.js) dokunma; sadece feature dosyaları ve backend/src/
  değişsin.
- Yeni reddedilen durumlar da diğerleri gibi
  "The formula is not valid: <formula>" mesajıyla 400 dönmeli.
- backend/src/app.ts'e, CalculationError dışındaki HİÇBİR hatanın (RangeError,
  body-parser hataları dahil) stack trace/iç detay içermeden istemciye
  gitmemesini sağlayacak genel bir hata middleware'i ekle; gerçek hata
  sadece sunucu loguna yazılsın.
- Regresyon olmasın: mevcut tüm senaryolar hâlâ geçmeli.
- AGENTS.md, README.md ve ilgili dosya başı yorumları yeni davranışı
  yansıtacak şekilde güncelle.

OUTPUT: Değişiklikleri uygula, `npx tsc --noEmit` ve `npm test`
çalıştırıp sonucu raporla. Daha önce doğrulanan iki exploiti (derin
parantez isteği, aşırı büyük sayı literali) canlı sunucuya karşı tekrar
deneyip artık güvenli olduğunu kanıtla.
```

**Durum:** Bu prompt'un karşılığı, bu oturumda "evet şimdi
düzeltmelerimizi yapalım" onayıyla zaten fiilen uygulandı — yukarıdaki
her bulgunun "Öneri / yapılan" kısmı bu prompt'un çıktısını özetliyor.
`npx tsc --noEmit` ve `npm test` (37/37) temiz; iki exploit de canlı
sunucuya karşı tekrar denenip kapandığı doğrulandı.

## 4. Peer Review

Bu adım, çıktının bir partnere gönderilip ek bulgu istenmesini
gerektiriyor — elimdeki bilgiyle ben bunu sizin adınıza yapamam; bu
`REVIEW.md` dosyası peer review'e gönderilecek çıktı olarak kullanılabilir.

---

# Ek Review — Frontend (`frontend/`)

Backend'den sonra aynı 4 eksen bu kez piksel-sanatı hesap makinesi
arayüzü (`App.tsx`, `useCalculator.ts`, `Screen.tsx`, `Keypad.tsx`,
`calculatorApi.ts`) için çalıştırıldı. Aşağıdaki bulguların hepsi canlı
tarayıcıda (headless Chrome ile) gerçekten denenerek doğrulandı, tahmine
dayanmıyor.

## Checklist

| Eksen | Kontrol edildi mi? | Sonuç |
|---|---|---|
| Edge Case | ✅ | 2 gerçek bulgu (canlı doğrulandı) |
| Güvenlik | ✅ | 1 düşük öncelikli not, XSS temiz |
| Performans | ✅ | Sorun yok |
| Business | ✅ | 2 gerçek bulgu (biri edge case ile aynı kökten) |

## Review Notu

### Edge Case #1 — Backend kapalıyken kullanıcı ham tarayıcı hatası görüyor

- **Ne gördüm:** Backend'i kapatıp frontend'de `2 + 3` yazıp `=`'a
  bastığımda ekranda **"Failed to fetch"** yazdı — bu, `calculatorApi.ts`
  içindeki `fetch()` çağrısının attığı ham `TypeError` mesajı,
  `useCalculator.ts`'teki catch bloğu bunu doğrudan `error.message`
  olarak ekrana basıyor.
- **Neden önemli:** Son kullanıcı için "Failed to fetch" hiçbir şey ifade
  etmiyor; bu bir geliştirici hatası gibi görünüyor, "sunucuya
  ulaşılamıyor, birazdan tekrar deneyin" gibi bir mesaj yerine kafa
  karıştırıcı bir teknik detay sızdırıyor.
- **Öneri:** `calculatorApi.ts`'te `fetch`'i try/catch ile sarıp ağ
  hatalarını ("Failed to fetch" / `TypeError`) ayrı yakalayıp
  "Sunucuya ulaşılamıyor, lütfen daha sonra tekrar deneyin." gibi
  kullanıcı dostu bir mesaja çevirin.
- **Durum: düzeltildi.** `calculatorApi.ts`'te `fetch` artık try/catch
  ile sarılı; ağ hatasında `"Could not reach the server. Please try
  again."` gösteriliyor. Backend kapalıyken canlı testle doğrulandı.

### Edge Case #2 / Business #1 — Sonuçtan sonra zincirleme hesap yapılamıyor

- **Ne gördüm:** `2 + 3` → `=` → ekranda `2+3 = 5`. Ardından `+`
  tuşuna bastığımda (çoğu hesap makinesinde beklenen davranış: `5 + ...`
  ile devam etmek) ekran direkt `+`'a resetleniyor; `2` basınca `+2`
  oluyor; `=` basınca **"The formula is not valid: +2"** hatası
  alıyorum.
- **Neden önemli:** Bu, gerçek bir hesap makinesi kullanıcısının en
  doğal beklentilerinden biri (sonucun üzerine devam edebilmek); şu anki
  davranış her sonuçtan sonra sıfırdan başlamayı zorunlu kılıyor, bu da
  ürünü "gerçek bir hesap makinesi" hissinden uzaklaştırıyor.
- **Öneri:** `useCalculator.ts`'teki `startFresh` mantığını, `status ===
  "result"` durumunda bir operatör tuşuna basılırsa yeni formülü
  `formula` yerine önceki `display`'deki sonuç değerinden başlatacak
  şekilde değiştirin (örn. `"5" + "+"`); bir rakam tuşuna basılırsa
  şu anki gibi sıfırdan başlamaya devam edin.
- **Durum: düzeltildi.** `lastResult` state'i eklendi; sonuçtan sonra bir
  operatöre basılırsa formül `lastResult + operatör`'den devam ediyor,
  bir rakama basılırsa sıfırdan başlıyor (önceki davranış). Canlı testle
  doğrulandı: `2+3=` → `5`, `+` → `5+`, `2` → `5+2`, `=` → `5+2 = 7`.

### Güvenlik — Backend CORS'u tamamen açık (düşük öncelik, not amaçlı)

- **Ne gördüm:** Backend'de `app.use(cors())` hiçbir origin kısıtlaması
  olmadan tüm origin'lere izin veriyor; frontend'in kendi origin'ine
  (`http://localhost:5173`) özel bir kısıtlama yok.
- **Neden önemli:** Bu uygulamada oturum/kimlik doğrulama veya hassas
  veri olmadığı için pratik etkisi düşük — herhangi bir site bu API'ye
  istek atıp bir hesaplama sonucu alabilir, ki bu zaten public/anonim
  bir hesaplama servisinden başka bir şey değil. Yine de gerçek bir
  projede alışkanlık haline getirilmemesi gereken bir pattern.
- **Öneri:** Şimdilik değişiklik gerekmez (düşük risk); ileride prod'a
  çıkarsa `cors({ origin: "https://gercek-frontend-domaini" })` gibi
  origin'i whitelisting'e alın.
- **Temiz çıkan:** XSS — React JSX içeriği otomatik escape ediyor,
  `dangerouslySetInnerHTML` hiçbir yerde kullanılmıyor; kullanıcı girdisi
  (`formula`) hiçbir zaman HTML olarak render edilmiyor.

### Performans — sorun bulunamadı

- Bundle küçük (gzip ~60KB), component ağacı basit (3-4 seviye),
  gereksiz re-render riski yok (state güncellemeleri doğrudan ilgili
  component'i etkiliyor). Ek bir işlem/optimizasyon gerektirmiyor.

### Business #2 — API adresi sabit kodlanmış, ortam bazlı yapılandırma yok

- **Ne gördüm:** `calculatorApi.ts` içinde
  `const API_BASE_URL = "http://localhost:3000";` sabit kodlanmış.
- **Neden önemli:** Bu frontend başka bir makinede, farklı bir portta
  veya gerçek bir sunucuda çalıştırılırsa (deploy edilirse), backend'e
  hiçbir zaman ulaşamaz ve sessizce (yukarıdaki "Failed to fetch"
  hatasıyla) bozulur — bunun sebebini anlamak kod okumadan mümkün değil.
- **Öneri:** `import.meta.env.VITE_API_BASE_URL` üzerinden yapılandırılabilir
  hale getirip yerelde `http://localhost:3000` fallback'i koruyun.
- **Durum: düzeltildi.** `API_BASE_URL` artık
  `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"`; bir
  `.env` dosyasıyla farklı ortamlara işaret edebilir, yereldeki davranış
  değişmedi (build + canlı test ile doğrulandı).

### Business #3 — Fiziksel klavye desteği yok

- **Ne gördüm:** Sayfa açıkken klavyeden `2+3` yazıp `Enter`'a bastığımda
  ekranda hiçbir değişiklik olmadı (hâlâ `0`) — uygulama sadece fare/dokunma
  ile buton tıklamalarını dinliyor.
- **Neden önemli:** Bir "hesap makinesi" web uygulamasından çoğu kullanıcı
  klavyeyle de girdi yapabilmeyi bekler; bu aynı zamanda bir erişilebilirlik
  (yalnızca fare kullanamayan kullanıcılar) sorunu da.
- **Öneri:** `App` içine bir `onKeyDown` (veya `window` üzerinde
  `keydown` event listener) ekleyip rakam/operatör tuşlarını, `Enter`'ı
  (`=` olarak), `Backspace`'i ve `Escape`'i (`C` olarak) `press()`
  fonksiyonuna yönlendirin.
- **Durum: düzeltildi.** `useCalculator.ts`'e `window` üzerinde bir
  `keydown` dinleyicisi eklendi (rakamlar, `+ - * /`, `( )`, `Enter`→`=`,
  `Backspace`→`⌫`, `Escape`→`C`). Canlı testle doğrulandı: klavyeden
  `6*7` yazıp `Enter`'a basınca `6*7 = 42` çıktı, `Escape` ekranı
  temizledi.

## Bunu siz nasıl kontrol edersiniz? (yöntem)

- **Edge Case:** Uygulamayı "kötü niyetli olmayan ama dikkatsiz bir
  kullanıcı" gibi kullanın: boş girdiyle `=`'a basın, ağı DevTools →
  Network → "Offline" yapıp veya backend'i durdurup deneyin, aynı tuşa
  art arda hızlıca basın, bir sonuçtan sonra devam etmeyi deneyin. Her
  "beklenmedik ama makul" senaryoyu elle bir kere deneyin.
- **Güvenlik:** DevTools → Network sekmesinde bir isteğin response
  header'larına bakıp `Access-Control-Allow-Origin` değerini kontrol
  edin; Elements/Console'da kullanıcı girdisini (`<script>alert(1)</script>`
  gibi) forma yazıp ekrana nasıl yansıdığına bakın (kaçışsız basılıyorsa
  XSS riski var demektir); `npm audit` ile bağımlılıklardaki bilinen
  açıkları tarayın.
- **Performans:** Chrome DevTools → Lighthouse sekmesinden bir
  "Performance" raporu alın (skor + öneriler); Network sekmesinde toplam
  bundle boyutuna ve yükleme süresine bakın; React DevTools eklentisinin
  "Profiler" sekmesiyle bir etkileşim kaydedip gereksiz re-render olup
  olmadığını görün.
- **Business:** Orijinal isteği/spec'i tekrar okuyup çıktıyla satır satır
  karşılaştırın; "ben bu uygulamayı ilk kez kullanan biri olsam ne
  yapmaya çalışırdım" diye düşünüp o akışları deneyin (klavye, devam eden
  hesap, farklı bir bilgisayardan açma); Lighthouse'un "Accessibility"
  skoru da bu eksende işinize yarar.
