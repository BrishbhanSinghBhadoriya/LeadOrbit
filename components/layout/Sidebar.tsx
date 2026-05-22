"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarClock, Megaphone, BarChart3,
  MessageCircle, FileText, ClipboardList, Bell, UserCog, Settings,
  Kanban, GraduationCap, BookOpen, ChevronRight, X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role, JwtPayload } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: "all" | readonly Role[];
};

const NAV: NavItem[] = [
  { href: "/dashboard",     label: "Dashboard",       icon: LayoutDashboard, roles: "all" },
  { href: "/leads",         label: "Leads",           icon: Users,           roles: "all" },
  { href: "/followups",     label: "Follow-ups",      icon: CalendarClock,   roles: "all" },
  { href: "/campaigns",     label: "Campaigns",       icon: Megaphone,       roles: ["super_admin","admin","general_manager","manager","team_leader"] },
  { href: "/reports",       label: "Reports",         icon: BarChart3,       roles: ["super_admin","admin","general_manager","manager","team_leader","hr","it"] },
  { href: "/whatsapp",      label: "WhatsApp",        icon: MessageCircle,   roles: ["super_admin","admin","general_manager","manager","team_leader","counselor"] },
  { href: "/templates",     label: "Templates",       icon: FileText,        roles: ["super_admin","admin","general_manager","manager","team_leader","counselor"] },
  { href: "/attendance",    label: "Attendance",      icon: ClipboardList,   roles: "all" },
  { href: "/notifications", label: "Notifications",   icon: Bell,            roles: "all" },
  { href: "/employees",     label: "User Management", icon: UserCog,         roles: ["super_admin","general_manager","hr","admin","manager","team_leader"] },
  { href: "/pipeline",      label: "Pipeline",        icon: Kanban,          roles: ["super_admin","admin","general_manager","manager","team_leader"] },
  { href: "/universities",  label: "Universities",    icon: GraduationCap,   roles: ["super_admin","admin","general_manager","it"] },
  { href: "/courses",       label: "Courses",         icon: BookOpen,        roles: ["super_admin","admin","general_manager","it"] },
  { href: "/settings",      label: "Settings",        icon: Settings,        roles: "all" },
];

const MAIN_HREFS = ["/dashboard","/leads","/followups","/campaigns","/reports","/whatsapp","/templates","/attendance","/notifications","/employees"];

function canSee(roles: NavItem["roles"], role: Role) {
  return roles === "all" || (roles as readonly string[]).includes(role);
}

function NavContent({
  role, user, pathname, onClose,
}: {
  role: Role; user?: JwtPayload; pathname: string; onClose?: () => void;
}) {
  const initials = user ? (user.name ?? user.email).slice(0, 2).toUpperCase() : "U";
  const mainNav  = NAV.filter((n) => MAIN_HREFS.includes(n.href));
  const extraNav = NAV.filter((n) => !MAIN_HREFS.includes(n.href));

  const renderLink = (n: NavItem) => {
    if (!canSee(n.roles, role)) return null;
    const active = pathname === n.href || (n.href !== "/dashboard" && pathname?.startsWith(n.href));
    const Icon = n.icon;
    return (
      <Link
        key={n.href}
        href={n.href}
        onClick={onClose}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
          active
            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{n.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-100 shrink-0">
        <Image src="/favicon-32x32.png" alt="Unifost Edu" width={28} height={28} className="rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">Unifost Edu</p>
          <p className="text-xs font-semibold text-slate-700 truncate">Pvt. Ltd.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 md:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User Profile Card */}
      {user && (
        <Link
          href="/profile"
          onClick={onClose}
          className="group mx-3 mt-3 flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm shrink-0">
            <AvatarFallback className="bg-primary text-white text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">
              {user.name ?? user.email}
            </p>
            <p className="text-[10px] text-slate-400 capitalize truncate leading-tight">
              {role.replace("_", " ")}
            </p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-1">
        <p className="px-3 pt-1 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Main</p>
        {mainNav.map(renderLink)}
        <p className="px-3 pt-3 pb-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Manage</p>
        {extraNav.map(renderLink)}
      </nav>

      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <p className="text-[9px] text-slate-300 text-center">© 2025 Unifost Edu Pvt. Ltd.</p>
      </div>
    </div>
  );
}

export function Sidebar({ role, user }: { role: Role; user?: JwtPayload }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger — shown in Topbar via context, but we expose a button here too */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-50 h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4 text-slate-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent role={role} user={user} pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-white shrink-0">
        <NavContent role={role} user={user} pathname={pathname} />
      </aside>
    </>
  );
}
