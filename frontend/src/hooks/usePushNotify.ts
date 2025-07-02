import { useCallback } from "react";

export function usePushNotify() {
  // Request permission if not already granted
  const requestPermission = useCallback(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Show a notification
  const pushNotify = useCallback((title: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }, []);

  return { requestPermission, pushNotify };
} 