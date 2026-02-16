importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración de Firebase (repite la de tu Web App)
// Estos valores se pueden hardcodear aquí ya que es un archivo estático en public
const firebaseConfig = {
    apiKey: "AIzaSyCiJ_NWRWvHIYQn0P8pz-7IjpkrAAVHrI",
    authDomain: "bromichat-4264c.firebaseapp.com",
    projectId: "bromichat-4264c",
    storageBucket: "bromichat-4264c.firebasestorage.app",
    messagingSenderId: "676002459960",
    appId: "1:676002459960:web:0b0622fbd3d3f7f8ee51cd"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Recibido mensaje en segundo plano:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
