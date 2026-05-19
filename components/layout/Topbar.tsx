"use client";
import { Bell, Search, Palette, Check, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { JwtPayload } from "@/types";
import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const THEMES = [
  { id: 'minimal', name: 'Minimal White', color: 'bg-white' },
  { id: 'ocean', name: 'Ocean Blue', color: 'bg-blue-400' },
  { id: 'sunset', name: 'Sunset Coral', color: 'bg-orange-400' },
  { id: 'forest', name: 'Forest Emerald', color: 'bg-emerald-500' },
  { id: 'lavender', name: 'Royal Lavender', color: 'bg-purple-500' },
  { id: 'midnight', name: 'Midnight Dark', color: 'bg-slate-900' },
];

export function Topbar({ user }: { user: JwtPayload }) {
  const [theme, setTheme] = useState('minimal');
  const [showThemes, setShowThemes] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useSocket();
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('crm-theme') || 'minimal';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('crm-theme', newTheme);
    setShowThemes(false);
  };

  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center gap-4 relative z-50">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
        <Input placeholder="Search leads, students, universities…" className="pl-9 border-slate-200 focus-visible:ring-primary/20" />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Switcher */}
        <div className="relative">
          <button 
            onClick={() => setShowThemes(!showThemes)}
            className="p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-sm text-black transition-colors"
          >
            <Palette className="h-5 w-5" />
            <span className="hidden sm:inline">Themes</span>
          </button>
          
          <AnimatePresence>
            {showThemes && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-[60]"
              >
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors ${theme === t.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 text-black'}`}
                  >
                    <div className={`h-3 w-3 rounded-full border border-slate-200 ${t.color}`} />
                    {t.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100 relative transition-colors" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-black" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-[60]"
              >
                <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-medium text-sm text-black">Notifications</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={markAllAsRead}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Mark all as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={clearNotifications}
                      className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 px-4 text-center">
                      <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!notif.read ? 'bg-blue-50/30' : ''}`}
                        >
                          {!notif.read && (
                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                          )}
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-black font-normal mb-1">{notif.message}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notif.at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-2 border-t bg-slate-50/50 text-center">
                    <button className="text-[11px] font-medium text-primary hover:underline">
                      View all notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-2">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-normal text-black">{user.name ?? user.email}</div>
          <div className="text-xs text-black opacity-60 capitalize">{user.role.replace("_", " ")}</div>
        </div>
        <Avatar className="h-9 w-9 border border-slate-200">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
