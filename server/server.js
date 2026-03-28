import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

import env from "./config/env.js";
import connectDB from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import activityFeedRoutes from "./routes/activityFeedRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const app = express();
// Trust proxy so rate-limits use the real client IP on Render/behind proxies.
app.set("trust proxy", 1);
app.disable("x-powered-by");
const server = http.createServer(app);
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(serverDir, "uploads");

const rawOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set(rawOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser or same-origin requests
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

const io = new SocketIOServer(server, { cors: corsOptions });
global.io = io;

const activeSocketsByUser = new Map();

const emitUserStatus = async (userId, workspaceId, isOnline) => {
  try {
    const update = { isOnline, lastActive: new Date() };
    const user = await User.findByIdAndUpdate(userId, update, { new: true })
      .select("_id name email role designation slug lastActive isVerified isOnline createdAt workspace");
    if (!user) return;
    const room = workspaceId ? `workspace:${workspaceId}` : undefined;
    if (room) {
      io.to(room).emit("userStatusUpdated", user);
    } else {
      io.emit("userStatusUpdated", user);
    }
  } catch (err) {
    logger.error("Failed to emit user status update", { error: err?.message || String(err) });
  }
};

const applySocketPresence = async (userId, workspaceId, isConnected) => {
  try {
    const user = await User.findById(userId).select("onlinePreference isOnline workspace");
    if (!user) return;
    if (!user.onlinePreference) return;

    if (isConnected) {
      if (!user.isOnline) {
        await emitUserStatus(userId, workspaceId, true);
      } else {
        // Refresh lastActive for connected users.
        await emitUserStatus(userId, workspaceId, true);
      }
    } else if (user.isOnline) {
      await emitUserStatus(userId, workspaceId, false);
    }
  } catch (err) {
    logger.error("Failed to apply socket presence", { error: err?.message || String(err) });
  }
};

const parseSocketCookies = (cookieHeader = "") => {
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

const resolveSocketToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  const authHeader = socket.handshake?.headers?.authorization || socket.handshake?.headers?.Authorization;
  const bearerToken =
    typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;
  const tokenHeader = socket.handshake?.headers?.["x-auth-token"] || socket.handshake?.headers?.token;
  const cookies = parseSocketCookies(socket.handshake?.headers?.cookie || "");

  return (
    authToken ||
    bearerToken ||
    (Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader) ||
    cookies.token ||
    null
  );
};

// Attempt to authenticate socket connections using cookie or auth token (if present).
io.use(async (socket, next) => {
  try {
    const token = resolveSocketToken(socket);
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || typeof decoded !== "object" || !decoded.id) return next();

    const dbUser = await User.findById(decoded.id).select("_id workspace role");
    if (!dbUser) return next();

    // Attach user info to socket and join workspace room
    socket.data.userId = String(dbUser._id);
    if (dbUser.workspace) {
      const room = `workspace:${String(dbUser.workspace)}`;
      socket.join(room);
      socket.data.workspace = String(dbUser.workspace);
    }
    return next();
  } catch (err) {
    // Don't prevent connections if auth is missing or invalid; proceed unauthenticated
    return next();
  }
});

io.on("connection", (socket) => {
  logger.info("Socket connected", { id: socket.id });
  const userId = socket.data?.userId;
  const workspaceId = socket.data?.workspace;

  if (userId) {
    const currentCount = activeSocketsByUser.get(userId) || 0;
    activeSocketsByUser.set(userId, currentCount + 1);
    if (currentCount === 0) {
      void applySocketPresence(userId, workspaceId, true);
    }
  }

  socket.on("disconnect", () => {
    logger.info("Socket disconnected");
    if (!userId) return;
    const currentCount = activeSocketsByUser.get(userId) || 0;
    const nextCount = Math.max(currentCount - 1, 0);
    if (nextCount === 0) {
      activeSocketsByUser.delete(userId);
      void applySocketPresence(userId, workspaceId, false);
    } else {
      activeSocketsByUser.set(userId, nextCount);
    }
  });
});

connectDB();

app.use(cors(corsOptions));
app.use(
  helmet({
    // Allow loading media (audio/image) from the backend in the frontend app.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  // Allow frequent profile checks without triggering rate limits.
  if (req.path === "/api/auth/profile") return next();
  return limiter(req, res, next);
});
app.use(
  "/uploads",
  express.static(uploadsDir, {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      const lower = filePath.toLowerCase();
      if (lower.endsWith(".webm")) {
        res.setHeader("Content-Type", "audio/webm");
      } else if (lower.endsWith(".m4a") || lower.endsWith(".mp4")) {
        res.setHeader("Content-Type", "audio/mp4");
      } else if (lower.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
      } else if (lower.endsWith(".wav")) {
        res.setHeader("Content-Type", "audio/wav");
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/activity", activityFeedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("TaskFlow API is running ??");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

const resolvePort = () => {
  const raw = process.env.PORT;
  if (raw) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  if (String(process.env.NODE_ENV || "").toLowerCase() === "production") {
    console.error("PORT is required in production. Falling back to default 5000.");
  }
  return env.PORT || 5000;
};

const PORT = resolvePort();

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set PORT to a free port and retry.`);
    logger.error(`Port ${PORT} is already in use. Set PORT to a free port and retry.`);
  } else {
    console.error(`Server error: ${error?.message || String(error)}`);
    logger.error(`Server error: ${error?.message || String(error)}`);
  }
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${error?.stack || error?.message || String(error)}`);
  server.close(() => process.exit(1));
});




