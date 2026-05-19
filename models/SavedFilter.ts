import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SavedFilterSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["lead", "admission", "task"], default: "lead" },
    filters: { type: Schema.Types.Mixed, required: true }, // JSON object of filter values
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavedFilterSchema.index({ userId: 1, name: 1 }, { unique: true });

export type SavedFilterDoc = InferSchemaType<typeof SavedFilterSchema> & { _id: string };
export const SavedFilter: Model<SavedFilterDoc> =
  (models.SavedFilter as Model<SavedFilterDoc>) || model<SavedFilterDoc>("SavedFilter", SavedFilterSchema);
