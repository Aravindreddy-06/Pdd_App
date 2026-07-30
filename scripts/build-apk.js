import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('=======================================================');
console.log('📦 ANDROID APK BUILD & PREPARATION SCRIPT');
console.log('=======================================================');

try {
  console.log('1️⃣ Building production web assets...');
  execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });

  console.log('2️⃣ Syncing web build to Capacitor Android...');
  execSync('npx cap sync android', { cwd: projectRoot, stdio: 'inherit' });

  const gradlewCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const androidDir = path.join(projectRoot, 'android');

  if (fs.existsSync(path.join(androidDir, gradlewCmd))) {
    console.log('3️⃣ Compiling Android Debug APK via Gradle...');
    execSync(`${gradlewCmd} assembleDebug`, { cwd: androidDir, stdio: 'inherit' });

    const apkBuiltPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    const targetRootApk = path.join(projectRoot, 'lendkart.apk');

    if (fs.existsSync(apkBuiltPath)) {
      fs.copyFileSync(apkBuiltPath, targetRootApk);
      const stats = fs.statSync(targetRootApk);
      console.log(`\n✅ Successfully generated lendkart.apk (${(stats.size / 1024 / 1024).toFixed(2)} MB) at: ${targetRootApk}`);
    } else {
      console.warn(`⚠️ Warning: Built APK file not found at expected path: ${apkBuiltPath}`);
    }
  } else {
    console.warn(`⚠️ Warning: ${gradlewCmd} not found in android/ directory.`);
  }
} catch (error) {
  console.error('❌ APK Build failed:', error.message);
}

console.log('=======================================================\n');
