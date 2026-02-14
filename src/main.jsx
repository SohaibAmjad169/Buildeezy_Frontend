import { createRoot } from "react-dom/client";
import "./main.scss";
import "@fontsource/poppins/100.css";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";
import clarity from '@microsoft/clarity';

import App from "./App";
import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import { store } from "./store";
import CustomThemeProvider from "./context/ThemeContext";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import { TourProvider } from "./components/tour/TourContext";
import { register as registerSW, showUpdateAvailable } from "./utils/serviceWorkerRegistration";
import { initializeMobileApp, initializePushNotifications } from "./utils/mobileUtils";

// Initialize Microsoft Clarity
const initializeClarity = () => {
  const projectId = "sxabpx4iwu"; // Your Clarity project ID
  
  try {
    clarity.init(projectId);
    console.log('Microsoft Clarity initialized successfully');
    
    // Track app initialization
    clarity.event('app_initialized', {
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      url: window.location.href
    });
  } catch (error) {
    console.error('Failed to initialize Microsoft Clarity:', error);
  }
};

// Initialize Clarity when the app starts
// initializeClarity();

// Initialize PWA Service Worker
  registerSW({
    onSuccess: (registration) => {
      console.log('PWA: App is ready for offline use');
    },
    onUpdate: (registration) => {
      console.log('PWA: New content available, please refresh');
      showUpdateAvailable(registration);
    },
  });


// Handle install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('PWA: Install prompt triggered');
  event.preventDefault();
  deferredPrompt = event;
  window.deferredPrompt = event;
});

// Handle successful PWA installation
window.addEventListener('appinstalled', (event) => {
  console.log('PWA: App successfully installed');
  deferredPrompt = null;
  window.deferredPrompt = null;
});

// Initialize mobile app functionality
initializeMobileApp();

// Initialize push notifications for mobile
initializePushNotifications();

const root = createRoot(document.getElementById("root"));
root.render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <Provider store={store}>
        <CustomThemeProvider>
          <TourProvider>
            <ErrorBoundary>
              <CssBaseline />
              <App />
            </ErrorBoundary>
          </TourProvider>
        </CustomThemeProvider>
      </Provider>
    </BrowserRouter>
  </I18nextProvider>
);