import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },

    description: String,

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "pending", "completed", "closed"],
      default: "TODO",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    assignee: {
      type: String,
      default: "",
    },

    dueDate: Date,

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        workspace: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workspace",
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

taskSchema.virtual("project")
  .get(function getProject() {
    return this.projectId;
  })
  .set(function setProject(value) {
    this.projectId = value;
  });

taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ projectId: 1, createdAt: -1 });
taskSchema.index({ status: 1 });
taskSchema.index({ isArchived: 1, updatedAt: -1 });

export default mongoose.model("Task", taskSchema);
