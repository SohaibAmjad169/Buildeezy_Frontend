// Mobile utilities for Capacitor integration
// This file provides utilities for mobile-specific functionality

import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';

// Check if app is running on mobile device
export const isMobile = () => {
  return Capacitor.isNativePlatform();
};

// Get platform information
export const getPlatform = () => {
  return Capacitor.getPlatform();
};

// Initialize mobile app settings
export const initializeMobileApp = async () => {
  if (!isMobile()) {
    console.log('Not running on mobile platform');
    return;
  }

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide();
    
    // Set status bar style
    await StatusBar.setStyle({ style: 'LIGHT' });
    await StatusBar.setBackgroundColor({ color: '#719c40' });
    
    // Set up keyboard behavior
    Keyboard.addListener('keyboardWillShow', (info) => {
      console.log('Keyboard will show with height:', info.keyboardHeight);
      document.body.classList.add('keyboard-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      console.log('Keyboard will hide');
      document.body.classList.remove('keyboard-open');
    });

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active:', isActive);
      if (isActive) {
        // App became active
        console.log('App resumed');
      } else {
        // App went to background
        console.log('App backgrounded');
      }
    });

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      console.log('Back button pressed, can go back:', canGoBack);
      
      if (canGoBack) {
        window.history.back();
      } else {
        // Show exit confirmation dialog
        if (confirm('Exit Buildeezy?')) {
          App.exitApp();
        }
      }
    });

    // Monitor network status
    const status = await Network.getStatus();
    console.log('Network status:', status);

    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed:', status);
      
      // Dispatch custom event for network changes
      const event = new CustomEvent('networkStatusChange', { 
        detail: status 
      });
      window.dispatchEvent(event);
    });

    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Failed to initialize mobile app:', error);
  }
};

// Get device information
export const getDeviceInfo = async () => {
  if (!isMobile()) return null;

  try {
    const info = await Device.getInfo();
    return info;
  } catch (error) {
    console.error('Failed to get device info:', error);
    return null;
  }
};

// Set up push notifications
export const initializePushNotifications = async () => {
  if (!isMobile()) {
    console.log('Push notifications not available on web');
    return;
  }

  try {
    // Request permission
    const result = await PushNotifications.requestPermissions();
    
    if (result.receive === 'granted') {
      // Register for push notifications
      await PushNotifications.register();
      
      console.log('Push notifications registered successfully');
      
      // Listen for registration
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token:', token.value);
        
        // Send token to your backend
        // You can dispatch this to your Redux store or send to API
        const event = new CustomEvent('pushTokenReceived', { 
          detail: { token: token.value } 
        });
        window.dispatchEvent(event);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        
        // Handle notification while app is in foreground
        const event = new CustomEvent('pushNotificationReceived', { 
          detail: notification 
        });
        window.dispatchEvent(event);
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        
        // Handle notification tap
        const event = new CustomEvent('pushNotificationActionPerformed', { 
          detail: notification 
        });
        window.dispatchEvent(event);
      });

    } else {
      console.log('Push notifications permission denied');
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
};

// Show status bar
export const showStatusBar = async () => {
  if (isMobile()) {
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Failed to show status bar:', error);
    }
  }
};

// Hide status bar
export const hideStatusBar = async () => {
  if (isMobile()) {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Failed to hide status bar:', error);
    }
  }
};

// Force keyboard to hide
export const hideKeyboard = async () => {
  if (isMobile()) {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Failed to hide keyboard:', error);
    }
  }
};

// Get network status
export const getNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Failed to get network status:', error);
    return { connected: navigator.onLine, connectionType: 'unknown' };
  }
};

// App lifecycle management
export const minimizeApp = () => {
  if (isMobile()) {
    App.minimizeApp();
  }
};

export const exitApp = () => {
  if (isMobile()) {
    App.exitApp();
  }
};

// Utility to check if running in dark mode
export const isDarkMode = async () => {
  if (!isMobile()) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  try {
    const info = await Device.getInfo();
    return info.prefersDarkMode || false;
  } catch (error) {
    console.error('Failed to check dark mode:', error);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};

// Safe area insets for notched devices
export const getSafeAreaInsets = () => {
  if (!isMobile()) return { top: 0, right: 0, bottom: 0, left: 0 };

  const root = document.documentElement;
  return {
    top: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0', 10),
    right: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0', 10),
    bottom: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0', 10),
    left: parseInt(getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0', 10),
  };
};

// Haptic feedback (if available)
export const hapticFeedback = async (type = 'light') => {
  if (!isMobile()) return;

  try {
    // Check if haptics are available
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [50, 100, 50]
      };
      
      navigator.vibrate(patterns[type] || patterns.light);
    }
  } catch (error) {
    console.error('Haptic feedback failed:', error);
  }
};

export default {
  isMobile,
  getPlatform,
  initializeMobileApp,
  getDeviceInfo,
  initializePushNotifications,
  showStatusBar,
  hideStatusBar,
  hideKeyboard,
  getNetworkStatus,
  minimizeApp,
  exitApp,
  isDarkMode,
  getSafeAreaInsets,
  hapticFeedback
};