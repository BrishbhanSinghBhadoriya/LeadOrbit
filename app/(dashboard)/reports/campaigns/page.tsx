import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Campaign, Lead } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";

export default async function CampaignReportPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requirePermission("reports.view.all");
  const sp = await searchParams;
  await connectDB();
  const campaigns = await Campaign.find({ ...(sp.id ? { _id: sp.id } : {}) });
  const stats = await Promise.all(
    campaigns.map(async (c: any) => {
      const q = { campaignId: c._id };
      const [total, connected, converted] = await Promise.all([
        Lead.countDocuments(q),
        Lead.countDocuments({ ...q, status: { $in: ["connected", "interested", "hot", "warm"] } }),
        Lead.countDocuments({ ...q, status: "converted" }),
      ]);
      return {
        name: c.name,
        total,
        connected,
        notConnected: total - connected,
        converted,
        conversionPct: total ? Math.round((converted / total) * 100) : 0,
      };
    })
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-2xl font-bold">Campaign Report</h1>
      </div>
      {stats.map((s) => (
        <Card key={s.name} className="shadow-lg border-none">
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>{s.name}</CardTitle>
            <span className="text-sm font-bold text-primary">{s.conversionPct}% converted</span>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div><p className="text-xs text-slate-500">Total</p><p className="text-xl font-bold">{s.total}</p></div>
            <div><p className="text-xs text-slate-500">Connected</p><p className="text-xl font-bold text-emerald-600">{s.connected}</p></div>
            <div><p className="text-xs text-slate-500">Not Connected</p><p className="text-xl font-bold text-red-600">{s.notConnected}</p></div>
            <div><p className="text-xs text-slate-500">Converted</p><p className="text-xl font-bold">{s.converted}</p></div>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" asChild><Link href="/api/reports/leads/export"><Download className="h-4 w-4 mr-2" />Export Excel</Link></Button>
    </div>
  );
}
