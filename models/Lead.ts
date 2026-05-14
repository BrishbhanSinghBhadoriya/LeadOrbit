import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const LEAD_STATUS = [
  "new","attempted","interested","follow_up","hot",
  "admission_processing","documents_pending","payment_pending",
  "admission_confirmed","converted","closed","not_interested",
] as const;

const LEAD_SOURCE = [
  "website","facebook","google_ads","instagram",
  "referral","walkin","csv_import","other",
] as const;

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
    name: { type: String, required: true, trim: true, index: "text" },
    phone: { type: String, required: true, index: true },
    altPhone: String,
    email: { type: String, lowercase: true, index: true },
    state: String,
    city: String,
    courseId: { type: Schema.Types.ObjectId, ref: "Course", index: true },
    universityId: { type: Schema.Types.ObjectId, ref: "University", index: true },
    source: { type: String, enum: LEAD_SOURCE, default: "other", index: true },
    status: { type: String, enum: LEAD_STATUS, default: "new", index: true },
    score: { type: Number, default: 0, index: true }, // AI lead score
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
  },
  { timestamps: true }
);

LeadSchema.index({ phone: 1, email: 1 });
LeadSchema.index({ status: 1, assignedTo: 1, followUpAt: 1 });
LeadSchema.index({ createdAt: -1 });

export type LeadDoc = InferSchemaType<typeof LeadSchema> & { _id: string };
export const Lead: Model<LeadDoc> =
  (models.Lead as Model<LeadDoc>) || model<LeadDoc>("Lead", LeadSchema);
