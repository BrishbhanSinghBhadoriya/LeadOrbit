import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { leadSchema } from "@/lib/validators";
import { emitToRoom } from "@/lib/socket-emit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    const data = leadSchema.parse(body);
    
    await connectDB();
    
    // Check for duplicates
    const dup = await Lead.findOne({ phone: data.phone });
    
    // Generate Lead ID
    const count = await Lead.countDocuments();
    const leadId = `LO-${1000 + count + 1}`;

    const lead = await Lead.create({
      ...data,
      leadId,
      createdBy: "system", // External website submission
      duplicateOf: dup?._id,
      activities: [{ type: "create", by: "system", message: "Lead received from website" }],
    });

    // Real-time notification
    emitToRoom("leads", "lead:created", { 
      id: lead._id, 
      name: lead.name, 
      source: lead.source || "Website" 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Lead submitted successfully",
      id: lead._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Public lead submission error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Failed to submit lead" 
    }, { status: 400 });
  }
}
