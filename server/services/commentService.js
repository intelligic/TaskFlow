import Comment from "../models/Comment.js";

export const createComment = async ({ taskId, authorId, message, workspace }) => {
  const comment = await Comment.create({
    task: taskId,
    author: authorId,
    message,
    workspace,
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
