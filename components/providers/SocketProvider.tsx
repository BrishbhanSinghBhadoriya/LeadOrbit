"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  message: string;
  at: Date;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    
    const initSocket = async () => {
      try {
        const res = await fetch("/api/auth/token");
        if (!res.ok) return;
        const { token } = await res.json();
        
        const s = io(process.env.NEXT_PUBLIC_APP_URL || "", {
          auth: { token },
        });

        s.on("connect", () => {
          console.log("Socket connected");
        });

        s.on("lead:created", (payload: any) => {
          // Play sound
          audioRef.current?.play().catch(e => console.log("Audio play failed", e));
          
          const newNotif: Notification = {
            id: payload.id || Math.random().toString(),
            message: payload.name ? `New Lead: ${payload.name}` : "New Lead Received!",
            at: new Date(),
            read: false,
          };
          setNotifications(prev => [newNotif, ...prev]);
        });

        setSocket(s);

        return () => {
          s.disconnect();
        };
      } catch (err) {
        console.error("Socket init error", err);
      }
    };

    initSocket();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllAsRead, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}
