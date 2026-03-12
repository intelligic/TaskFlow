import Activity from "../models/Activity.js";

export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ performedBy: req.user.id })
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentActivityFeed = async (req, res) => {
  try {
    const query = req.user && req.user.role === "admin" ? {} : { performedBy: req.user.id };

    const activities = await Activity.find(query)
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
