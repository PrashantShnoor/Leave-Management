import express from "express";
import { pool } from "../config/database.js";

const leaveTypeRoutes = express.Router();

leaveTypeRoutes.post("/createLeaveType", async (req, res) => {
  try {
    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query = `
        INSERT INTO leave_type
            (type , description)
        VALUES ($1 , $2)
        RETURNING id , type , is_active , description , created_at , updated_at
        `;

    const values = [type, description];
    const result = await pool.query(query, values);

    console.log("leave type inserted successfully:");

    return res.status(201).json({
      message: "leave type inserted successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting leave type:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

leaveTypeRoutes.get("/getLeaveTypes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          type,
          description
       FROM leave_type
       ORDER BY type ASC`
    );

    return res.status(200).json({
      message: "Leave types fetched successfully",
      data: result.rows,
    });

  } catch (error) {
    console.error("Get leave types error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default leaveTypeRoutes;
