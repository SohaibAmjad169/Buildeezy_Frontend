// Scripts for firebase and firebase messaging

// eslint-disable-next-line no-undef
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js"
);
// eslint-disable-next-line no-undef
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js"
);

//Firebase Config values imported from .env file
const firebaseConfig = {
  apiKey: "AIzaSyAg60Xe8rqVZpdLhlnR6QWUho5EPjirPuI",
  authDomain: "buildeezy-f700d.firebaseapp.com",
  projectId: "buildeezy-f700d",
  storageBucket: "buildeezy-f700d.appspot.com",
  messagingSenderId: "861533563063",
  appId: "1:861533563063:web:8326c88e8eedd1cc114532",
  measurementId: "G-M05V7MERD3",
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };
  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});
