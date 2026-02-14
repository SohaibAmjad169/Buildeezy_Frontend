# 📱 APK Testing Guide for Buildeezy

## 🚀 Quick Setup for APK Testing

### Prerequisites
- **Java 21+** (Required for latest Capacitor plugins)
- **Android Studio** (Latest version)
- **Android SDK 33+**
- **Node.js 16+**

## ☕ Java 21 Installation

Since the build requires Java 21, you need to install it first:

### Option 1: Using Homebrew (Recommended)
```bash
# Install Java 21
brew install openjdk@21

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
java -version
```

### Option 2: Using SDKMAN
```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source ~/.sdkman/bin/sdkman-init.sh

# Install Java 21
sdk install java 21.0.3-tem
sdk use java 21.0.3-tem

# Verify installation
java -version
```

### Option 3: Manual Download
- Download from [Oracle JDK 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
- Install and set `JAVA_HOME` environment variable

## 🔧 Environment Setup

### 1. Verify Java Installation
```bash
java -version
# Should show: openjdk version "21.x.x"

javac -version  
# Should show: javac 21.x.x
```

### 2. Set Java Home (if needed)
```bash
# Add to ~/.zshrc or ~/.bash_profile
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export PATH=$JAVA_HOME/bin:$PATH
```

### 3. Android Studio Setup
- Install Android Studio from [developer.android.com](https://developer.android.com/studio)
- Install SDK Platform 33+ and build tools
- Accept all licenses: `cd ~/android-sdk && ./tools/bin/sdkmanager --licenses`

## 🏗️ Building the APK

### Step 1: Build Web Assets
```bash
# Build production web version
npm run build:prd

# Or if build fails, create minimal version for testing
npm run dev  # Keep this running in one terminal
```

### Step 2: Sync with Capacitor
```bash
# Sync web assets to mobile
npm run mobile:sync

# Or full build and sync
npm run mobile:build
```

### Step 3: Build APK

#### Option A: Using npm scripts (Recommended)
```bash
# Debug APK (faster, for testing)
npm run mobile:build:android

# Release APK (optimized, for distribution)
npm run mobile:build:apk
```

#### Option B: Using Capacitor CLI directly
```bash
# Debug APK
npx cap build android

# Release APK
npx cap build android --androidreleasetype APK
```

#### Option C: Using Gradle directly
```bash
cd android

# Debug APK
./gradlew assembleDebug

# Release APK
./gradlew assembleRelease
```

## 📱 APK Locations

After successful build, find your APK files here:

### Debug APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK  
```
android/app/build/outputs/apk/release/app-release.apk
```

## 🧪 Testing the APK

### Method 1: Android Emulator

#### Setup Emulator
```bash
# Open Android Studio
npx cap open android

# Or create emulator from command line
# First, list available system images
sdkmanager --list | grep system-images

# Create AVD (Android Virtual Device)
avdmanager create avd -n "Buildeezy_Test" -k "system-images;android-33;google_apis;arm64-v8a" -d "pixel_4"

# Start emulator
emulator -avd Buildeezy_Test
```

#### Install APK on Emulator
```bash
# Make sure emulator is running, then install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or for release version
adb install android/app/build/outputs/apk/release/app-release.apk

# Force reinstall if app already exists
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Physical Device

#### Enable Developer Mode
1. Go to **Settings** > **About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings** > **Developer Options**
4. Enable **USB Debugging**
5. Connect device via USB

#### Install APK on Device
```bash
# Check if device is detected
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# If installation fails, enable "Install from Unknown Sources"
```

### Method 3: File Transfer

#### Transfer APK to Device
1. Copy APK file to device storage or cloud storage
2. On device, go to file manager
3. Tap the APK file
4. Enable "Install from Unknown Sources" if prompted
5. Follow installation prompts

## 🔍 Testing Checklist

### Core Functionality
- [ ] App launches successfully
- [ ] No crash on startup
- [ ] Navigation works properly
- [ ] Login/Authentication works
- [ ] API calls work (check network permissions)

### PWA Features
- [ ] Service worker registers correctly
- [ ] Offline functionality works
- [ ] Push notifications work (if implemented)
- [ ] App can be "installed" from browser

### Mobile-Specific Features
- [ ] Status bar styling is correct
- [ ] Splash screen appears
- [ ] Keyboard behavior is proper
- [ ] Back button works (Android)
- [ ] App handles device rotation
- [ ] Deep links work (if implemented)

### Performance
- [ ] App loads quickly
- [ ] Smooth animations
- [ ] Memory usage is reasonable
- [ ] Battery usage is acceptable

## 🐛 Common Issues & Solutions

### Issue: Build Fails with Java Version Error
**Solution:** Install Java 21+ and set JAVA_HOME
```bash
brew install openjdk@21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
```

### Issue: APK Installation Fails
**Solutions:**
- Enable "Install from Unknown Sources"
- Use `adb install -r` to force reinstall
- Check device storage space
- Uninstall previous version first

### Issue: App Crashes on Launch
**Solutions:**
- Check Android Studio Logcat for errors
- Ensure all required permissions are granted
- Verify network connectivity
- Check if all required plugins are properly installed

### Issue: White Screen on Launch
**Solutions:**
- Check if web assets were properly copied
- Verify index.html exists in assets
- Check service worker registration
- Clear app cache and data

### Issue: Network Requests Fail
**Solutions:**
- Add network permissions to AndroidManifest.xml
- Enable "Clear text traffic" for HTTP requests
- Check CORS settings on your API
- Verify SSL certificates for HTTPS

## 🔧 Debug Commands

### Viewing Logs
```bash
# View all logs
adb logcat

# Filter by app
adb logcat | grep -i buildeezy

# View only errors
adb logcat *:E
```

### App Information
```bash
# Get app info
adb shell pm list packages | grep buildeezy
adb shell dumpsys package com.buildeezy.app

# Clear app data
adb shell pm clear com.buildeezy.app
```

### Performance Testing
```bash
# Monitor memory usage
adb shell dumpsys meminfo com.buildeezy.app

# Monitor CPU usage
adb shell top | grep buildeezy
```

## 📊 Performance Optimization

### APK Size Optimization
```bash
# Enable ProGuard/R8 in build.gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Bundle Analysis
```bash
# Generate APK analyzer report
./gradlew :app:analyzeReleaseBundle

# Or open in Android Studio
# Build > Analyze APK... > Select your APK
```

## 🚀 Distribution

### Google Play Store
1. Create signed APK/AAB
2. Set up Google Play Console account
3. Upload APK/AAB
4. Configure store listing
5. Submit for review

### Direct Distribution
1. Host APK on secure server
2. Provide download link to users
3. Include installation instructions
4. Consider using QR codes for easy download

## 🛠 Advanced Testing

### Automated Testing
```bash
# Install test framework
npm install -g appium

# Run automated tests
appium --allow-cors
```

### Performance Testing
- Use Android Studio Profiler
- Monitor memory leaks
- Check CPU usage
- Analyze network requests

### Security Testing
- Test with ProGuard enabled
- Check for sensitive data exposure
- Verify certificate pinning
- Test deep link security

## 🎯 Pre-Production Checklist

- [ ] All features work on multiple devices
- [ ] App works offline
- [ ] Push notifications configured
- [ ] Analytics integrated
- [ ] Error tracking setup
- [ ] App signed for release
- [ ] Store listing prepared
- [ ] Screenshots and videos ready
- [ ] Privacy policy and terms ready

---

## 📞 Quick Commands Reference

```bash
# Complete build and test workflow
npm run build:prd              # Build web assets
npm run mobile:sync            # Sync to mobile
npm run mobile:build:apk       # Build release APK
adb install android/app/build/outputs/apk/release/app-release.apk  # Install on device

# Development workflow with live reload
npm run mobile:android:dev     # Build and run with live reload

# Open Android Studio for advanced debugging
npm run mobile:open:android
```

🎉 **You're now ready to build and test your Buildeezy APK!**