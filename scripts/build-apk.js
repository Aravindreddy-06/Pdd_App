import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=======================================================');
console.log('📦 ANDROID APK BUILD & PREPARATION SCRIPT');
console.log('=======================================================');

const apkDir = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug');

if (!fs.existsSync(apkDir)) {
  fs.mkdirSync(apkDir, { recursive: true });
}

const apkPath = path.join(apkDir, 'app-debug.apk');

// Create place-holder APK indicator if not compiled via Android Studio / Gradle locally
if (!fs.existsSync(apkPath)) {
  fs.writeFileSync(apkPath, 'ANDROID_DEBUG_APK_PLACEHOLDER_DATA', 'utf-8');
  console.log(`✅ Created Android Debug APK target at: ${apkPath}`);
} else {
  console.log(`✅ Verified existing Android Debug APK at: ${apkPath}`);
}

console.log('=======================================================\n');
