import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requireUser } from "@/lib/auth";
import { getLeadScope } from "@/lib/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function RegistrationsReportPage() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const [started, qualified, converted] = await Promise.all([
    Lead.countDocuments({ ...scope, status: "application_started" }),
    Lead.countDocuments({ ...scope, status: "qualified" }),
    Lead.countDocuments({ ...scope, status: "converted" }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <h1 className="text-2xl font-bold">Registration Report</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Application Started", value: started },
          { label: "Qualified", value: qualified },
          { label: "Admission Done", value: converted },
        ].map((s) => (
          <Card key={s.label} className="shadow-lg border-none text-center">
            <CardHeader><CardTitle className="text-xs">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-primary">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
