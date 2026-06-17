# Plan: Savcı Rolü OOC Kuralları

## Hedef

EightbornV Ceza Kanunu'na hakim, ağır başlı ve profesyonel bir savcı rolü oynayacak oyuncular için OOC kurallar sayfası oluştur. Sayfa hem IC yetki ve hiyerarşi bilgisini hem de OOC davranış beklentilerini içerecek.

## Oluşturulacak Dosya

### `criminal-code/prosecutor-rules.md`

**Konumu:** Ceza Kanunu altında, çünkü savcı rolü doğrudan Ceza Kanunu uygulamasıyla bağlantılı.

**Sayfa yapısı:**

1. **Genel Bakış** — Savcının IC rol tanımı ve OOC beklentiler
2. **Hiyerarşi** — Avukat (oyuncu) → Savcı (oyuncu) → Başsavcı (ghostrp) → Hakim (ghostrp)
3. **OOC Kurallar** (kullanıcının 12 maddesi + eklemelerim):
   - El ense yasağı (diğer oyuncuların karakterlerine saygı)
   - Ağır başlılık ve profesyonellik
   - Ana veya ikinci karakter olarak oynanabilir
   - Ceza Kanunu'na hakimiyet zorunluluğu
   - Avukat-savcı aynı anda oynanamaz; avukatktan savcıya geçiş sınav ile
   - Çevre: legal oyuncular, avukatlar, diğer savcılar, polisler
   - Illegal oyuncularla sınırlı diyalog; mesleği tehlikeye atacak diyaloglardan kaçınma
   - Birden fazla savcı olacaktır
   - IC ego yansıtılabilir ama mütevazı ve tecrübeli; güç zehirlenmesi yasak
   - IC yetki tanımı (LSPD ile ilişki, ne yapabilir ne yapamaz)
   - Nadir durumlarda başsavcıdan bilgi isteme
   - Hiyerarşi tekrarı
4. **IC Yetki ve Sorumluluklar** (LAPD-savcı ilişkisi modelinde):
   - Dosya inceleme yetkisi
   - İddianame ve isnat kararlama
   - Savcılık sevki kararı verme
   - İyi hâl indirimi uygulama (%25)
   - Denetimli serbestlik kararı
   - Kolluk ile iş birliği sınırları
   - Mahkeme sevki gerektiren dosyalarda hakim (ghostrp) kararı bekleme
5. **Yasaklar ve Sınırlar:**
   - Illegal faaliyete doğrudan katılım yasağı
   - Delil tahrif veya gizleme yasağı
   - Çıkar çatışması (tanıdık dosyasında tarafsızlık)
   - Güç zehirlenmesi ve keyfi işlem yasağı
   - OOC bilgisi IC olarak kullanma yasağı
   - Avukat-savcı aynı anda oynama yasağı
   - Kolluğa doğrudan emir verme yasağı (sadece hukuki yönlendirme)

### `criminal-code/index.md` Güncellemesi

Prosecutor rules sayfasına bağlantı eklenecek.

## Uygulanmayacak

- Mevcut ceza kanunu maddeleri değiştirilmeyecek
- `.gitignore` değiştirilmeyecek
- Mevcut rules sayfaları değiştirilmeyecek (sadece criminal-code/index.md güncellenecek)