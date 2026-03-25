import Task from "../models/Task.js";
import User from "../models/User.js";
import { emitRealtime } from "../utils/realtime.js";

export const getEmployees = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, role } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const roleFilter = typeof role === "string" && role.trim() ? role.trim() : "employee";
    const query = { role: roleFilter, workspace: req.user.workspace };
    if (typeof search === "string" && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(query)
        .select("_id name email role designation slug lastActive isVerified isOnline createdAt")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const ids = items.map((u) => u._id);

    const taskCounts = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: ids },
          workspace: req.user.workspace,
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $in: ["$status", ["completed", "closed", "archived"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    const countsByUserId = new Map(
      taskCounts.map((c) => [String(c._id), { pending: c.pending || 0, completed: c.completed || 0 }]),
    );

    const employees = items.map((u) => {
      const counts = countsByUserId.get(String(u._id)) || { pending: 0, completed: 0 };
      return {
        ...u,
        pending: counts.pending,
        completed: counts.completed,
        status: u.isVerified ? "Active" : "Invited",
      };
    });

    res.json({ total, page: pageNum, employees });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, workspace: req.user.workspace })
      .select("_id name email role designation slug lastActive isVerified isOnline createdAt")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserBySlug = async (req, res) => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : "";
    if (!slug) return res.status(400).json({ message: "Slug is required" });

    const user = await User.findOne({ slug, workspace: req.user.workspace })
      .select("_id name email role designation slug lastActive isVerified isOnline createdAt")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== "boolean") {
      return res.status(400).json({ message: "isOnline must be a boolean" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isOnline },
      { new: true }
    ).select("_id name email role designation slug lastActive isVerified isOnline createdAt workspace");
    

    if (!user) return res.status(404).json({ message: "User not found" });
    // Emit only to sockets connected to the same workspace to avoid leaking across workspaces
    const room = user.workspace ? `workspace:${user.workspace}` : undefined;
    emitRealtime("userStatusUpdated", user, room);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
