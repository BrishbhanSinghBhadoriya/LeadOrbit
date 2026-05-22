import { requirePermission } from "@/lib/auth";

export default async function AnalyticsPage() {
  await requirePermission("reports.view.all");
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      <p className="text-muted-foreground">Gain insights from your data.</p>
      <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        Analytics dashboard is coming soon...
      </div>
    </div>
  );
}
