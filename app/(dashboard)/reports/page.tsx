import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Phone, Megaphone, Users, Target, CreditCard, GraduationCap } from "lucide-react";

const REPORTS = [
  { href: "/reports/calls", label: "Call Report", icon: Phone, desc: "Attempted, connected, disposition" },
  { href: "/reports/campaigns", label: "Campaign Report", icon: Megaphone, desc: "Campaign-wise conversion analytics" },
  { href: "/reports/users", label: "User Performance", icon: Users, desc: "Counsellor KPIs & conversion" },
  { href: "/reports/leads", label: "Lead Conversion", icon: Target, desc: "Stage funnel & quality score" },
  { href: "/reports/followups", label: "Follow-up Report", icon: BarChart3, desc: "Pending & completed follow-ups" },
  { href: "/reports/payments", label: "Payment Report", icon: CreditCard, desc: "Payment status overview" },
  { href: "/reports/registrations", label: "Registration Report", icon: GraduationCap, desc: "Application & admission stage" },
];

export default async function ReportsHubPage() {
  await requireUser();
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Advanced Reports</h1>
        <p className="text-slate-500 mt-1">Download Excel reports with date, campaign & counsellor filters</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all hover:border-primary/20">
              <CardHeader>
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{r.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">{r.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
