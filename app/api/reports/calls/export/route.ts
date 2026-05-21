import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requireUser } from "@/lib/auth";
import { getLeadScope } from "@/lib/dashboard-stats";
import { excelBuffer } from "@/lib/export-excel";
import { format } from "date-fns";

export async function GET() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);
  const leads = await Lead.find(scope)
    .populate("assignedTo", "name")
    .sort({ updatedAt: -1 })
    .limit(5000);

  const rows = leads.map((l: any) => {
    const lastCall = l.callLogs?.length ? l.callLogs[l.callLogs.length - 1] : null;
    return {
      "Lead ID": l.leadId,
      Name: l.name,
      Phone: l.phone,
      Status: l.status,
      Disposition: l.disposition || "",
      "Sub Disposition": l.subDisposition || "",
      "Last Call Type": lastCall?.type || "",
      "Last Call At": lastCall?.at ? format(new Date(lastCall.at), "yyyy-MM-dd HH:mm") : "",
      Owner: l.assignedTo?.name || "Unassigned",
      "Quality Score": l.qualityScore ?? 0,
    };
  });

  const buf = excelBuffer(rows, "Call Report");
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="call-report-${format(new Date(), "yyyy-MM-dd")}.xlsx"`,
    },
  });
}
