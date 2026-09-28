// Background push handler. Keep the version in sync with the "firebase" package.
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCkCshvFrk4FiV5GQ411ejAhcO7j0WMJxw",
  authDomain: "finot-27952.firebaseapp.com",
  projectId: "finot-27952",
  storageBucket: "finot-27952.firebasestorage.app",
  messagingSenderId: "1023696345468",
  appId: "1:1023696345468:web:7dce36d128398815dd6cf9",
});

firebase.messaging().onBackgroundMessage((payload) => {
  const { title = "Finot", body = "" } = payload.notification || {};
  self.registration.showNotification(title, { body, icon: "/images/logo-192.png" });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/dashboard/notifications"));
});
