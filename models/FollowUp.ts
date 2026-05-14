import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const FollowUpSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scheduledAt: { type: Date, required: true, index: true },
    completedAt: Date,
    status: { type: String, enum: ["pending","done","missed","rescheduled"], default: "pending", index: true },
    note: String,
    outcome: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

FollowUpSchema.index({ assignedTo: 1, status: 1, scheduledAt: 1 });

export type FollowUpDoc = InferSchemaType<typeof FollowUpSchema> & { _id: string };
export const FollowUp: Model<FollowUpDoc> =
  (models.FollowUp as Model<FollowUpDoc>) ||
  model<FollowUpDoc>("FollowUp", FollowUpSchema);
