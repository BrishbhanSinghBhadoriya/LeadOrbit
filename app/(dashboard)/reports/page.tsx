import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { can } from "@/config/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Phone, Megaphone, Users, Target, CreditCard, GraduationCap } from "lucide-react";
import type { Role } from "@/types";

export default async function ReportsHubPage() {
  const user = await requireUser();
  const role = user.role as Role;

  const canViewAll  = can(role, "reports.view.all");
  const canViewTeam = can(role, "reports.view.team");

  if (!canViewAll && !canViewTeam) redirect("/dashboard");

  const ALL_REPORTS = [
    { href: "/reports/calls",         label: "Call Report",         icon: Phone,         desc: "Attempted, connected, disposition",      adminOnly: false },
    { href: "/reports/campaigns",     label: "Campaign Report",     icon: Megaphone,     desc: "Campaign-wise conversion analytics",     adminOnly: true  },
    { href: "/reports/users",         label: "User Performance",    icon: Users,         desc: "Counsellor KPIs & conversion",           adminOnly: true  },
    { href: "/reports/leads",         label: "Lead Conversion",     icon: Target,        desc: "Stage funnel & quality score",           adminOnly: false },
    { href: "/reports/followups",     label: "Follow-up Report",    icon: BarChart3,     desc: "Pending & completed follow-ups",         adminOnly: false },
    { href: "/reports/payments",      label: "Payment Report",      icon: CreditCard,    desc: "Payment status overview",                adminOnly: true  },
    { href: "/reports/registrations", label: "Registration Report", icon: GraduationCap, desc: "Application & admission stage",          adminOnly: true  },
  ];

  const reports = ALL_REPORTS.filter((r) => !r.adminOnly || canViewAll);

  return (
    <div className="flex flex-col gap-5 pb-6 pl-10 md:pl-0">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Reports</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {canViewAll ? "Full analytics & Excel exports" : "Team performance reports"}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="h-full border border-slate-100 shadow-sm bg-white hover:shadow-md hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <r.icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-bold">{r.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">{r.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
