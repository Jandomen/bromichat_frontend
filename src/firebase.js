import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

let messaging = null;

// Initialize messaging lazily and only if supported to avoid "unsupported-browser" error
const initializeMessaging = async () => {
    if (messaging) return messaging;
    try {
        if (await isSupported()) {
            messaging = getMessaging(app);
            return messaging;
        }
    } catch (err) {
        console.warn('⚠️ messaging-unsupported-browser:', err);
    }
    return null;
};

export const requestForToken = async (userId, token) => {
    try {
        const msg = await initializeMessaging();
        if (!msg) {
            console.warn('⚠️ FCM Messaging is not supported in this environment');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY?.trim();
            if (!vapidKey) {
                console.warn('⚠️ No VAPID key provided for FCM');
                return;
            }

            const fcmToken = await getToken(msg, { vapidKey });

            if (fcmToken) {
                console.log('✅ Token FCM obtenido:', fcmToken);
                await axios.put(`${process.env.REACT_APP_API_BACKEND}/user/fcm-token`,
                    { fcmToken },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        }
    } catch (error) {
        console.warn('⚠️ No se pudo obtener el token de notificaciones FCM. Revisa tu VAPID_KEY o el soporte del navegador.');
    }
};

export const onMessageListener = async () => {
    const msg = await initializeMessaging();
    if (!msg) return null;
    return new Promise((resolve) => {
        onMessage(msg, (payload) => {
            resolve(payload);
        });
    });
};

export { messaging };
