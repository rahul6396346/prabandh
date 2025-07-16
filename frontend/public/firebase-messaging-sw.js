importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp( {
  apiKey: "AIzaSyDP83Q30R8x7CyuWppgnklLOTkrC67wRpU",
  authDomain: "prabandh-6951e.firebaseapp.com",
  projectId: "prabandh-6951e",
  messagingSenderId: "890993998941",
  appId: "1:890993998941:web:c4a1319258956aa17821b4",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log("Recieved background message ", payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body:payload.notification.body,
        icon:"/frontend/public/favicon.ico"
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
