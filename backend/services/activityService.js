import Activity from "../models/Activity.js";

export const createActivity = async ({
  action,
  performedBy,
  targetType,
  targetId,
  description
}) => {
  return await Activity.create({
    action,
    performedBy,
    targetType,
    targetId,
    description,
  });
};
