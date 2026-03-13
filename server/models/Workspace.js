import mongoose from "mongoose";

const workspaceMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      required: true,
    },
  },
  { _id: false },
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: {
      type: [workspaceMemberSchema],
      default: [],
    },
    plan: {
      type: String,
      default: "free",
      enum: ["free"],
    },
  },
  { timestamps: true },
);

workspaceSchema.index({ name: 1 });

export default mongoose.model("Workspace", workspaceSchema);
