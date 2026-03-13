import User from "../models/User.js";

const updateLastActive = async (req, res, next) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { lastActive: new Date() });
    }
  } catch {
    // Avoid blocking requests if lastActive update fails.
  }
  next();
};

export default updateLastActive;
