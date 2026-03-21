import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
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
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const app = express();
app.disable("x-powered-by");
const server = http.createServer(app);
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(serverDir, "uploads");

const originRaw =
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  process.env.CLIENT_ORIGIN ||
  "";

const allowedOrigins = originRaw
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const isDev = env.NODE_ENV !== "production";
const isLocalhostOrigin = (origin) =>
  typeof origin === "string" &&
  (origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:"));

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) {
      return cb(null, isDev);
    }
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    if (isDev && isLocalhostOrigin(origin)) {
      return cb(null, true);
    }
    return cb(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

const io = new SocketIOServer(server, { cors: corsOptions });
global.io = io;

// Attempt to authenticate socket connections using the auth cookie (if present).
io.use(async (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const parts = cookieHeader.split(";").map((p) => p.trim());
    const cookies = {};
    parts.forEach((part) => {
      const [k, ...rest] = part.split("=");
      if (!k) return;
      cookies[k.trim()] = decodeURIComponent(rest.join("=") || "");
    });
    const token = cookies.token;
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
    // Don't prevent connections if cookie is missing or invalid; proceed unauthenticated
    return next();
  }
});

io.on("connection", (socket) => {
  logger.info("Socket connected", { id: socket.id });
  socket.on("disconnect", () => {
    logger.info("Socket disconnected");
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
app.use(express.json({ limit: "1mb" }));
app.use(limiter);
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
  res.send("TaskManager API running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

const PORT = env.PORT || process.env.PORT || 5000;

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use. Set PORT to a free port and retry.`);
  } else {
    logger.error(`Server error: ${error?.message || String(error)}`);
  }
  process.exit(1);
});

server.listen(PORT, () => {
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
