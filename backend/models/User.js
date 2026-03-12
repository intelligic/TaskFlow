import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["admin","employee"],
    default: "employee"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  inviteToken: String,

  inviteTokenExpires: Date

},{ timestamps:true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ inviteToken: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
