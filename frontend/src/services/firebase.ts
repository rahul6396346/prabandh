import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDP83Q30R8x7CyuWppgnklLOTkrC67wRpU",
  authDomain: "prabandh-6951e.firebaseapp.com",
  projectId: "prabandh-6951e",
  storageBucket: "prabandh-6951e.firebasestorage.app",
  messagingSenderId: "890993998941",
  appId: "1:890993998941:web:c4a1319258956aa17821b4",
  measurementId: "G-HBD7Q8CCMP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export {messaging, app}; 