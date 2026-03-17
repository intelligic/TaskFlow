import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

async function migrate() {
  if (!MONGO_URI) {
    console.error("No MONGO_URI or MONGO_URI_DIRECT found in .env");
    process.exit(1);
  }
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected!");

  const Comment = mongoose.model(
    "Comment",
    new mongoose.Schema({ task: mongoose.Schema.Types.ObjectId }, { strict: false })
  );
  const Task = mongoose.model(
    "Task",
    new mongoose.Schema({ comments: [mongoose.Schema.Types.ObjectId] }, { strict: false })
  );

  // Step 1: Get all comments grouped by task
  const comments = await Comment.find({}, { task: 1 }).lean();
  console.log(`Found ${comments.length} total comments`);

  // Group comment IDs by task
  const taskCommentsMap = {};
  for (const comment of comments) {
    const taskId = comment.task?.toString();
    if (!taskId) continue;
    if (!taskCommentsMap[taskId]) taskCommentsMap[taskId] = [];
    taskCommentsMap[taskId].push(comment._id);
  }

  console.log(`Found comments for ${Object.keys(taskCommentsMap).length} tasks`);

  // Step 2: Update each task's comments array
  for (const [taskId, commentIds] of Object.entries(taskCommentsMap)) {
    const result = await Task.updateOne(
      { _id: taskId },
      { $set: { comments: commentIds } }
    );
    console.log(`Task ${taskId}: set ${commentIds.length} comments (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);
  }

  console.log("\nMigration complete!");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
