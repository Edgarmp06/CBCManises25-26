importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Configuracion de Firebase
firebase.initializeApp({
    apiKey: "AIzaSyAOG8EroOz3pn9o1fLYxbtTTV2laFBqd2s",
    authDomain: "cbc-manises.firebaseapp.com",
    projectId: "cbc-manises",
    storageBucket: "cbc-manises.firebasestorage.app",
    messagingSenderId: "756895829915",
    appId: "1:756895829915:web:b70f5930703f183bf65b3e"
});

const messaging = firebase.messaging();

// Manejo de notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logos/cbc-manises.jpg',
        badge: '/logos/cbc-manises.jpg',
        vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
