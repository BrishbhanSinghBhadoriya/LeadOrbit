import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function FollowupsReportPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <Button variant="ghost" size="icon" asChild><Link href="/reports"><ArrowLeft className="h-5 w-5" /></Link></Button>
      <h1 className="text-2xl font-bold">Follow-up Report</h1>
      <p className="text-slate-500">Use <Link href="/followups" className="text-primary underline">Follow-ups</Link> module for live tracking. Excel export coming in next phase.</p>
    </div>
  );
}
