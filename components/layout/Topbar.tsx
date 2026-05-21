"use client";
import { Bell, Search, Palette, Check, Trash2, Clock, LogOut, User, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { JwtPayload } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const THEMES = [
  { id: "minimal",   name: "Minimal White",    color: "bg-white" },
  { id: "ocean",     name: "Ocean Blue",        color: "bg-blue-400" },
  { id: "sunset",    name: "Sunset Coral",      color: "bg-orange-400" },
  { id: "forest",    name: "Forest Emerald",    color: "bg-emerald-500" },
  { id: "lavender",  name: "Royal Lavender",    color: "bg-purple-500" },
  { id: "midnight",  name: "Midnight Dark",     color: "bg-slate-900" },
];

export function Topbar({ user }: { user: JwtPayload }) {
  const [theme, setTheme]                   = useState("minimal");
  const [showThemes, setShowThemes]         = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile]       = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useSocket();
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crm-theme") || "minimal";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (themeRef.current   && !themeRef.current.contains(e.target as Node))   setShowThemes(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const changeTheme = (t: string) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("crm-theme", t);
    setShowThemes(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth?action=logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    } finally {
      window.location.href = "/login";
    }
  };

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <header className="h-14 border-b bg-background flex items-center gap-2 px-4 relative z-40 shrink-0">
      {/* Mobile spacer for hamburger button */}
      <div className="w-8 md:hidden shrink-0" />

      {/* Search — hidden on very small screens, shown from sm */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          placeholder="Search leads…"
          className="w-full pl-9 pr-3 h-8 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => { setShowThemes(!showThemes); setShowNotifications(false); setShowProfile(false); }}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            title="Themes"
          >
            <Palette className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {showThemes && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-[60]"
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                      theme === t.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full border border-slate-200 shrink-0 ${t.color}`} />
                    {t.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowThemes(false); setShowProfile(false); }}
            className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-3.5 min-w-[14px] px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-1 w-[min(320px,90vw)] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[60]"
              >
                <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50">
                  <h3 className="font-semibold text-xs text-slate-800">Notifications</h3>
                  <div className="flex gap-1">
                    <button onClick={markAllAsRead} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500" title="Mark all read"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={clearNotifications} className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500" title="Clear all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 px-4 text-center">
                      <div className="bg-slate-100 h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bell className="h-5 w-5 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-400">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-3 hover:bg-slate-50 cursor-pointer relative ${!n.read ? "bg-blue-50/30" : ""}`}>
                          {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-full" />}
                          <div className="flex gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Bell className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-700 mb-0.5">{n.message}</p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <Clock className="h-2.5 w-2.5" />
                                {formatDistanceToNow(new Date(n.at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowThemes(false); }}
            className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Avatar className="h-7 w-7 border border-slate-200 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight max-w-[100px] truncate">{user.name ?? user.email}</p>
              <p className="text-[10px] text-slate-400 capitalize leading-tight">{user.role.replace("_", " ")}</p>
            </div>
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[60]"
              >
                <div className="px-4 py-3 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-primary text-white text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name ?? user.email}</p>
                      <p className="text-[10px] text-primary font-semibold capitalize">{user.role.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link href="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    My Profile
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 text-xs font-medium text-red-600 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
