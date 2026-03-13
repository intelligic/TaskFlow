import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "",
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: [
        "SYSTEM",
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_REVIEW_REQUIRED",
        "TASK_APPROVED",
      ],
      default: "SYSTEM",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
