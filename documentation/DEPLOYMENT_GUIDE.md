# 🚀 Production Deployment Guide

Guide for deploying **Lendkart** to production web servers (Vercel / GitHub Pages) and publishing the native Android app to the **Google Play Store**.

---

## 🌐 1. Web Application Deployment (`/web` -> Vercel)

1. Connect your GitHub Repository `Pdd_App` to **Vercel**.
2. Configure environment variables in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
3. Set Root Directory to `./` or `web/`.
4. Deploy — Vercel builds `npm run build` and serves the web application automatically on your live URL.

---

## 📱 2. Android APK & AAB Production Build (`/android`)

### Generate Signed Production Android App Bundle (`.aab`) for Google Play Store

1. **Generate Keystore**:
   ```bash
   keytool -genkey -v -keystore lendkart-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias lendkart-key
   ```

2. **Configure `android/app/build.gradle`**:
   Add signing configs:
   ```groovy
   signingConfigs {
       release {
           storeFile file('lendkart-release-key.jks')
           storePassword 'your_password'
           keyAlias 'lendkart-key'
           keyPassword 'your_password'
       }
   }
   ```

3. **Build Release AAB & APK**:
   ```bash
   cd android
   .\gradlew bundleRelease
   .\gradlew assembleRelease
   ```

4. **Outputs**:
   - **Google Play Store AAB**: `android/app/build/outputs/bundle/release/app-release.aab`
   - **Direct Install APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🌩️ 3. Deploying Supabase Edge Functions (`/backend`)

```bash
supabase functions deploy create-payment-intent --project-ref <your-project-ref>
supabase functions deploy payment-webhook --project-ref <your-project-ref>

# Set Environment Secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_...
```
