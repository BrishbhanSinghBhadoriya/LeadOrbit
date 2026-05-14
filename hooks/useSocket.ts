"use client";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

export function useSocket(token?: string) {
  const ref = useRef<Socket | null>(null);
  useEffect(() => {
    if (!token) return;
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "/", {
      auth: { token },
      withCredentials: true,
    });
    ref.current = s;
    return () => { s.disconnect(); };
  }, [token]);
  return ref;
}
