import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { sendEmail } from "../utils/sendEmail.js";
import { inviteEmailTemplate } from "../templates/inviteEmailTemplate.js";
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";
const normalizeUniqueId = (value) =>
  typeof value === "string" ? value.trim().toUpperCase() : "";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidName = (name) => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name);
const isValidWorkspaceName = (name) => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name);
const isValidUniqueId = (value) => /^[A-Z0-9]{4,32}$/.test(value);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])[^\s]{8,}$/.test(password);

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment");
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const setAuthCookie = (res, token) => {
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
  // In production (cross-site: Vercel -> Render), use SameSite=None + Secure.
  // In development, keep Lax to avoid issues on localhost.
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const resolveWorkspaceName = (fallback) => {
  const fromEnv = String(process.env.WORKSPACE_NAME || process.env.COMPANY_NAME || "").trim();
  return fromEnv || fallback || "TaskFlow";
};

const ensureWorkspaceForUser = async (user, customWorkspaceName) => {
  if (user.workspace) return user.workspace;

  if (user.role === "admin") {
    const workspace = await Workspace.create({
      name: resolveWorkspaceName(customWorkspaceName || `${user.name || "Admin"} Workspace`),
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

export const register = async (req, res) => {
  try {
    const { name, email, password, workspaceName, uniqueId } = req.body || {};

    const safeName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = normalizeEmail(email);
    const normalizedUniqueId = normalizeUniqueId(uniqueId);

    if (safeName.length < 2 || !isValidName(safeName)) {
      return res.status(400).json({ message: "Name can contain only letters and spaces" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!normalizedUniqueId || !isValidUniqueId(normalizedUniqueId)) {
      return res
        .status(400)
        .json({ message: "Unique ID is required (4-32 letters/numbers)" });
    }

    if (!password || typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const safeWorkspaceName = typeof workspaceName === "string" ? workspaceName.trim() : "";
    if (safeWorkspaceName && !isValidWorkspaceName(safeWorkspaceName)) {
      return res.status(400).json({ message: "Workspace name can contain only letters and spaces" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const existingUniqueId = await User.findOne({ uniqueId: normalizedUniqueId });
    if (existingUniqueId) {
      return res.status(400).json({ message: "Unique ID already exists" });
    }

    // First ever user becomes admin. Subsequent users can also register as admins 
    // of their own workspaces. If a specific "invite-only" policy is desired, 
    // it should be managed via configuration or a different logic.
    const role = "admin";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password: hashedPassword,
      uniqueId: normalizedUniqueId,
      role,
      isVerified: true,
      status: "active",
    });

    await ensureWorkspaceForUser(user, safeWorkspaceName);

    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "employee" && user.isVerified === false) {
      return res.status(403).json({
        message: "Account not verified. Please set your password using the invite link.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    try {
      await ensureWorkspaceForUser(user);

      const updates = { lastActive: new Date() };
      if (!user.slug) {
        const baseRaw = String(user.name || "user")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const base = baseRaw || "user";
        let slug = base;
        let counter = 1;
        while (await User.exists({ slug, _id: { $ne: user._id } })) {
          counter += 1;
          slug = `${base}-${counter}`;
        }
        updates.slug = slug;
      }

      await User.updateOne({ _id: user._id }, { $set: updates });
    } catch (updateError) {
      console.error("Login post-update failed:", updateError?.message || updateError);
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.json({ message: "Logged out" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const inviteEmployee = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, email, designation } = req.body || {};
    const requestedWorkspaceName =
      typeof req.body?.workspaceName === "string" ? req.body.workspaceName.trim() : "";
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeDesignation = typeof designation === "string" ? designation.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (!safeName || safeName.length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existing = await User.findOne({ email: normalizedEmail }).select("+password role isVerified");
    if (existing && existing.role !== "employee") {
      return res.status(400).json({ message: "User already exists and role cannot be changed" });
    }
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const admin = await User.findById(req.user.id).select("name email workspace");
    if (!admin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const workspaceId = await ensureWorkspaceForUser(admin);
    const workspace = await Workspace.findById(workspaceId).select("name");
    const workspaceName = workspace?.name || resolveWorkspaceName("TaskFlow");

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return res.status(500).json({ message: "Server misconfigured: FRONTEND_URL missing" });
    }
    const link = `${frontendUrl.replace(/\/+$/, "")}/set-password?token=${inviteToken}`;

    const adminName = admin?.name?.trim() || "Admin";
    const replyTo = admin?.email;
    const finalWorkspaceName = requestedWorkspaceName || workspaceName;

    await sendEmail(
      normalizedEmail,
      "You're invited to join TaskFlow",
      inviteEmailTemplate({
        inviteLink: link,
        adminName,
        workspaceName: finalWorkspaceName,
        employeeName: safeName,
      }),
      { replyTo },
    );

    const user = existing
      ? await User.findOneAndUpdate(
        { _id: existing._id },
        {
          name: safeName,
          role: "employee",
          password: existing.password || hashedTempPassword,
          isVerified: false,
          status: "invited",
          designation: safeDesignation,
          inviteToken,
          inviteTokenExpires,
          workspace: workspaceId,
        },
        { returnDocument: "after" },
      )
      : await User.create({
        name: safeName,
        email: normalizedEmail,
        password: hashedTempPassword,
        role: "employee",
        isVerified: false,
        status: "invited",
        designation: safeDesignation,
        inviteToken,
        inviteTokenExpires,
        workspace: workspaceId,
      });

    res.status(201).json({
      message: "Invite sent",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes("SMTP") || msg.includes("EMAIL_FROM")) {
      return res.status(500).json({ message: "Email service is not configured" });
    }
    return res.status(500).json({
      message: msg || "Unable to send invitation email",
    });
  }
};

export const verifyInvite = async (req, res) => {
  try {
    const token = typeof req.query?.token === "string" ? req.query.token : "";
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: new Date() },
    }).select("_id name email role designation slug isVerified");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({
      valid: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, designation: user.designation },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { token, password, name, designation } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.isVerified = true;
    user.status = "active";
    if (typeof name === "string" && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (typeof designation === "string" && designation.trim().length >= 2) {
      user.designation = designation.trim();
    }
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    if (user.workspace) {
      await Workspace.updateOne(
        { _id: user.workspace },
        { $addToSet: { members: { user: user._id, role: user.role || "employee" } } },
      );
    }

    res.json({ message: "Password set successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      return res.status(500).json({ message: "Server misconfigured: FRONTEND_URL missing" });
    }

    const link = `${frontendUrl.replace(/\/+$/, "")}/reset-password?token=${resetToken}`;
    const userName = user.name?.trim() || "there";

    await sendEmail(
      normalizedEmail,
      "Reset your TaskFlow password",
      resetPasswordTemplate({ resetLink: link, userName }),
    );

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes("SMTP") || msg.includes("EMAIL_FROM")) {
      return res.status(500).json({ message: "Email service is not configured" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPasswordWithEmail = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || typeof password !== "string" || !isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
