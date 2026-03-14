import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    designation: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    slug: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },

    lastActive: Date,

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      index: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "invited"],
      default: "active",
      index: true,
    },

    inviteToken: {
      type: String,
      index: true,
    },

    inviteTokenExpires: Date,

    resetPasswordToken: {
      type: String,
      index: true,
    },

    resetPasswordExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function setSlug() {
  if (!this.isNew || !this.name) return;
  if (this.slug) return;

  const base = String(this.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const baseSlug = base || "user";
  let slug = baseSlug;
  let counter = 1;

  // Ensure uniqueness
  while (await this.constructor.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  this.slug = slug;
});

export default mongoose.model("User", userSchema);
