# Fareyi Öğreniyorum (v2) – Tam sürüm (15 seviye)

Sivas Robotik Akademi · okul öncesi (4-6 yaş) fare ve bilgisayar elemanları oyunu.

## Çalıştırma
`index.html` dosyasına çift tıklayın (sunucu gerekmez). Test için: `?screen=parts` veya `?screen=customize`.

## GitHub Pages
Klasörün içeriğini bir repoya yükleyin → Settings → Pages → Branch: main / root.

## Öğretmen paneli
Ctrl+Shift+S ya da ana ekranda logoya 1,5 sn basılı tutma: ses, müzik, altyazı, TTS, fare görseli imleci, tüm seviyeleri aç, ilerlemeyi sıfırla.

## Maskot sesi
`assets/audio/voice/<id>.mp3` dosyalarını koyup `data/voice-lines.js` içindeki `FO.voice.files` listesine id'yi ekleyin.
Yoksa tarayıcı Türkçe sesi, o da yoksa sessiz mod (ağız yine oynar).

## Durum
Hazır: ana ekran, bilgisayar elemanları, fareni özelleştir, fare tuşlarını tanıma, seviye haritası, seviye 1-15 (14: Robi birleştirme, 15: robot ordusu), sertifika.
Seviye 1-7 temel beceriler, 8-15 "Robi'nin Kayıp Parçaları" hikayesi (ok tuşları, boşluk ve Enter dahil; harf/rakam yok).
Başarı belgesi: bütün seviyeler bitince açılır.
Test kısayolu: `?screen=level3`, `?screen=map`, `?screen=cert`. Öğretmen panelinden "tüm seviyeleri aç" ile kilitler kalkar.
Bekleyen: Robi'nin ses kayıtları (mp3), gerçek laptopta deneme.

## Lisans / Kaynaklar
Yazı tipi Baloo 2 (SIL OFL, assets/fonts). Müzik ve efektler Web Audio ile üretilir. Görseller Gemini ile üretilmiştir.
