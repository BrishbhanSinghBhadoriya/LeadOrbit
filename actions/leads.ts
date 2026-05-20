"use server";
import { connectDB } from "@/lib/db";
import { Lead, SavedFilter, User } from "@/models";
import { requirePermission, requireUser } from "@/lib/auth";
import { leadSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { emitToRoom } from "@/lib/socket-emit";

function clampQualityScore(v: number) {
  return Math.max(-10, Math.min(10, v));
}

function getStatusQualityDelta(status?: string) {
  switch (status) {
    case "converted":
      return 3;
    case "qualified":
      return 2;
    case "interested":
    case "hot":
      return 1;
    case "follow_up":
    case "connected":
      return 0;
    case "cold":
    case "not_interested":
    case "duplicate":
    case "spam":
    case "rejected":
      return -1;
    default:
      return 0;
  }
}

function getDispositionQualityDelta(
  type?: string,
  disposition?: string,
  subDisposition?: string
) {
  if (type === "connected") {
    if (disposition === "Admission Process" && subDisposition === "Admission Completed") return 3;
    if (disposition === "Hot Lead") return 2;
    if (disposition === "Interested") return 1;
    if (disposition === "Warm Lead" || disposition === "Follow-Up") return 0;
    if (disposition === "Cold Lead") return -1;
  } else {
    if (disposition === "Wrong Number") return -2;
    if (disposition === "Spam Lead" || disposition === "Duplicate Lead") return -3;
    return -1;
  }
  return 0;
}

export async function saveFilter(name: string, type: string, filters: any) {
  const user = await requireUser();
  await connectDB();
  const filter = await SavedFilter.create({
    name,
    type,
    filters,
    userId: user.sub,
  });
  revalidatePath("/leads");
  return { id: String(filter._id) };
}

export async function deleteFilter(id: string) {
  const user = await requireUser();
  await connectDB();
  await SavedFilter.deleteOne({ _id: id, userId: user.sub });
  revalidatePath("/leads");
}

export async function createLead(input: any) {
  const user = await requirePermission("leads.create");
  
  // Sanitize input: convert empty strings to undefined for Zod and Mongoose
  const sanitizedInput = { ...input };
  ["assignedTo", "courseId", "universityId", "pipelineId"].forEach(field => {
    if (sanitizedInput[field] === "") {
      delete sanitizedInput[field];
    }
  });

  const data = leadSchema.parse(sanitizedInput);
  await connectDB();
  
  // Generate a simple Lead ID (e.g., LO-12345)
  const count = await Lead.countDocuments();
  const leadId = `LO-${1000 + count + 1}`;

  const lead = await Lead.create({
    ...data,
    leadId,
    qualityScore: 0,
    createdBy: user.sub,
    activities: [{ type: "create", by: user.sub, message: "Lead created" }],
  });
  emitToRoom("leads", "lead:created", { 
    id: lead._id, 
    name: lead.name, 
    leadId: lead.leadId 
  });
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
  revalidatePath("/leads");
}

export async function updateLead(leadId: string, input: any) {
  const me = await requirePermission("leads.update");
  await connectDB();
  
  const oldLead = await Lead.findById(leadId);
  if (!oldLead) throw new Error("Lead not found");

  // Sanitize input: convert empty strings to null for ObjectId fields
  const sanitizedInput = { ...input };
  const objectIdFields = ["assignedTo", "courseId", "universityId", "pipelineId"];
  
  objectIdFields.forEach(field => {
    if (sanitizedInput[field] === "") {
      sanitizedInput[field] = null;
    }
  });

  await Lead.findByIdAndUpdate(
    leadId,
    { 
      ...sanitizedInput,
      $push: { 
        activities: { 
          type: "update", 
          by: me.sub, 
          message: `Lead details updated by ${me.name}`,
          at: new Date()
        } 
      } 
    }
  );

  emitToRoom("leads", "lead:updated", { id: leadId });
  revalidatePath("/leads");
  return { success: true };
}

export async function bulkAssignLeads(leadIds: string[], userId: string) {
  const me = await requirePermission("leads.update");
  await connectDB();
  
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  await Lead.updateMany(
    { _id: { $in: leadIds } },
    { 
      assignedTo: userId,
      assignedAt: new Date(),
      $push: { 
        activities: { 
          type: "assignment", 
          by: me.sub, 
          message: `Lead bulk assigned to ${user.name} by ${me.name}`,
          at: new Date()
        } 
      } 
    }
  );
  
  emitToRoom("leads", "lead:assigned_bulk", { leadIds, userId });
  revalidatePath("/leads");
}

export async function saveDisposition(leadId: string, data: any) {
  const me = await requireUser();
  await connectDB();

  const { type, disposition, subDisposition, note, nextFollowUpAt, priority, probability } = data;

  const update: any = {
    disposition,
    subDisposition,
    priority,
    probability,
    lastContactedAt: new Date(),
    $push: {
      callLogs: {
        type,
        disposition,
        subDisposition,
        note,
        at: new Date(),
        by: me.sub
      },
      activities: {
        type: "call",
        by: me.sub,
        message: `Call ${type === 'connected' ? 'Connected' : 'Not Connected'}: ${disposition} - ${subDisposition}. Note: ${note}`,
        at: new Date()
      }
    }
  };

  if (nextFollowUpAt) {
    update.nextFollowUpAt = new Date(nextFollowUpAt);
    update.followUpAt = new Date(nextFollowUpAt);
  }

  // Update lead status based on disposition
  if (type === 'connected') {
    if (disposition === 'Admission Process' && subDisposition === 'Admission Completed') {
      update.status = 'converted';
      update.convertedAt = new Date();
    } else if (disposition === 'Hot Lead') {
      update.status = 'hot';
    } else if (disposition === 'Warm Lead') {
      update.status = 'warm';
    } else if (disposition === 'Cold Lead') {
      update.status = 'cold';
    } else if (disposition === 'Interested') {
      update.status = 'interested';
    } else if (disposition === 'Follow-Up') {
      update.status = 'follow_up';
    }
  } else {
    if (disposition === 'Spam Lead') update.status = 'spam';
    if (disposition === 'Duplicate Lead') update.status = 'duplicate';
  }

  const leadDoc = await Lead.findById(leadId).select("qualityScore");
  if (!leadDoc) throw new Error("Lead not found");
  const delta = getDispositionQualityDelta(type, disposition, subDisposition);
  update.qualityScore = clampQualityScore((leadDoc.qualityScore ?? 0) + delta);
  await Lead.findByIdAndUpdate(leadId, update);
  
  emitToRoom("leads", "lead:updated", { id: leadId });
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  
  return { success: true };
}

export async function addLeadRemark(leadId: string, message: string, status?: string) {
  const me = await requireUser();
  await connectDB();
  const leadDoc = await Lead.findById(leadId).select("qualityScore");
  if (!leadDoc) throw new Error("Lead not found");
  
  const updateData: any = {
    $push: { 
      activities: { 
        type: "note", 
        by: me.sub, 
        message: message,
        at: new Date()
      } 
    }
  };

  if (status) {
    updateData.status = status;
  }
  // Every counselor/user remark contributes towards quality scoring.
  const delta = status ? getStatusQualityDelta(status) : 1;
  updateData.qualityScore = clampQualityScore((leadDoc.qualityScore ?? 0) + delta);

  await Lead.findByIdAndUpdate(leadId, updateData);

  emitToRoom("leads", "lead:updated", { id: leadId });
  revalidatePath("/leads");
  return { success: true };
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

      // Generate a simple Lead ID (e.g., LO-12345)
      const count = await Lead.countDocuments();
      const leadId = `LO-${1000 + count + 1}`;

      await Lead.create({
        leadId,
        name: String(name).trim(),
        phone: cleanPhone,
        email: email ? String(email).trim().toLowerCase() : undefined,
        state: data.state || data.province,
        city: data.city || data.location,
        country: data.country || "India",
        source: data.source || "other",
        temperature: data.temperature || "warm",
        paymentStatus: data.paymentstatus || data.payment_status || "pending",
        courseId: data.courseid || data.course_id,
        universityId: data.universityid || data.university_id,
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
