import { requirePermission } from "@/lib/auth";
import { BreakScheduleManager } from "@/components/settings/BreakScheduleManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  await requirePermission("settings.manage");
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Unifost Edu CRM — admin & system configuration</p>
      </div>
      <BreakScheduleManager />
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-base">WhatsApp Business API</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>Set environment variables: <code className="bg-slate-100 px-1 rounded">WABA_TOKEN</code>, <code className="bg-slate-100 px-1 rounded">WABA_PHONE_NUMBER_ID</code></p>
          <p>Theme switcher available in top bar. Role-based access enforced on all modules.</p>
        </CardContent>
      </Card>
    </div>
  );
}
