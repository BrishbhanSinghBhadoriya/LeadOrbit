import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requirePermission, requireUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validators";
import { can } from "@/config/rbac";
import type { Role } from "@/types";
import { emitToRoom } from "@/lib/socket-emit";

export async function GET(req: Request) {
  const user = await requireUser();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? "25"), 100);
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };

  const role = user.role as Role;
  if (!can(role, "leads.view.all")) {
    if (can(role, "leads.view.team")) {
      filter.teamId = user.sub; // adjust to your team-scoping rule
    } else {
      filter.assignedTo = user.sub;
    }
  }

  const [items, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
    Lead.countDocuments(filter),
  ]);
  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: Request) {
  const user = await requirePermission("leads.create");
  const data = leadSchema.parse(await req.json());
  await connectDB();
  const dup = await Lead.findOne({ phone: data.phone });
  const lead = await Lead.create({
    ...data,
    createdBy: user.sub,
    duplicateOf: dup?._id,
    activities: [{ type: "create", by: user.sub, message: "Lead created" }],
  });
  emitToRoom("leads", "lead:created", { 
    id: lead._id, 
    name: lead.name, 
    source: lead.source 
  });
  return NextResponse.json({ id: lead._id }, { status: 201 });
}
