import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getLeadScope, getCallOverviewStats } from "@/lib/dashboard-stats";
import { CallOverviewCard } from "@/components/dashboard/CallOverviewCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default async function CallReportPage() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const stats = await getCallOverviewStats(scope);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Call Report</h1>
            <p className="text-sm text-slate-500">Complete call analytics & export</p>
          </div>
        </div>
        <Button asChild className="rounded-xl">
          <a href="/api/reports/calls/export">
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </a>
        </Button>
      </div>
      <CallOverviewCard stats={stats} />
    </div>
  );
}
