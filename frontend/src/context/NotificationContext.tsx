import React, { createContext, useContext, useState, useEffect } from "react";

export type NotificationType = "critical" | "warning" | "success" | "info";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  unread: boolean;
  route?: string; // Target page route to navigate to on click
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, "id" | "unread" | "time">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Sample initial notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Critical vulnerability detected",
    description: "Red Team discovered a high-risk bypass in cancel_order.",
    time: "2 min ago",
    type: "critical",
    unread: true,
    route: "redteam"
  },
  {
    id: "notif-2",
    title: "Agent evaluation completed",
    description: "E-Commerce Customer Support Agent achieved a 94.2% reliability score.",
    time: "15 min ago",
    type: "success",
    unread: true,
    route: "results"
  },
  {
    id: "notif-3",
    title: "Regression test passed",
    description: "V2 passed 94 of 100 security scenarios.",
    time: "32 min ago",
    type: "success",
    unread: true,
    route: "compare"
  },
  {
    id: "notif-4",
    title: "Security warning",
    description: "Tool issue_refund requires stronger identity verification.",
    time: "1 hour ago",
    type: "warning",
    unread: true,
    route: "analyzer"
  },
  {
    id: "notif-5",
    title: "Static scan completed",
    description: "6 vulnerability indicators were detected.",
    time: "2 hours ago",
    type: "info",
    unread: false,
    route: "analyzer"
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize notifications from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("ag_notifications");
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      setNotifications([]);
      sessionStorage.setItem("ag_notifications", JSON.stringify([]));
    }
  }, []);

  const saveNotifications = (items: NotificationItem[]) => {
    setNotifications(items);
    sessionStorage.setItem("ag_notifications", JSON.stringify(items));
  };

  const addNotification = (item: Omit<NotificationItem, "id" | "unread" | "time">) => {
    const newNotif: NotificationItem = {
      ...item,
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      time: "Just now",
      unread: true
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    saveNotifications(updated);
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
