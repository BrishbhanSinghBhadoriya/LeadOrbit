import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AttendanceLog } from "@/models";
import { requirePermission } from "@/lib/auth";
import { excelBuffer } from "@/lib/export-excel";
import { format, differenceInMinutes } from "date-fns";

export async function GET() {
  await requirePermission("reports.view.all");
  await connectDB();
  const logs = await AttendanceLog.find().populate("userId", "name role").sort({ loginAt: -1 }).limit(5000);
  const rows = logs.map((log: any) => {
    const mins = log.logoutAt
      ? differenceInMinutes(new Date(log.logoutAt), new Date(log.loginAt))
      : log.workingMinutes || 0;
    return {
      User: log.userId?.name,
      Role: log.userId?.role,
      "Login Time": format(new Date(log.loginAt), "yyyy-MM-dd HH:mm"),
      "Logout Time": log.logoutAt ? format(new Date(log.logoutAt), "yyyy-MM-dd HH:mm") : "",
      "Working Hours": (mins / 60).toFixed(2),
      "Last Active": log.lastActiveAt ? format(new Date(log.lastActiveAt), "yyyy-MM-dd HH:mm") : "",
    };
  });
  const buf = excelBuffer(rows, "Attendance");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="attendance-report.xlsx"',
    },
  });
}
