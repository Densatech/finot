// Firebase is only loaded when the user opts in to push notifications (see usePushNotifications),
// so it never weighs on the initial page load.
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";

// Firebase web config is public by design; env vars allow pointing at another project.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkCshvFrk4FiV5GQ411ejAhcO7j0WMJxw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "finot-27952.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "finot-27952",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "finot-27952.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1023696345468",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1023696345468:web:7dce36d128398815dd6cf9",
};

const VAPID_KEY =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  "BIweGretGW7ojWO_FwNixEBvFIkIdVvI_rv6MEbHRr8JsX_yoBQPXLKUcOndRGUoUTF5W8uS4JXbhXJhhKOCb6g";

async function getMessagingIfSupported() {
  if (!(await isSupported())) return null;
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return getMessaging(app);
}

/** Ask for permission (only call from a user action) and return the FCM token, or null. */
export async function requestPushToken(): Promise<string | null> {
  if (!("Notification" in window) || Notification.permission === "denied") return null;
  const messaging = await getMessagingIfSupported();
  if (!messaging) return null;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  return getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
}

/** Subscribe to foreground messages; returns an unsubscribe function. */
export async function subscribeToForegroundMessages(handler: (payload: MessagePayload) => void) {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, handler);
}
