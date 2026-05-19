import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const LEAD_STATUS = [
  "new",
  "interested",
  "not_interested",
  "follow_up",
  "callback",
  "converted",
  "closed",
  "admission_done",
] as const;

const LEAD_SOURCE = [
  "facebook",
  "google_ads",
  "website",
  "instagram",
  "whatsapp",
  "referral",
  "organic",
  "justdial",
  "indiamart",
  "other",
] as const;

const LEAD_TEMPERATURE = ["hot", "warm", "cold"] as const;
const PAYMENT_STATUS = ["paid", "partial_paid", "pending"] as const;
const CALL_STATUS = ["connected", "not_connected", "switched_off", "busy", "wrong_number"] as const;
const WHATSAPP_STATUS = ["replied", "not_replied", "sent"] as const;
const EMAIL_STATUS = ["opened", "not_opened", "clicked"] as const;
const ADMISSION_STAGE = ["documents_pending", "verification", "payment_pending", "admission_complete"] as const;

const ActivitySchema = new Schema(
  {
    type: { type: String, required: true }, // call, note, status_change, assignment, email, whatsapp
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: String,
    meta: Schema.Types.Mixed,
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const LeadSchema = new Schema(
  {
    leadId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: "text" },
    phone: { type: String, required: true, index: true },
    altPhone: String,
    email: { type: String, lowercase: true, index: true },
    country: { type: String, default: "India" },
    state: String,
    city: String,
    courseId: { type: Schema.Types.ObjectId, ref: "Course", index: true },
    universityId: { type: Schema.Types.ObjectId, ref: "University", index: true },
    source: { type: String, enum: LEAD_SOURCE, default: "other", index: true },
    status: { type: String, enum: LEAD_STATUS, default: "new", index: true },
    temperature: { type: String, enum: LEAD_TEMPERATURE, default: "warm", index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: "pending", index: true },
    callStatus: { type: String, enum: CALL_STATUS, index: true },
    whatsappStatus: { type: String, enum: WHATSAPP_STATUS, index: true },
    emailStatus: { type: String, enum: EMAIL_STATUS, index: true },
    admissionStage: { type: String, enum: ADMISSION_STAGE, index: true },
    score: { type: Number, default: 0, index: true }, // Lead score based on activities
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", index: true },
    assignedAt: Date,
    teamId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    pipelineId: { type: Schema.Types.ObjectId, ref: "Pipeline", index: true },
    stage: { type: String, index: true },
    notes: String,
    followUpAt: { type: Date, index: true },
    documents: [{ type: Schema.Types.ObjectId, ref: "Document" }],
    activities: [ActivitySchema],
    convertedAt: Date,
    revenue: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    duplicateOf: { type: Schema.Types.ObjectId, ref: "Lead" },
    lastContactedAt: Date,
  },
  { timestamps: true }
);

LeadSchema.index({ phone: 1, email: 1 });
LeadSchema.index({ status: 1, assignedTo: 1, followUpAt: 1 });
LeadSchema.index({ createdAt: -1 });

export type LeadDoc = InferSchemaType<typeof LeadSchema> & { _id: string };
export const Lead: Model<LeadDoc> =
  (models.Lead as Model<LeadDoc>) || model<LeadDoc>("Lead", LeadSchema);
