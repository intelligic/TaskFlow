import Activity from "../models/Activity.js";

const logActivity = async ({ action, performedBy, targetType, targetId, description }) => {
  try {
    await Activity.create({
      action,
      performedBy,
      targetType,
      targetId,
      description,
    });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

export default logActivity;
