# Online Quiz System — Test Raporu

## INSTRUCTOR SÜRECİ

### Giriş / Home Sayfası
- [ ] Giriş sonrası öğrenci/eğitmen paneli seçme ekranının mantığı yok — ikisinde de başka seçenek yok, direkt tıklanıp giriliyor
- [ ] Ana sayfadaki slogan ve açıklama metinleri güncellenmeli
- [ ] Alt kısımdaki metinlerde "Keycloak" adı görünüyor, kullanıcıya yönelik olmamalı

### Soru Bankası
- [ ] Soruya kategori eklenmesi zorunlu değil — zorunlu hale getirilmeli
- [ ] Oluşturulan sorular sonradan kategoriye eklenemiyor / kategori değiştirilemiyor
- [ ] Soru oluşturduktan sonra düzenlenemiyor ve silinemez
- [ ] Aynı metinle birden fazla özdeş soru oluşturulabiliyor, duplicate kontrolü yok
- [ ] API hatası olursa form sıfırlanıyor — kullanıcı her şeyi yeniden yazmak zorunda kalıyor
- [ ] Soru listesinde kalem (düzenle) simgesi yok, hızlı düzenleme yapılamıyor
- [ ] TRUE/FALSE sorusunda doğru cevap alanı serbest metin — "RR" gibi geçersiz değer girildiğinde uyarı verilmiyor; Doğru/Yanlış seçenekli bir alan olmalı
- [ ] MULTIPLE_CHOICE sorularında şık formatı (A) ... şeklinde) doğrulanmıyor
- [ ] Sayı girilmesi gereken alanlardaki varsayılan 0 değeri klavyeyle silinemiyor

### Toplu İçe Aktarma
- [ ] İndirilen CSV şablonu düzgün değil — Excel'de Türkçe karakterler bozuluyor (encoding sorunu)
- [ ] Toplu içe aktarma sayfası ve format açıklaması yeterince net değil

### Sınav Oluşturma
- [ ] Başlangıç tarihi girilmeden süre yazılırsa bitiş tarihi boş kalıyor, uyarı verilmiyor
- [ ] Soru havuzu ayarında "öğrenci başına soru sayısı", havuz büyüklüğünden fazla girilebiliyor — geçersiz konfigürasyona izin veriliyor
- [ ] Boş form (başlıksız, süresiz) submit edilebiliyor — zorunlu alan kontrolü yok

### Sınav Detayı / Yönetimi
- [ ] Sorusu olmayan sınav yayınlanabiliyor — en az 1 soru zorunluluğu yok
- [ ] Yayına alınmış ve öğrenciler girmiş bir sınavın başlangıç saati, süresi, içeriği değiştirilebiliyor
- [ ] Başka eğitmenin sınavı ID bilinerek düzenlenebiliyor — sahiplik kontrolü yok
- [ ] Sınav önizleme kısmı öğrenci görünümüyle örtüşmüyor

---

## STUDENT SÜRECİ

### Sınav Listesi / Dashboard
- [ ] Sınav başlama tarihi gelmeden yayındaki sınav çözülebiliyor — tarih/saat kontrolü yok
- [ ] Tarih karşılaştırması sunucu saatiyle değil tarayıcı saatiyle yapılıyor — farklı saat dilimlerinde hatalı sonuç

### Sınav Alma
- [ ] Sınav bitiş saati (endTime) geçmiş olsa bile sınav devam ettirilebiliyor — yalnızca öğrencinin kendi sayacına bakılıyor
- [ ] Sayfa yenilenirse tüm cevaplar kayboluyor — otomatik kayıt yok, kaldığı yerden devam edilemiyor
- [ ] "Sınavı Bitir" butonuna tıklayınca onay ekranı çıkmıyor — yanlışlıkla erken bitirmek çok kolay
- [ ] Submit anında boş bırakılan sorular için net uyarı gösterilmiyor
- [ ] TRUE/FALSE sorularında cevap seçenekleri "true/false" İngilizce gösteriliyor — "Doğru/Yanlış" olmalı
- [ ] Eğitmene soru sor özelliği çalışmıyor

### Sonuçlar
- [ ] Kısa cevaplı (SHORT_ANSWER) sorularda cevap direkt puanlanmıyor — eğitmen değerlendirmesi bekleniyor, öğrenciye bu durum açıkça belirtilmiyor
- [ ] Sonuç sayfasında "Üst %X" yüzdelik etiketi tersine hesaplanmış — 90 alan öğrenci "Üst %10" görüyor, "Üst %90" olmalı
- [ ] PDF olarak indir özelliği çalışmıyor
- [ ] Sonuç detayında hatalı/eksik yükleme durumunda kullanıcıya bilgi verilmiyor

---

## ADMIN PANELİ

- [ ] Kullanıcı tablosunda Keycloak UUID'leri görünüyor — gizlenmeli ya da sadece isim gösterilmeli
- [ ] Admin, herhangi bir eğitmenin sınavını düzenleyebiliyor — sahiplik/yetki kontrolü yok

---

## GENEL

- [ ] Birçok butona hızlı art arda tıklayınca aynı istek birden gönderiliyor — butonlar işlem sırasında devre dışı bırakılmıyor (submit, yayınla, kaydet vb.)
- [ ] Sayfa yavaş yüklendiğinde loading göstergeleri çok hızlı kayboluyor — içerik neden boş göründüğü anlaşılamıyor
- [ ] Bildirimler okundu işaretlenirken API hatası olsa kullanıcıya hiçbir geri bildirim verilmiyor
- [ ] Tarih/saat formatı sayfalar arasında tutarsız gösteriliyor
- [ ] Hata durumlarında çoğu yerde tarayıcı `alert()` kullanılıyor — uygulama içi hata mesajı olmalı
