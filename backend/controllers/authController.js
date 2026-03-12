import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

export const register = async (req, res) => {

try{

const {name,email,password} = req.body;

const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
const existingUser = await User.findOne({ email: normalizedEmail });

if(existingUser){
return res.status(400).json({message:"User already exists"});
}

const hashedPassword = await bcrypt.hash(password,10);

const verificationToken = crypto.randomBytes(32).toString("hex");

const configuredAdminEmail = process.env.ADMIN_EMAIL
  ? process.env.ADMIN_EMAIL.trim().toLowerCase()
  : null;

const hasAnyAdmin = await User.exists({ role: "admin" });
const shouldBeAdmin =
  !hasAnyAdmin || (configuredAdminEmail && configuredAdminEmail === normalizedEmail);

const user = await User.create({
name,
email: normalizedEmail,
password:hashedPassword,
role: shouldBeAdmin ? "admin" : "employee",
verificationToken,
isVerified: true,
});

const token = jwt.sign(
{ id: user._id, role: user.role },
process.env.JWT_SECRET,
{ expiresIn: "7d" }
);

res.status(201).json({
message:"User registered successfully",
token,
user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
},
});

}catch(err){

res.status(500).json({message:"Server error"});

}

};

export const login = async (req, res) => {

try{

const {email,password} = req.body;

const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : email;
const user = await User.findOne({ email: normalizedEmail });

if(!user){
return res.status(400).json({message:"Invalid credentials"});
}

if (user.role === "employee" && user.isVerified === false) {
  return res.status(403).json({ message: "Account not verified. Please set your password using the invite link." });
}

const isMatch = await bcrypt.compare(password,user.password);

if(!isMatch){
return res.status(400).json({message:"Invalid credentials"});
}

const token = jwt.sign(
{id:user._id,role:user.role},
process.env.JWT_SECRET,
{expiresIn:"7d"}
);

res.json({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

}catch(err){

res.status(500).json({message:"Server error"});

}

};

export const inviteEmployee = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { name, email } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const safeName = typeof name === "string" ? name.trim() : "";

    if (!safeName || safeName.length < 3) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const tempPassword = crypto.randomBytes(16).toString("hex");
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const user = existing
      ? await User.findOneAndUpdate(
        { _id: existing._id },
        {
          name: safeName,
          role: "employee",
          password: existing.password || hashedTempPassword,
          isVerified: false,
          inviteToken,
          inviteTokenExpires,
        },
        { new: true },
      )
      : await User.create({
        name: safeName,
        email: normalizedEmail,
        password: hashedTempPassword,
        role: "employee",
        isVerified: false,
        inviteToken,
        inviteTokenExpires,
      });

    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000";
    const link = `${frontendUrl.replace(/\\/+$/, "")}/set-password?token=${inviteToken}`;

    await sendEmail(
      normalizedEmail,
      "You're invited to TaskManager",
      `<p>Hello ${safeName},</p>
       <p>You have been invited to TaskManager. Set your password using the link below (valid for 24 hours):</p>
       <p><a href="${link}">${link}</a></p>`,
    );

    res.status(201).json({
      message: "Invite sent",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyInvite = async (req, res) => {
  try {
    const token = typeof req.query?.token === "string" ? req.query.token : "";
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: new Date() },
    }).select("_id name email role isVerified");

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
    if (typeof name === "string" && name.trim().length >= 3) {
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
