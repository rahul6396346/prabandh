import { useEffect } from "react";
import { messaging } from "../services/firebase";
import { getToken, onMessage } from "firebase/messaging";

type Props = {
  userId: string;
};

const API_URL = 'http://localhost:8000/api/';

const NotificationHandler = ({ userId }: Props) => {
  useEffect(() => {

    //Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }

    //Request Permission & Get Token
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        const currentToken = await getToken(messaging, {
          vapidKey: "BBBpr4fqn0yJwdVFgzZ6X802cF7o8QCNwemGy840x2ByX1-wIKgSPysIbCEFSKa-AwzLeNhymMNQNv-xCkgkEEU", // get from Firebase project settings → Cloud Messaging
        });
        if (currentToken) {
            const response = await fetch(`${API_URL}save-fcm-token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId, token: currentToken }),
          });
          console.log("This is the response - ", response);
        }
      } else {
        console.log("Notification permission denied.");
      }
    };

    requestPermission();


    //Foreground Message Listener
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      if(payload.notification){
        new Notification(payload.notification.title || "Notification",{
          body: payload.notification.body || "",
        });
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return null;
};

export default NotificationHandler;
