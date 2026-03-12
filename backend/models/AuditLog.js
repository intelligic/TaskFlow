import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    action: {
      type: String,
      required: true
    },

    entityType: {
      type: String,
      enum: ["USER", "PROJECT", "TASK", "COMMENT", "ATTACHMENT"],
      required: true
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    details: {
      type: Object
    },

    ipAddress: String
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
