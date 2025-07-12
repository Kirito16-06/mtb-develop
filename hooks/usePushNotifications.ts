
/**
 * Hook for managing push notification subscriptions
 */
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function usePushNotifications() {
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const { status } = useSession();

  // Check if push notifications are supported
  useEffect(() => {
    console.log("Push notifications effect running, status:", status); //?dev
    // Reset state on session change
    setIsLoading(true);

    if (status !== "authenticated") {
      console.log("User not authenticated, skipping push setup"); //?dev
      setIsLoading(false);
      return;
    }

    // Check if service workers and push messaging are supported
    console.log("navigator", navigator); //?dev
    if ("serviceWorker" in navigator && "PushManager" in window) {
      console.log("Push notifications are supported"); //?dev
      setIsPushSupported(true);

      console.log("registreations", navigator.serviceWorker.getRegistrations()); //?dev

      // Register service worker
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration); //?dev
          setSwRegistration(registration);

          // Check if already subscribed
          return registration.pushManager.getSubscription();
        })
        .then((subscription) => {
          console.log("Existing push subscription:", subscription); //?dev
          setIsSubscribed(!!subscription);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err); //?dev
          setIsLoading(false);
          toast.error("Failed to set up notifications");
        });
    } else {
      console.log("Push notifications not supported in this browser"); //?dev
      setIsPushSupported(false);
      setIsLoading(false);
    }
  }, [status]);

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      console.log("Starting push notification subscription process"); //?dev
      setIsLoading(true);

      if (!swRegistration) {
        console.error("No service worker registration found"); //?dev
        throw new Error("Service worker not registered");
      }

      console.log("Requesting notification permission..."); //?dev
      const permission = await Notification.requestPermission();
      console.log("Notification permission status:", permission); //?dev

      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Get VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("VAPID public key available:", !!vapidPublicKey); //?dev

      if (!vapidPublicKey) {
        throw new Error("Push notification configuration is missing");
      }

      // Convert base64 VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true, // Always show notifications to user
        applicationServerKey,
      });
      console.log("Push subscription created:", subscription); //?dev

      // Send subscription to server
      await axios.post("/api/push/subscribe", {
        subscription,
        userAgent: navigator.userAgent,
      });
      console.log("Subscription sent to server successfully"); //?dev

      setIsSubscribed(true);
      toast.success("Push Notifications enabled");
    } catch (err: any) {
      console.error("Failed to subscribe to push notifications:", err); //?dev
      toast.error("Failed to enable notifications", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      console.log("Starting unsubscribe process"); //?dev
      setIsLoading(true);

      if (!swRegistration) {
        console.error("No service worker registration found for unsubscribe"); //?dev
        throw new Error("Service worker not registered");
      }

      // Get current subscription
      const subscription = await swRegistration.pushManager.getSubscription();
      console.log("Found existing subscription:", subscription); //?dev

      if (!subscription) {
        throw new Error("No subscription found");
      }

      // Unsubscribe
      await subscription.unsubscribe();
      console.log("Successfully unsubscribed from push service"); //?dev

      // Notify server
      await axios.post("/api/push/unsubscribe", {
        endpoint: subscription.endpoint,
      });
      console.log("Server notified of unsubscription"); //?dev

      setIsSubscribed(false);
      toast.success("Notifications disabled");
    } catch (err: any) {
      console.error("Failed to unsubscribe from push notifications:", err); //?dev
      toast.error("Failed to disable notifications", {
        description: err.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPushSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}

/**
 * Convert base64 string to Uint8Array for use with the Web Push API
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}