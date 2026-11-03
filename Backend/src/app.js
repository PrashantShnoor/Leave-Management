require("dotenv").config();
const express = require("express");
const { pool, connectDB } = require("./config/database");

const app = express();
const cors = require('cors');



const userRoutes = require("./routes/employee");
const requestRoutes = require("./routes/request");
const leaveTypeRoutes = require("./routes/leavetype");
const leaveBalanceRoute = require("./routes/leavebalance");


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/" , userRoutes);
app.use("/" , requestRoutes);
app.use("/" , leaveTypeRoutes);
app.use("/" , leaveBalanceRoute);

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
