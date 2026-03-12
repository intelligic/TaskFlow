import Comment from "../models/Comment.js";

export const createComment = async ({ taskId, authorId, message }) => {
  const comment = await Comment.create({
    task: taskId,
    author: authorId,
    message,
  });

  await comment.populate("author", "name email role");
  return comment;
};

export const getTaskComments = async (taskId) => {
  return await Comment.find({ task: taskId })
    .populate("author", "name email role")
    .sort({ createdAt: -1 });
};
