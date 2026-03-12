import Activity from "../models/Activity.js";

const logActivity = async ({ action, taskId, projectId, userId }) => {

  try {

    await Activity.create({
      action,
      taskId,
      projectId,
      userId
    });

  } catch (error) {
    console.error("Activity log error:", error.message);
  }

};

export default logActivity;
