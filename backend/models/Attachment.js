import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: String,

    filePath: String
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);
