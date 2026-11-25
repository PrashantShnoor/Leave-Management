import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import http from "http";
import { createServer } from "http";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/database.js";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import userRoutes from "./routes/employee.js";
import hrRoutes from "./routes/hr.js";
import leaveBalanceRoute from "./routes/leavebalance.js";
import leaveRequestRoutes from "./routes/leaverequest.js";
import leaveTypeRoutes from "./routes/leavetype.js";
import notificationRoutes from "./routes/notifications.js";

import { initializeSocket } from "./config/socket.js"
import activityLogRoute from "./routes/activityLog.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

initializeSocket(server);
const authLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max : 10 ,
  message : { message : "Too many login attempts. Please try again later. "}
});

app.use("/login" , authLimiter);

// Routes
app.use("/", authRoutes);
app.use("/" , dashboardRoutes);
app.use("/", userRoutes);
app.use("/" , hrRoutes);
app.use("/", leaveBalanceRoute);
app.use("/" , leaveRequestRoutes);
app.use("/", leaveTypeRoutes);
app.use("/notifications", notificationRoutes);
app.use("/" , activityLogRoute);

connectDB()
  .then(() => {
    console.log("Database connected successfully");

    server.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected:", err.message);
    process.exit(1);
  });