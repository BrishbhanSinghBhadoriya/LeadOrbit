import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/models";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await connectDB();
  const list = await Campaign.find().sort({ createdAt: -1 });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const user = await requireUser();
  await connectDB();
  const body = await req.json();
  const doc = await Campaign.create({ ...body, createdBy: user.sub });
  return NextResponse.json(doc);
}
