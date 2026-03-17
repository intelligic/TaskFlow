import Comment from "../models/Comment.js";
import Task from "../models/Task.js";

export const createComment = async ({ taskId, authorId, message, workspace }) => {
  const comment = await Comment.create({
    task: taskId,
    author: authorId,
    message,
    workspace,
  });

  // Push comment ID into the parent task's comments array
  await Task.findByIdAndUpdate(taskId, {
    $push: { comments: comment._id },
  });

  await comment.populate("author", "name email role");
  return comment;
};

export const getTaskComments = async (taskId, workspace) => {
  return await Comment.find({ task: taskId, workspace })
    .populate("author", "name email role")
    .sort({ createdAt: -1 })
    .lean();
};
