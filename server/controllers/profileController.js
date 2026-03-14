import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id)
      .select("_id name email role designation slug lastActive workspace")
      .populate("workspace", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("API Error: /api/auth/profile", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
