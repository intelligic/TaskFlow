import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Task from "../models/Task.js";

dotenv.config();

const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is missing in environment.");
  process.exit(1);
}

const slugify = (name) => {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "user";
};

const ensureUniqueSlug = async (base, userId) => {
  let slug = base;
  let counter = 1;
  while (await User.exists({ slug, _id: { $ne: userId } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
};

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000, family: 4 });

  let usersUpdated = 0;
  let assignedUpdated = 0;

  const users = await User.find({
    $or: [
      { slug: { $exists: false } },
      { slug: "" },
      { designation: { $exists: false } },
      { designation: "" },
    ],
  }).select("_id name role slug designation");

  for (const user of users) {
    const updates = {};

    if (!user.slug) {
      const base = slugify(user.name);
      updates.slug = await ensureUniqueSlug(base, user._id);
    }

    if (!user.designation) {
      updates.designation = user.role === "admin" ? "Administrator" : "Employee";
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: updates });
      usersUpdated += 1;
    }
  }

  const tasksNeedingAssign = await Task.find({
    assignedTo: { $exists: false },
    userId: { $exists: true, $ne: null },
  }).select("_id userId");

  for (const task of tasksNeedingAssign) {
    await Task.updateOne({ _id: task._id }, { $set: { assignedTo: task.userId } });
    assignedUpdated += 1;
  }

  const statusResult = await Task.updateMany(
    { status: { $exists: false } },
    { $set: { status: "pending" } },
  );

  const tagsResult = await Task.updateMany(
    { tags: { $exists: false } },
    { $set: { tags: [] } },
  );

  const tasksMigrated = assignedUpdated + (statusResult.modifiedCount || 0) + (tagsResult.modifiedCount || 0);

  console.log("Backfill complete.");
  console.log(`Users updated: ${usersUpdated}`);
  console.log(`Tasks migrated: ${tasksMigrated}`);
  console.log(`Tasks assignedTo updated: ${assignedUpdated}`);
  console.log(`Tasks status updated: ${statusResult.modifiedCount || 0}`);
  console.log(`Tasks tags updated: ${tagsResult.modifiedCount || 0}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  mongoose.disconnect().finally(() => process.exit(1));
});
