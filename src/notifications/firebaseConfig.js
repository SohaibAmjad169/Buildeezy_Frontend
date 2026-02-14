import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { setRegistrationTokenForPushNotifications } from "../apis/apiEndPoints";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn("Firebase Messaging is not supported on this browser.");
      return;
    }

    return getMessaging(firebaseApp);
    // Your messaging logic here
  } catch (err) {
    console.error("Firebase Messaging init failed:", err);
    // Optional: Send to Sentry, LogRocket, etc.
  }
  return null;
};

export const messaging = initMessaging();

export const requestForToken = async () => {
  try {
    if (!messaging) {
      console.error("Firebase Messaging is not initialized.");
      return;
    }
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      // You can send the token to your backend or store it in localStorage
      await setRegistrationTokenForPushNotifications({
        data: {
          type: "registration_token",
          token: currentToken,
        },
      });
    } else {
      console.log("No registration token available.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
};
