import http from "http";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";

import connectDB from "./config/db.js";
import activityRoutes from "./routes/activityRoutes.js";
import activityFeedRoutes from "./routes/activityFeedRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const app = express();
const server = http.createServer(app);

const corsOriginRaw = process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN || "*";
const corsOrigin = corsOriginRaw.includes(",")
  ? corsOriginRaw.split(",").map((o) => o.trim()).filter(Boolean)
  : corsOriginRaw;

const corsOptions = {
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const io = new SocketIOServer(server, { cors: corsOptions });
global.io = io;

io.on("connection", (socket) => {
  console.log("Socket connected");
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

connectDB();

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(limiter);
app.use("/uploads", express.static("uploads"));
app.use("/api/attachments", attachmentRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/activity", activityFeedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

app.get("/", (req, res) => {
  res.send("TaskManager API running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error && error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Set PORT to a free port and retry.`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
