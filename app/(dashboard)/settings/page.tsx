import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">Configure your CRM preferences.</p>
      <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        Settings module is coming soon...
      </div>
    </div>
  );
}
