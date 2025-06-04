# 📱 Zihinsel Sağlık Takip Uygulaması – Mobile

# 🌿 Uygulama Amacı

Kullanıcıların günlük ruh hali, stres seviyesi, uyku, su tüketimi ve aktivitelerini takip etmelerine olanak tanıyan; yapay zeka destekli (Gemini API) kişisel öneriler sunan mobil uygulama.

# 🔧 Kurulum

# ✅ Gereksinimler:

Node.js

Expo CLI (npm install -g expo-cli)

Android/iOS emulator veya fiziksel cihaz

## ⚡ Projeyi çalıştırmak için:
git clone https://github.com/kullaniciAdi/proje-adi.git
cd proje-adi/mobile
npm install
npx expo start

## 🔎 Temel Özellikler

✍️ Kullanıcı girişi / kayıt

😷 Günlük ruh hali, stres, uyku verisi girme

📊 Haftalık, aylık grafiksel takip

🤖 AI önerisi: Kullanıcı verisine göre pozitif tavsiyeler

🌐 Çevrimdışı mod (AsyncStorage ile veri saklama)

✨ Dark/Light tema

## 🚀 Özellikler

Kategori:                                                                  Açıklama

Günlük Veri Girişi:                                            Uyku, stres, su tüketimi, aktivite ve ruh hâli kaydı

Grafikler:                                                     Günlük / haftalık / aylık trendler (Recharts)

AI Tavsiyesi :                                                 Google Gemini API ile kişisel öneriler

Kullanıcı Kimliği:                                             Firebase Auth (e‑posta + şifre)

Veri Saklama:                                                  Firestore bulut veritabanı

Dark Mode:                                                     MUI temalarıyla anında geçiş


## 🏗️ Teknoloji Yığını

Katman                                                                    Teknoloji

Mobil:                                                           React Native

UI Kit:                                                          React Native Paper

State:                                                            React Context / Hooks

Veritabanı:                                                         Firebase Firestore

Kimlik Doğrulama:                                                   Firebase Auth

Yapay Zeka:                                                         Gemini API (Google Generative Language)





Google AI Studio’dan alınan Gemini API Key .env içinde.

İstekler doğrudan istemciden yapılır (küçük projeler için) veya Node proxy ekleyebilirsiniz.

✨ Projeyi beğendiyseniz ⭐ yıldız vermeyi unutmayın!
