const express = require("express");
const { pool } = require("../config/database");

const requestRoutes = express.Router();

requestRoutes.post("/createLeave", async (req, res) => {
  try {
    const {
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      requested_days,
      reason,
      status,
      reviewer_id,
      reviewer_comment,
    } = req.body;

    if (
      !employee_id ||
      !leave_type_id ||
      !start_date ||
      !end_date ||
      requested_days === undefined ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query = `
        INSERT INTO leave_request
            (employee_id , leave_type_id , start_date ,  end_date , requested_days , reason)
        VALUES ($1 , $2 , $3 , $4 , $5 , $6)
        RETURNING id ,employee_id , leave_type_id , start_date ,  end_date , requested_days , reason, status ,reviewer_id , reviewer_comment ,created_at , updated_at
        `;

    const values = [
      Number(employee_id),
      Number(leave_type_id),
      start_date,
      end_date,
      Number(requested_days),
      reason.trim(),
    ];
    const result = await pool.query(query, values);

    console.log("leave requested successfully:");

    return res.status(201).json({
      message: "leave requested successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating leave request :", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = requestRoutes;
