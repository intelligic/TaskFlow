import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

const resolveWorkspaceName = (fallback) => {
  const fromEnv = String(process.env.WORKSPACE_NAME || process.env.COMPANY_NAME || "").trim();
  return fromEnv || fallback || "TaskFlow";
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const parseCookies = (cookieHeader = "") => {
  const out = {};
  cookieHeader.split(";").forEach((part) => {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey?.trim();
    if (!key) return;
    const value = rest.join("=").trim();
    out[key] = decodeURIComponent(value);
  });
  return out;
};

const ensureWorkspaceForUser = async (user) => {
  if (user.workspace) {
    if (isValidObjectId(user.workspace)) {
      const existing = await Workspace.exists({ _id: user.workspace });
      if (existing) return user.workspace;
    }
    // Reset invalid or stale workspace references.
    user.workspace = undefined;
  }

  if (user.role === "admin") {
    const workspace = await Workspace.create({
      name: resolveWorkspaceName(`${user.name || "Admin"} Workspace`),
      owner: user._id,
      members: [{ user: user._id, role: "admin" }],
      plan: "free",
    });
    user.workspace = workspace._id;
    await user.save();
    return workspace._id;
  }

  const admin = await User.findOne({ role: "admin", workspace: { $ne: null } }).select("workspace");
  if (admin?.workspace) {
    user.workspace = admin.workspace;
    await user.save();
    await Workspace.updateOne(
      { _id: admin.workspace },
      { $addToSet: { members: { user: user._id, role: user.role } } },
    );
    return admin.workspace;
  }

  const workspace = await Workspace.create({
    name: resolveWorkspaceName("TaskFlow Workspace"),
    owner: user._id,
    members: [{ user: user._id, role: user.role }],
    plan: "free",
  });
  user.workspace = workspace._id;
  await user.save();
  return workspace._id;
};

const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server misconfigured: JWT_SECRET missing" });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  const tokenFromHeader = req.headers["x-auth-token"] || req.headers.token;
  const cookies = parseCookies(req.headers.cookie || "");
  const tokenFromCookie = cookies.token;
  const token =
    bearerToken ||
    (Array.isArray(tokenFromHeader) ? tokenFromHeader[0] : tokenFromHeader) ||
    tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!isValidObjectId(decoded.id)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dbUser = await User.findById(decoded.id).select("_id name role workspace");
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workspaceId = await ensureWorkspaceForUser(dbUser);

    const decodedUser = {
      id: String(dbUser._id),
      role: dbUser.role,
      workspace: workspaceId || dbUser.workspace || null,
    };
    req.user = decodedUser;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const optionalProtect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) return next();

  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  const tokenFromHeader = req.headers["x-auth-token"] || req.headers.token;
  const cookies = parseCookies(req.headers.cookie || "");
  const tokenFromCookie = cookies.token;
  const token =
    bearerToken ||
    (Array.isArray(tokenFromHeader) ? tokenFromHeader[0] : tokenFromHeader) ||
    tokenFromCookie;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded.id || !decoded.role) {
      return next();
    }

    if (!isValidObjectId(decoded.id)) return next();

    const dbUser = await User.findById(decoded.id).select("_id name role workspace");
    if (!dbUser) return next();

    req.user = {
      id: String(dbUser._id),
      role: dbUser.role,
      workspace: dbUser.workspace || null,
    };
    next();
  } catch {
    next();
  }
};

export default protect;
