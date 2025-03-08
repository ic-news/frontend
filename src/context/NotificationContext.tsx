import { toast } from "@/components/ui/sonner";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface NotificationOptionsProps extends NotificationOptions {
  href?: string;
}
interface NotificationContextType {
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptionsProps) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Check if already has permission
    if (Notification.permission === "granted") {
      setHasPermission(true);
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.load();
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === "granted");
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch((error) => {
        console.error("Error playing notification sound:", error);
      });
    }
  };

  const sendNotification = (title: string, options?: NotificationOptionsProps) => {
    // Play notification sound
    playNotificationSound();

    if (hasPermission) {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error("Error sending notification:", error);
        // Fallback to toast if browser notification fails
        showToastNotification(title, options);
      }
    } else {
      // Use toast notification as fallback
      showToastNotification(title, options);
    }
  };

  const showToastNotification = (title: string, options?: NotificationOptionsProps) => {
    toast(title, {
      description: options?.body || "",
      duration: 5000,
      href: options?.href,
    });
  };

  return (
    <NotificationContext.Provider value={{ hasPermission, requestPermission, sendNotification }}>
      <audio ref={audioRef} src="/audio.mp3" preload="auto" />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
