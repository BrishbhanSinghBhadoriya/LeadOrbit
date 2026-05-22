import { requireUser } from "@/lib/auth";
import { can } from "@/config/rbac";
import { BreakScheduleManager } from "@/components/settings/BreakScheduleManager";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Settings2, Bell } from "lucide-react";
import type { Role } from "@/types";

export default async function SettingsPage() {
  // All users can access settings (for theme customization)
  // Admin-only sections are conditionally rendered
  const user = await requireUser();
  const isAdmin = can(user.role as Role, "settings.manage");

  return (
    <div className="flex flex-col gap-5 pb-8 pl-10 md:pl-0 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {isAdmin ? "App configuration, themes & system settings" : "Personalize your experience"}
        </p>
      </div>

      {/* ── Theme Customization — ALL users ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Theme & Appearance</p>
            <p className="text-[11px] text-slate-400">Customize colors, backgrounds & text — saved to your browser</p>
          </div>
        </div>
        <div className="p-5">
          <ThemeSettings />
        </div>
      </div>

      {/* ── Admin-only sections ── */}
      {isAdmin && (
        <>
          {/* Break Schedule */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Break Schedule</p>
                <p className="text-[11px] text-slate-400">Configure team break alerts & timings</p>
              </div>
            </div>
            <div className="p-5">
              <BreakScheduleManager />
            </div>
          </div>

          {/* System Config */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings2 className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">System Configuration</p>
                <p className="text-[11px] text-slate-400">API keys, integrations & environment</p>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">WhatsApp Business API</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Set environment variables:
                    <code className="mx-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">WABA_TOKEN</code>
                    and
                    <code className="mx-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">WABA_PHONE_NUMBER_ID</code>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">Role-Based Access</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    All modules enforce role-based access. Manage user roles from the
                    <span className="text-primary font-semibold"> User Management</span> page.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">JWT Token Expiry</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Access token: <code className="px-1 bg-white border border-slate-200 rounded text-[10px] font-mono">8h</code> &nbsp;
                    Refresh token: <code className="px-1 bg-white border border-slate-200 rounded text-[10px] font-mono">30d</code>
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-700 mb-1">File Uploads</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cloudinary integration active. Set
                    <code className="mx-1 px-1 bg-white border border-slate-200 rounded text-[10px] font-mono">CLOUDINARY_*</code>
                    env variables.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
