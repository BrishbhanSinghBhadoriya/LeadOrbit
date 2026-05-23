"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface Notification {
  id: string;
  message: string;
  at: Date;
  read: boolean;
}

interface SocketContextType {
  socket: null;
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Socket.IO requires a persistent server (not supported on Vercel serverless).
    // We use polling-based notifications instead.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const isVercel  = !socketUrl || socketUrl.includes("vercel") || socketUrl === "";

    if (isVercel) {
      // No socket on Vercel — notifications via polling or push in future
      return;
    }

    // Only load socket.io-client if a real socket server URL is configured
    let cleanup: (() => void) | undefined;

    const initSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        const res = await fetch("/api/auth/token");
        if (!res.ok) return;
        const { token } = await res.json();

        const s = io(socketUrl, { auth: { token }, reconnectionAttempts: 3 });

        s.on("lead:created", (payload: any) => {
          const newNotif: Notification = {
            id: payload.id || Math.random().toString(),
            message: payload.name ? `New Lead: ${payload.name}` : "New Lead Received!",
            at: new Date(),
            read: false,
          };
          setNotifications((prev) => [newNotif, ...prev]);
        });

        cleanup = () => s.disconnect();
      } catch (err) {
        console.warn("Socket init skipped:", err);
      }
    };

    initSocket();
    return () => cleanup?.();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllAsRead   = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket: null, notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}
