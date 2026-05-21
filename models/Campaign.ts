import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CampaignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, unique: true, sparse: true, index: true },
    source: { type: String, default: "other" },
    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "active",
      index: true,
    },
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    startDate: Date,
    endDate: Date,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type CampaignDoc = InferSchemaType<typeof CampaignSchema> & { _id: string };
export const Campaign: Model<CampaignDoc> =
  (models.Campaign as Model<CampaignDoc>) || model<CampaignDoc>("Campaign", CampaignSchema);
