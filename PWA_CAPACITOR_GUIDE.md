# PWA + Capacitor Integration Guide

This guide explains how to use the Progressive Web App (PWA) and Capacitor integration for the Buildeezy application.

## 🚀 Quick Start

### Building for Production PWA
```bash
npm run build:prd
```

### Building Android APK
```bash
npm run mobile:build:apk
```

### Development with Live Reload on Device
```bash
npm run mobile:android:dev
```

## 📱 Available Scripts

### PWA Scripts
- `npm run build` - Build for web deployment
- `npm run build:prd` - Production build with PWA optimizations

### Mobile Scripts
- `npm run mobile:build` - Build and sync for mobile
- `npm run mobile:android` - Run on Android device
- `npm run mobile:android:dev` - Run with live reload
- `npm run mobile:open:android` - Open Android project in Android Studio
- `npm run mobile:sync` - Sync web assets to mobile
- `npm run mobile:build:android` - Build Android app
- `npm run mobile:build:apk` - Build APK file
- `npm run mobile:copy` - Copy web assets only
- `npm run mobile:update` - Update Capacitor plugins

## 🔧 Setup Requirements

### For PWA Development
- Node.js 16+ 
- Modern web browser
- HTTPS for production (required for service workers)

### For Android Development
- Android Studio
- Java JDK 11+
- Android SDK 33+
- Gradle 7.4+

### For iOS Development (if needed)
- macOS
- Xcode 14+
- iOS 13+

## 🌟 PWA Features Implemented

### ✅ Core PWA Features
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Installable app with proper metadata
- **Responsive Design**: Works on all device sizes
- **Offline Page**: Custom offline experience
- **App Shell**: Fast loading app structure

### ✅ Advanced Features
- **Background Sync**: Queue actions when offline
- **Push Notifications**: Firebase messaging integration
- **Install Prompt**: Native app-like installation
- **Update Notifications**: Automatic update detection
- **Network Status**: Online/offline detection

### ✅ Mobile Features (Capacitor)
- **Native App Shell**: Runs as native mobile app
- **Status Bar**: Customizable status bar styling
- **Splash Screen**: Brand-consistent loading screen
- **Keyboard Management**: Proper keyboard behavior
- **Back Button**: Native Android back button handling
- **App State Management**: Background/foreground handling
- **Device Information**: Access to device capabilities
- **Network Detection**: Mobile network status
- **Push Notifications**: Native mobile push notifications

## 📋 Manifest Configuration

The web app manifest (`/public/favicon/site.webmanifest`) includes:

- ✅ `name` - Full application name
- ✅ `short_name` - Short name for home screen
- ✅ `description` - App description for stores
- ✅ `start_url` - Entry point when launched
- ✅ `scope` - Navigation scope
- ✅ `display` - Display mode (standalone)
- ✅ `theme_color` - Theme color (#719c40)
- ✅ `background_color` - Background color
- ✅ `icons` - Various app icon sizes
- ✅ `shortcuts` - App shortcuts for quick actions
- ✅ `categories` - App store categories

## 🔧 Capacitor Configuration

The Capacitor config (`capacitor.config.json`) includes:

- **App Identity**: Bundle ID and app name
- **Platform Settings**: Android and iOS specific configs
- **Plugin Configuration**: Status bar, splash screen, keyboard
- **Security**: HTTPS scheme and mixed content settings
- **Build Options**: APK build configuration

## 🛠 Development Workflow

### 1. Web Development
```bash
# Start development server
npm run dev

# Build for production
npm run build:prd
```

### 2. Mobile Development
```bash
# First time setup - build and sync
npm run mobile:build

# Open in Android Studio
npm run mobile:open:android

# Run on connected device
npm run mobile:android

# Live reload development
npm run mobile:android:dev
```

### 3. Building for Distribution

#### PWA (Web)
```bash
# Build production PWA
npm run build:prd

# Deploy dist/ folder to your web server
# Ensure HTTPS is enabled for service workers
```

#### Android APK
```bash
# Build APK for distribution
npm run mobile:build:apk

# APK will be in: android/app/build/outputs/apk/
```

#### Android App Bundle (for Play Store)
```bash
# Build AAB for Play Store
npm run mobile:build:android

# AAB will be in: android/app/build/outputs/bundle/
```

## 🎨 Customization

### App Icons and Splash Screens
- Icons: `/public/favicon/` directory
- Splash: Configured in `capacitor.config.json`
- Update icons: Replace files and run `npm run mobile:sync`

### Theme Colors
- Primary: `#719c40` (Buildeezy green)
- Update in: `capacitor.config.json`, `site.webmanifest`, and CSS

### App Shortcuts
Configured in `site.webmanifest`:
- Post a Job
- My Jobs  
- Messages

## 🔍 Testing

### PWA Testing
```bash
# Test PWA locally
npm run build:prd
npm run preview

# Test in Chrome DevTools > Application tab
# Check manifest, service worker, and offline functionality
```

### Mobile Testing
```bash
# Test on real device
npm run mobile:android:dev

# Test in Android Emulator
# 1. Open Android Studio
# 2. Start emulator
# 3. Run: npm run mobile:android
```

## 🐛 Troubleshooting

### Common Issues

#### Service Worker Not Working
- Ensure HTTPS in production
- Check console for registration errors
- Clear browser cache and storage

#### Android Build Fails
```bash
# Update Capacitor
npm run mobile:update

# Clean build
cd android && ./gradlew clean && cd ..
npm run mobile:build:android
```

#### APK Not Installing
- Enable "Install from unknown sources"
- Check minimum SDK version (API 24+)
- Verify signing certificate

### Debug Commands
```bash
# Check Capacitor doctor
npx cap doctor

# View native logs
npx cap run android --verbose

# Inspect web content in native app
# Enable webContentsDebuggingEnabled in capacitor.config.json
# Open chrome://inspect in Chrome
```

## 📦 Distribution

### PWA Distribution
1. Deploy to HTTPS-enabled server
2. Verify manifest and service worker
3. Test installation flow
4. Submit to PWA directories (optional)

### Android Distribution
1. Build signed APK/AAB
2. Test on multiple devices
3. Upload to Google Play Store
4. Configure store listing

## 🔐 Security Considerations

### PWA Security
- Always use HTTPS in production
- Implement proper CORS headers
- Validate service worker registration
- Secure API endpoints

### Mobile Security
- Use proper certificate signing
- Implement network security config
- Validate deep links
- Secure local storage

## 📊 Performance Optimization

### PWA Performance
- Service worker caching strategy
- Critical resource prioritization  
- Image optimization
- Bundle size optimization

### Mobile Performance
- Native splash screen
- Optimized assets
- Proper memory management
- Battery usage optimization

## 🔄 Updates and Maintenance

### Updating PWA
1. Update version in `package.json`
2. Build and deploy new version
3. Service worker will prompt users for update

### Updating Mobile App
1. Update version in `capacitor.config.json`
2. Build new APK/AAB
3. Deploy through app store or direct distribution

## 🆘 Support

For issues specific to:
- **Capacitor**: [Capacitor GitHub Issues](https://github.com/ionic-team/capacitor/issues)
- **PWA**: [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- **Android**: [Android Developer Docs](https://developer.android.com/)

## 📈 Analytics and Monitoring

The app includes:
- Microsoft Clarity for web analytics
- Firebase messaging for push notifications
- Console logging for debugging
- Network status monitoring
- App state tracking

---

🎉 **Congratulations!** Your Buildeezy app is now ready for both web and mobile distribution as a modern PWA with native mobile capabilities!