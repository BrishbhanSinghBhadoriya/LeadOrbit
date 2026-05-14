import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ActivitySchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true, index: true }, // lead.create, lead.assign, user.login, ...
    entity: { type: String, required: true }, // Lead, User, ...
    entityId: { type: Schema.Types.ObjectId, index: true },
    diff: Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

ActivitySchema.index({ entity: 1, entityId: 1, createdAt: -1 });

export type ActivityDoc = InferSchemaType<typeof ActivitySchema> & { _id: string };
export const Activity: Model<ActivityDoc> =
  (models.Activity as Model<ActivityDoc>) ||
  model<ActivityDoc>("Activity", ActivitySchema);
