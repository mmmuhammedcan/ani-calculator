# Prompts Log

Bu dosya, `calculator_parentheses` özelliğinin (parantez desteği, negatif
sayı desteği ve güvenlik/dayanıklılık düzeltmeleri) geliştirme sürecinde
verilen talimatların, ne kastedildiğini net biçimde ifade edecek şekilde
sadeleştirilmiş halidir. Orijinal mesajlar hızlı yazıldığı için yazım
hataları içeriyordu; burada her birinin gerçek niyeti kayıt altına
alınmıştır.

## Prompt 1 — Kapsamı belirleme ve ilk inceleme talebi

`fourth_day` klasörü altındaki `ani-calculator-workshop` içine bak, başka
hiçbir dosyaya dokunma; bundan sonraki çalışma bu klasörle sınırlı olacak.
Bu workshop'ta daha önce parantez ("(" ve ")") desteği eklemek için
Gherkin formatında Acceptance Criteria (AC) yazılmıştı — ilgili `.feature`
dosyasını kontrol et ve bulduklarını raporla. Herhangi bir kod
implementasyonuna geçmeden önce onay isteyeceğim, o yüzden sadece inceleyip
sonucu bana bildir ve bekle.

## Prompt 2 — Eksik edge case kontrolü

Bulduğun AC'lerde eksik kalmış bir edge case var mı, kontrol et. Eğer
varsa, onayımı beklemeden doğrudan `.feature` dosyasına ekle. Ardından ben
gözden geçireceğim; implementasyona geçme onayını daha sonra ayrıca
vereceğim.

## Prompt 3 — Negatif sayı desteğinin kontrolü ve AC'lerin genişletilmesi

Sistemde negatif sayı (unary minus, örn. `-5` veya `-(2+3)`) desteği eksik
mi, kontrol et. Eğer eksikse, bunu da kapsayacak şekilde ilgili tüm
Gherkin AC'lerini (hem temel calculator feature'ı hem parantez feature'ı)
güncelle. Sonra bu yeni senaryoları mevcut (henüz değişmemiş)
implementasyona karşı çalıştırıp bir "mevcut durum" raporu sun. İmplement
etme onayını bir tur daha erteliyoruz — henüz kod yazma.

## Prompt 4 — Süreç dokümantasyonunun güncel tutulması

Eğer bu değişiklikler proje kurallarında veya sistem yapısında bir
değişiklik gerektiriyorsa, `AGENTS.md` dosyasını da güncel tut.

## Prompt 5 — Test altyapısına dokunulmaması uyarısı

Dikkat: mevcut test altyapısına (step definitions, Cucumber
konfigürasyonu, World/hooks dosyaları) dokunma; sadece `.feature`
dosyalarını (Gherkin senaryolarını) güncelle.

## Prompt 6 — Test aracı düzeltmesi

Az önce "pytest ile test et" demiştim ama bu yanlıştı — bu proje pytest
kullanmıyor. Projenin gerçekte kullandığı test yapısıyla (Cucumber/
`npm test`) devam et.

## Prompt 7 — Kavramsal soru

pytest ile bu projede kullanılan Cucumber test yapısı arasındaki farkı
açıklar mısın?

## Prompt 8 — Implementasyona onay

Gherkin/AC (test spesifikasyonu) tarafı tamamlandıysa, artık kodlama
implementasyonuna geçebiliriz.

## Prompt 9 — Test edip sonucu bildirme talimatı

İmplementasyonu tamamladıktan sonra test paketini yeniden çalıştır ve
sonuçları bana raporla.

## Prompt 10 — Kapsamlı kod incelemesi (review) talebi

Bu branch'te yapılan değişiklikleri incele: edge case'lere, race
condition'lara, mevcut kod pattern'leriyle tutarlılığa bak. Sadece
**gerçek** sorunları raporla — stil tercihlerini değil. Ayrıca güvenlik
açıklarını, performans sorunlarını ve (varsa) index kullanımını kontrol
et; bulguları iş kurallarıyla (business logic) uyum açısından da
değerlendir.

## Prompt 11 — Bulunan sorunları düzeltme onayı

Review'de bulunan gerçek sorunları şimdi düzeltelim.

## Prompt 12 — Bu dosyanın (PROMPTS.md) oluşturulması talebi

Mevcut düzeltme işi bittikten sonra, bu geliştirme sürecinde verdiğim
promptları düzgün ve anlaşılır bir Türkçe ile, neyi kastettiğimi net
şekilde ifade edecek biçimde yeniden yazıp bir `PROMPTS.md` dosyasına
kaydet.

## Prompt 13 — Son bir kapsamlı gözden geçirme talebi

İşi bitirmeden önce her şeyi baştan sona kapsamlı bir şekilde gözden
geçir: kurallara (AGENTS.md) uyulmuş mu, tüm dosyalar (kod, feature'lar,
dokümantasyon) güncel mi, gözden kaçan bir şey var mı, kontrol et.

## Prompt 14 — README eksikliği

`README.md` güncel değil, projenin nasıl çalıştırılacağı (kurulum,
sunucuyu başlatma, testleri çalıştırma, API kullanımı) net şekilde
anlatılmıyor; bunu da güncelle.
