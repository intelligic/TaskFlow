import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";

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
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
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

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0) {
      return cb(null, env.NODE_ENV !== "production");
    }
    return cb(null, allowedOrigins.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const io = new SocketIOServer(server, { cors: corsOptions });
global.io = io;

io.on("connection", (socket) => {
  logger.info("Socket connected");
  socket.on("disconnect", () => {
    logger.info("Socket disconnected");
  });
});

connectDB();

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(limiter);
app.use("/uploads", express.static(uploadsDir));

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
