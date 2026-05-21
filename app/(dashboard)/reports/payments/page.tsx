import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requireUser } from "@/lib/auth";
import { getLeadScope } from "@/lib/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PaymentsReportPage() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const [paid, partial, pending] = await Promise.all([
    Lead.countDocuments({ ...scope, paymentStatus: "paid" }),
    Lead.countDocuments({ ...scope, paymentStatus: "partial_paid" }),
    Lead.countDocuments({ ...scope, paymentStatus: "pending" }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-2xl font-bold">Payment Report</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid", value: paid, color: "text-emerald-600" },
          { label: "Partial", value: partial, color: "text-amber-600" },
          { label: "Pending", value: pending, color: "text-slate-600" },
        ].map((s) => (
          <Card key={s.label} className="text-center shadow-lg border-none">
            <CardHeader><CardTitle className="text-sm">{s.label}</CardTitle></CardHeader>
            <CardContent><p className={`text-3xl font-bold ${s.color}`}>{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
