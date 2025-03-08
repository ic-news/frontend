import { useEffect, useState } from "react";

type PushSubscriptionType = PushSubscription | null;

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [subscription, setSubscription] = useState<PushSubscriptionType>(null);

  useEffect(() => {
    // Check if the browser supports service workers
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      checkSubscription(registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const checkSubscription = async (registration: ServiceWorkerRegistration) => {
    const currentSubscription = await registration.pushManager.getSubscription();
    setSubscription(currentSubscription);
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: publicKey
      });

      setSubscription(pushSubscription);
      return true;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return false;
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();

      setSubscription(null);
      return true;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  };

  return {
    permission,
    subscription,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };
};
