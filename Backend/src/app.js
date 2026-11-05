import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/database.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/employee.js";
import requestRoutes from "./routes/request.js";
import leaveTypeRoutes from "./routes/leavetype.js";
import leaveBalanceRoute from "./routes/leavebalance.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", requestRoutes);
app.use("/", leaveTypeRoutes);
app.use("/", leaveBalanceRoute);

connectDB()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777...");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected:", err.message);
    process.exit(1);
  });