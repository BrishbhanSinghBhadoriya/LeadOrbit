import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { WhatsAppTemplate } from "@/models";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  await connectDB();
  const body = await req.json();
  const doc = await WhatsAppTemplate.create({ ...body, createdBy: user.sub });
  return NextResponse.json(doc);
}
