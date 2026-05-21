import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requireUser } from "@/lib/auth";
import { getLeadScope } from "@/lib/dashboard-stats";
import { excelBuffer } from "@/lib/export-excel";

export async function GET() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const leads = await Lead.find(scope).populate("assignedTo", "name").limit(5000);
  const rows = leads.map((l: any) => ({
    "Lead ID": l.leadId,
    Name: l.name,
    Phone: l.phone,
    Status: l.status,
    "Quality Score": l.qualityScore ?? 0,
    Owner: l.assignedTo?.name || "",
  }));
  const buf = excelBuffer(rows, "Leads");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="leads-report.xlsx"',
    },
  });
}
