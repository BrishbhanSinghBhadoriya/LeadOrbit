import { connectDB } from "@/lib/db";
import { User, Lead } from "@/models";
import { requirePermission } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function UserReportPage() {
  await requirePermission("reports.view.all");
  await connectDB();
  const users = await User.find({ role: { $in: ["counselor", "team_leader", "manager"] }, active: true });

  const rows = await Promise.all(
    users.map(async (u: any) => {
      const scope = { assignedTo: u._id };
      const [total, converted] = await Promise.all([
        Lead.countDocuments(scope),
        Lead.countDocuments({ ...scope, status: "converted" }),
      ]);
      const leads = await Lead.find(scope).select("qualityScore");
      const avgQuality =
        leads.length > 0
          ? Math.round(leads.reduce((s, l) => s + (l.qualityScore ?? 0), 0) / leads.length)
          : 0;
      return {
        name: u.name,
        role: u.role,
        total,
        converted,
        conversionRate: total ? Math.round((converted / total) * 100) : 0,
        performanceScore: avgQuality,
      };
    })
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-2xl font-bold">User Performance Report</h1>
      </div>
      <Card className="shadow-xl border-none overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Converted</th>
                <th className="px-4 py-3">Conv. %</th>
                <th className="px-4 py-3">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.name} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{r.name}</td>
                  <td className="px-4 py-3 capitalize">{r.role.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-center">{r.total}</td>
                  <td className="px-4 py-3 text-center">{r.converted}</td>
                  <td className="px-4 py-3 text-center text-primary font-bold">{r.conversionRate}%</td>
                  <td className="px-4 py-3 text-center">{r.performanceScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
