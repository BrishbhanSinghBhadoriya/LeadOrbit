"use server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requirePermission } from "@/lib/auth";
import { leadSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { emitToRoom } from "@/lib/socket-emit";

export async function createLead(input: unknown) {
  const user = await requirePermission("leads.create");
  const data = leadSchema.parse(input);
  await connectDB();
  const lead = await Lead.create({
    ...data,
    createdBy: user.sub,
    activities: [{ type: "create", by: user.sub, message: "Lead created" }],
  });
  emitToRoom("leads", "lead:created", { id: lead._id });
  revalidatePath("/leads");
  return { id: String(lead._id) };
}

export async function assignLead(leadId: string, userId: string) {
  const me = await requirePermission("leads.assign");
  await connectDB();
  await Lead.findByIdAndUpdate(leadId, {
    assignedTo: userId,
    assignedAt: new Date(),
    $push: { activities: { type: "assignment", by: me.sub, message: `Assigned to ${userId}` } },
  });
  emitToRoom("leads", "lead:assigned", { leadId, userId });
  revalidatePath(`/leads/${leadId}`);
}

export async function changeStatus(leadId: string, status: string) {
  const me = await requirePermission("leads.update");
  await connectDB();
  await Lead.findByIdAndUpdate(leadId, {
    status,
    $push: { activities: { type: "status_change", by: me.sub, message: `Status → ${status}` } },
  });
  emitToRoom("leads", "lead:updated", { id: leadId });
  revalidatePath(`/leads/${leadId}`);
}

export async function importLeadsAction(leadsData: any[], pipelineId?: string) {
  const user = await requirePermission("leads.import");
  await connectDB();
  
  const results = { success: 0, error: 0, duplicates: 0 };
  
  for (const rawData of leadsData) {
    try {
      // Normalize keys to lowercase to handle different Excel header casings
      const data: any = {};
      for (const key in rawData) {
        data[key.toLowerCase().trim()] = rawData[key];
      }

      // Map common header variations
      const name = data.name || data.fullname || data.studentname || data.customername || data["full name"];
      const phone = data.phone || data.mobile || data.contact || data.phonenumber || data["phone number"] || data["phone no."] || data["phone no"];
      const email = data.email || data.mailid || data["email id"];

      if (!name || !phone) {
        results.error++;
        continue;
      }

      // Clean phone number (remove spaces, dashes, etc.)
      const cleanPhone = String(phone).replace(/[^0-9+]/g, "");

      // Check for duplicate phone
      const exists = await Lead.findOne({ phone: cleanPhone });
      if (exists) {
        results.duplicates++;
        continue;
      }

      await Lead.create({
        name: String(name).trim(),
        phone: cleanPhone,
        email: email ? String(email).trim().toLowerCase() : undefined,
        state: data.state || data.province,
        city: data.city || data.location,
        source: data.source || "csv_import",
        pipelineId: pipelineId || data.pipelineid || data.pipeline_id,
        stage: data.stage || "New",
        createdBy: user.sub,
        activities: [{ type: "create", by: user.sub, message: "Lead imported from Excel/CSV" }],
      });
      results.success++;
    } catch (err) {
      console.error("Import error for row:", rawData, err);
      results.error++;
    }
  }
  
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  return results;
}
