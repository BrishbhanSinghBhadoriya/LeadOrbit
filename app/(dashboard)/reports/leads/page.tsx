import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getLeadScope, getLeadsByStageStats } from "@/lib/dashboard-stats";
import { LeadsByStageCard } from "@/components/dashboard/LeadsByStageCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default async function LeadConversionReportPage() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const stageStats = await getLeadsByStageStats(scope);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <h1 className="text-2xl font-bold">Lead Conversion Report</h1>
        </div>
        <Button variant="outline" asChild>
          <a href="/api/reports/leads/export"><Download className="h-4 w-4 mr-2" />Excel</a>
        </Button>
      </div>
      <LeadsByStageCard data={stageStats} />
    </div>
  );
}
