import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

// Esta configuración la obtendrás de la consola de Firebase (Web App)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async (userId, token) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const fcmToken = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
            });

            if (fcmToken) {
                console.log('✅ Token FCM obtenido:', fcmToken);
                // Enviar el token al servidor
                await axios.put(`${process.env.REACT_APP_API_BACKEND}/user/fcm-token`,
                    { fcmToken },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        }
    } catch (error) {
        console.error('❌ Error obteniendo token FCM:', error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export { messaging };
