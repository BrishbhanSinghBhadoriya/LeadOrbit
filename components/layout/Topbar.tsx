"use client";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { JwtPayload } from "@/types";

export function Topbar({ user }: { user: JwtPayload }) {
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  return (
    <header className="h-16 border-b bg-background px-6 flex items-center gap-4">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search leads, students, universities…" className="pl-9" />
      </div>
      <button className="p-2 rounded-md hover:bg-muted relative" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
      </button>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium">{user.name ?? user.email}</div>
          <div className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</div>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
