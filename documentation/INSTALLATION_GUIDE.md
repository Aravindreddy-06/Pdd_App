# 📖 Installation & Local Setup Guide

Welcome to **Lendkart** — Multi-Platform Resource & Equipment Sharing Platform (Web & Native Android).

---

## 📂 Project Repository Structure

```
neighbor-share/
├── web/             # Complete Web Application (Vite + React 19)
├── android/         # Native Android Project (Capacitor Native Shell + Clean Native Services)
├── backend/         # Serverless Supabase Edge Functions (Payments, Webhooks)
├── database/        # PostgreSQL SQL Migrations, RLS Policies, Seed Data
├── assets/          # Shared Icons, Logos, Banners, Graphics
└── documentation/   # Architecture & API Guides
```

---

## 🛠️ Prerequisites

- **Node.js**: v18.x or later
- **NPM**: v9.x or later
- **Android Studio**: Ladybug / Jellyfish (for Native Android builds & emulators)
- **Supabase Account / CLI** (for backend functions & database migrations)

---

## 💻 1. Web Application Setup (`/web` & Root)

### Run Web Development Server
```bash
# Install dependencies
npm install

# Start Vite HMR Dev Server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build Web App for Production
```bash
npm run build
```
Output will be generated in `dist/`.

---

## 📱 2. Native Android Application Setup (`/android`)

### Sync Web Build to Native Android Shell
```bash
npm run cap:sync
```
This builds the production web app and packages all assets natively into `android/app/src/main/assets/public/`.

### Launch Android Studio
```bash
npm run cap:open
```

### Build Android APK via Command Line
```bash
cd android
.\gradlew assembleDebug
```
The compiled APK file will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 Environment Configuration

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
