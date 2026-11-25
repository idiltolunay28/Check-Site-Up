# 3. Test Ortamı ve Doğrulama

> **⚠️ FİNAL RAPOR HATIRLATMASI:** Final teslim dosyasına **Ad Soyad** ve **Öğrenci Numaranı** eklemeyi unutma!

## 3.1 Etik ve Sentetik Test Metodolojisi

Eklentinin doğruluğunu güvenli, etik ve tekrarlanabilir biçimde ölçmek için iki aşamalı bir değerlendirme düzeneği kurulmuştur:
1. **Sentetik Test Seti (`test-pages/`):** Hiçbir gerçek marka, ticari unvan veya logo içermez; yalnızca RFC 2606 tarafından test amaçlı ayrılmış `*.example.test` alan adlarını kullanır ve hiçbir form verisini ağ üzerinden göndermez.
2. **Meşru Giriş Sayfaları (Gerçek Dünya Yanlış Pozitif Ölçümü):** Eklentinin günlük kullanımda gerçek oturum açma sayfalarında yanlış alarm (**False Positive**) üretip üretmediğini doğrulamak amacıyla **15 meşru giriş sayfası** üzerinde test yapılır.

### Tarayıcıda Test Kurulumu (Chrome / Edge)
1. `chrome://extensions` (veya `edge://extensions`) adresini açın ve **Geliştirici Modu (Developer Mode)** seçeneğini etkinleştirin.
2. **Paketlenmemiş öğe yükle (Load unpacked)** düğmesiyle projenin `extension/` klasörünü seçin.
3. Sentetik sayfaları yerel sunucuyla açın (önerilen):
   ```powershell
   python -m http.server 8080 --directory test-pages
   ```
   Ardından `http://localhost:8080` adresine gidip her senaryoyu tetikleyin. *(Doğrudan dosya yoluyla açmak isterseniz eklenti ayrıntılarından **Dosya URL'lerine erişime izin ver** seçeneğini açın.)*
4. Her testte eklenti rozetini, popup içindeki puan ve tetiklenen sinyalleri, ayrıca **DevTools (`F12` → Elements / Console)** çıktısını kontrol edip aşağıdaki tablolara işleyin.

---

## 3.2 Tablo A — Sentetik Test Sayfaları Sonuçları (5 Senaryo)

| # | Senaryo | Test Dosyası | Tür | Beklenen Sonuç | Gözlenen Seviye | Gözlenen Skor | Sınıflandırma (`TP/TN/FP/FN`) |
| :-: | :--- | :--- | :---: | :--- | :---: | :---: | :---: |
| 1 | Sürüklenebilir Windows BitB Penceresi | `bitb-windows.html` | Pozitif (BitB) | High Risk (`100`) | *(Doldur)* | *(Doldur)* | *(TP / FN)* |
| 2 | macOS Trafik Işıklı `<iframe>` BitB | `bitb-iframe-macos.html` | Pozitif (BitB) | High Risk (`100`) | *(Doldur)* | *(Doldur)* | *(TP / FN)* |
| 3 | Koyu Tema Dinamik + 2FA BitB (`hover` hileli) | `bitb-dark-2fa.html` | Pozitif (BitB) | High Risk (`100`) | *(Doldur)* | *(Doldur)* | *(TP / FN)* |
| 4 | Şemasız URL (`https://` yok) Kenar Durum BitB | `bitb-evasion-schemeless.html` | Pozitif (Kenar) | Medium Risk (`50`) | *(Doldur)* | *(Doldur)* | *(TP / FN)* |
| 5 | Olağan Yüzen Giriş Modalı (Kontrol) | `benign-modal.html` | Negatif (Meşru) | Safe (`25`, alarm yok) | *(Doldur)* | *(Doldur)* | *(TN / FP)* |

---

## 3.3 Tablo B — Meşru Giriş Sayfaları Yanlış Alarm (False Positive) Ölçümü (15 Site)

Aşağıdaki 15 meşru giriş sayfası eklenti aktifken ziyaret edilerek yanlış alarm verilip verilmediği ölçülmüştür *(gerekirse kendi ziyaret ettiğin 10–20 meşru giriş sayfasıyla güncelleyebilirsin)*:

| # | Platform / Giriş Sayfası | Test Edilen URL | Gözlenen Seviye | Gözlenen Skor | Alarm Verdi mi? | Sonuç (`TN` / `FP`) | Kısa Not |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | GitHub | `https://github.com/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 2 | Google Accounts | `https://accounts.google.com` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 3 | Microsoft Login | `https://login.microsoftonline.com` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 4 | Steam | `https://store.steampowered.com/login/` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 5 | Discord | `https://discord.com/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 6 | LinkedIn | `https://www.linkedin.com/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 7 | Reddit | `https://www.reddit.com/login/` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 8 | Wikipedia | `https://en.wikipedia.org/wiki/Special:UserLogin` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 9 | Spotify | `https://accounts.spotify.com/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 10 | GitLab | `https://gitlab.com/users/sign_in` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 11 | Stack Overflow | `https://stackoverflow.com/users/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 12 | Notion | `https://www.notion.so/login` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 13 | Apple Account | `https://account.apple.com/sign-in` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 14 | Amazon | `https://www.amazon.com/ap/signin` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |
| 15 | Üniversite / LMS Girişi | `*(örn. TOBB ETÜ / Moodle giriş URL)*` | *(Doldur)* | *(Doldur)* | *(Hayır/Evet)* | *(TN/FP)* | |

---

## 3.4 Özet Doğruluk Metrikleri (Confusion Matrix)

Chrome testlerini tamamladıktan sonra yukarıdaki **20 test sayfasının** (4 Pozitif BitB + 16 Negatif Meşru Giriş Sayfası) toplam sayılarını buraya işleyin:

- **True Positive (TP — Doğru Alarm):** `___ / 4`
- **False Negative (FN — Kaçırılan BitB):** `___ / 4`
- **True Negative (TN — Meşru Sayfada Doğru Sessiz):** `___ / 16`
- **False Positive (FP — Meşru Sayfada Yanlış Alarm):** `___ / 16`

| Metrik | Formül | Hesaplanan Değer |
| :--- | :--- | :---: |
| **Doğruluk (Accuracy)** | `(TP + TN) / (TP + TN + FP + FN)` | `___ %` |
| **Duyarlılık (Recall / Detection Rate)** | `TP / (TP + FN)` | `___ %` |
| **Kesinlik (Precision)** | `TP / (TP + FP)` | `___ %` |
| **Yanlış Alarm Oranı (False Positive Rate)** | `FP / (FP + TN)` | `___ %` |

---

## 3.5 DevTools Doğrulama ve Ekran Görüntüsü Kontrol Listesi
Final raporu ve canlı demo için aşağıdaki 4 ekran görüntüsünün alınması önerilir:
- [ ] `bitb-windows.html`: Sürüklenirken tarayıcı kenarında kesilen sahte pencere + kırmızı uyarı şeridi + eklenti popup sinyalleri.
- [ ] `bitb-iframe-macos.html`: DevTools **Elements** sekmesinde `<iframe>` ve macOS trafik ışığı düğmelerinin görünümü + popup'ta `"Simulated macOS traffic-light window controls"` sinyali.
- [ ] `bitb-evasion-schemeless.html`: Şemasız URL nedeniyle `Medium (50/100)` skoru veren kenar durum kanıtı.
- [ ] `benign-modal.html` + 1 meşru giriş sayfası (örn. GitHub veya Steam): `Safe` durumu ve yanlış alarm oluşmadığının kanıtı.
