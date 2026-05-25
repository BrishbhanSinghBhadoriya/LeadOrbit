import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { leadSchema } from "@/lib/validators";
import { emitToRoom } from "@/lib/socket-emit";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const secretKey = process.env.LEAD_INTEGRATION_KEY;

    if (!secretKey || apiKey !== secretKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Unauthorized: Invalid or missing API Key" 
      }, { status: 401 });
    }

    const body = await req.json();
    
    // Basic validation using existing schema
    const data = leadSchema.parse(body);
    
    await connectDB();
    
    // Check for duplicates by phone
    const dup = await Lead.findOne({ phone: data.phone });
    
    // Generate Unique Lead ID (LO-1001 format)
    const count = await Lead.countDocuments();
    const leadId = `LO-${1000 + count + 1}`;

    const lead = await Lead.create({
      ...data,
      leadId,
      createdBy: "external_api",
      duplicateOf: dup?._id,
      activities: [{ 
        type: "create", 
        by: "system", 
        message: `Lead received via External API from ${data.source || 'Website'}` 
      }],
    });

    // Real-time update for dashboard
    emitToRoom("leads", "lead:created", { 
      id: lead._id, 
      name: lead.name, 
      source: lead.source || "External Website" 
    });

    return NextResponse.json({ 
      success: true, 
      message: "Lead integrated successfully",
      leadId: lead.leadId,
      id: lead._id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("External lead integration error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.errors ? "Validation failed" : (error.message || "Failed to process lead"),
      details: error.errors || null
    }, { status: 400 });
  }
}
