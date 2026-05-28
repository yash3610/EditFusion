import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "pdf", "convert"],
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "completed"],
      default: "draft",
    },
    thumbnailUrl: { type: String },
    files: {
      sourceUrl: { type: String },
      outputUrl: { type: String },
    },
    metadata: { type: Object, default: {} },
    recent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
