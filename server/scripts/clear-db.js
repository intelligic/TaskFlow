import dotenv from "dotenv";
import mongoose from "mongoose";

import Activity from "../models/Activity.js";
import AuditLog from "../models/AuditLog.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is missing in environment.");
  process.exit(1);
}

if (String(process.env.CONFIRM_CLEAR_DB || "").toLowerCase() !== "true") {
  console.error(
    "Refusing to clear DB without CONFIRM_CLEAR_DB=true. This deletes ALL documents.",
  );
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });

await Promise.all([
  Activity.deleteMany({}),
  AuditLog.deleteMany({}),
  Comment.deleteMany({}),
  Notification.deleteMany({}),
  Project.deleteMany({}),
  Task.deleteMany({}),
  User.deleteMany({}),
  Workspace.deleteMany({}),
]);

console.log("Database cleared.");
await mongoose.disconnect();
