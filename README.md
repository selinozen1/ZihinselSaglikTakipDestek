# 🌿 Zihinsel Sağlık Takip Uygulaması – Web

# 🧩 Proje Özeti

Kullanıcıların ruh hâli, stres seviyesi, uyku süresi ve günlük aktiviteleri gibi verileri kaydedip görselleştirebildiği, yapay zeka (Gemini API) ile kişiselleştirilmiş öneriler sunan bir zihinsel sağlık platformu.



## 🚀 Özellikler

Kategori                                                                  Açıklama

Günlük Veri Girişi                                            Uyku, stres, su tüketimi, aktivite ve ruh hâli kaydı

Grafikler                                                     Günlük / haftalık / aylık trendler (Recharts)

AI Tavsiyesi                                                  Google Gemini API ile kişisel öneriler

Kullanıcı Kimliği                                             Firebase Auth (e‑posta + şifre)

Veri Saklama                                                  Firestore bulut veritabanı

Dark Mode                                                     MUI temalarıyla anında geçiş


## 🏗️ Teknoloji Yığını

Katman                                                                    Teknoloji

Frontend                                                           React 18 + Vite

UI Kit                                                             Material UI (MUI) v5 + Emotion

Grafik                                                             Recharts

Durum Yönetimi                                                     React Context + useReducer (küçük ölçekli)

Veritabanı                                                         Firebase Firestore

Kimlik Doğrulama                                                   Firebase Auth

Yapay Zeka                                                         Gemini API (Google Generative Language)

Test                                                               Vitest + React Testing Library


## ⚙️ Kurulum

1. Depoyu Klonla

git clone https://github.com/kullanici/zihinsel-saglik-web.git
cd zihinsel-saglik-web

2. Bağımlılıkları Yükle

npm install   # veya pnpm / yarn

3. Ortam Değişkenlerini Ayarla

.env.example dosyasını .env olarak kopyala ve ilgili alanları doldur:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=

API Anahtarları gizli değildir fakat Firestore güvenlik kurallarınızın doğru olduğundan emin olun.

4. Geliştirme Sunucusunu Başlat

npm run dev

Uygulama http://localhost:3000 adresinde çalışır.


## 🧪 Test Çalıştırma

npm run


## 🔑 Firebase Yapılandırması

Firebase Console > Proje oluştur.

Authentication → Email/Password etkinleştir.

Firestore DB oluştur ve güvenlik kurallarını ayarla:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
Web app ekle, konfigürasyon değerlerini .env dosyasına kopyala.

## 🤖 AI Entegrasyonu

services/aiAnalysisService.js içinde createWeeklyPrompt()

Google AI Studio’dan alınan Gemini API Key .env içinde.

İstekler doğrudan istemciden yapılır (küçük projeler için) veya Node proxy ekleyebilirsiniz.

✨ Projeyi beğendiyseniz ⭐ yıldız vermeyi unutmayın!
