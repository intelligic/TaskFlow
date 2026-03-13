import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { sendEmail } from "../utils/sendEmail.js";
import { inviteEmailTemplate } from "../templates/inviteEmailTemplate.js";

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment");
  }
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const resolveWorkspaceName = (fallback) => {
  const fromEnv = String(process.env.WORKSPACE_NAME || process.env.COMPANY_NAME || "").trim();
  return fromEnv || fallback || "TaskFlow";
};

const ensureWorkspaceForUser = async (user) => {
  if (user.workspace) return user.workspace;

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

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    const safeName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (safeName.length < 2) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const adminExists = await User.exists({ role: "admin" });
    const role = adminExists ? "employee" : "admin";

    if (role === "employee" && String(process.env.ALLOW_EMPLOYEE_REGISTER || "").toLowerCase() !== "true") {
      return res
        .status(403)
        .json({ message: "Employee registration is disabled. Please use an invite link." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: safeName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      isVerified: true,
      status: "active",
    });

    await ensureWorkspaceForUser(user);

    const token = signToken(user);

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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role === "employee" && user.isVerified === false) {
      return res.status(403).json({
        message: "Account not verified. Please set your password using the invite link.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
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

    const existing = await User.findOne({ email: normalizedEmail }).select("+password");
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
        { new: true },
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

    await Workspace.updateOne(
      { _id: workspaceId },
      { $addToSet: { members: { user: user._id, role: "employee" } } },
    );

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
      }),
      { replyTo },
    );

    res.status(201).json({
      message: "Invite sent",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    const msg = String(error?.message || "");
    if (msg.includes("SMTP") || msg.includes("EMAIL_FROM")) {
      return res.status(500).json({ message: "Email service is not configured" });
    }
    res.status(500).json({ message: "Server error" });
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
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { token, password, name } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Token is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
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
    if (typeof name === "string" && name.trim().length >= 2) {
      user.name = name.trim();
    }
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
