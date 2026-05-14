import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const PipelineSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    stages: [
      {
        name: { type: String, required: true },
        color: { type: String, default: "#3b82f6" },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type PipelineDoc = InferSchemaType<typeof PipelineSchema> & { _id: string };
export const Pipeline: Model<PipelineDoc> =
  (models.Pipeline as Model<PipelineDoc>) || model<PipelineDoc>("Pipeline", PipelineSchema);
