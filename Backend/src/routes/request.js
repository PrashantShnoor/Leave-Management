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

    const balanceQuery = `
    SELECT allocated_days , used_days
    FROM employee_leave_balance
    WHERE employee_id = $1 
      AND leave_type_id = $2
    `;

    const balanceResult = await pool.query(balanceQuery, [
      Number(employee_id),
      Number(leave_type_id),
    ]);

    if (balanceResult.rows.length === 0) {
      return res.status(400).json({
        message: "No leave balance found for this employee and leave type",
      });
    }

    const { allocated_days, used_days } = balanceResult.rows[0];

    const availableBalance = Number(allocated_days) - Number(used_days);

    if (Number(requested_days) > availableBalance) {
      return res.status(400).json({
        message: "Insufficient leave balance",
        available_balance: availableBalance,
        requested_days: Number(requested_days),
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

requestRoutes.patch("/approveLeave/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { reviewer_comment } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid leave request ID",
      });
    }

    await client.query("BEGIN");

    const leaveQuery = `
            SELECT employee_id, leave_type_id, start_date,
              requested_days, status
            FROM leave_request
            WHERE id = $1
            FOR UPDATE
        `;

    const leaveResult = await client.query(leaveQuery, [Number(id)]);

    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Only pending leave requests can be approved",
      });
    }

    const balanceQuery = `
            SELECT allocated_days, used_days
            FROM employee_leave_balance
            WHERE employee_id = $1
              AND leave_type_id = $2
            FOR UPDATE
        `;

    const balanceResult = await client.query(balanceQuery, [
      leave.employee_id,
      leave.leave_type_id,
    ]);

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Leave balance not found",
      });
    }

    const balance = balanceResult.rows[0];

    // 6. Update employee leave balance
    const updateBalanceQuery = `
            UPDATE employee_leave_balance
            SET used_days = used_days + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = $2
              AND leave_type_id = $3
        `;

    await client.query(updateBalanceQuery, [
      leave.requested_days,
      leave.employee_id,
      leave.leave_type_id,
    ]);

    // 7. Update leave request status
    const updateLeaveRequestQuery = `
            UPDATE leave_request
            SET status = 'approved',
                reviewer_comment = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

    const result = await client.query(updateLeaveRequestQuery, [
      reviewer_comment || null,
      Number(id),
    ]);

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave approved successfully",
      leave: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Error approving leave:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
});

requestRoutes.patch("/rejectLeave/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { reviewer_comment } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid leave request ID",
      });
    }

    await client.query("BEGIN");
    const leaveQuery = `
            SELECT id, status
            FROM leave_request
            WHERE id = $1
            FOR UPDATE
        `;

    const leaveResult = await client.query(leaveQuery, [Number(id)]);

    if (leaveResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const leave = leaveResult.rows[0];

    if (leave.status !== "pending") {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Only pending leave requests can be rejected",
      });
    }

    const updateLeaveQuery = `
            UPDATE leave_request
            SET status = 'rejected',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

    const result = await client.query(updateLeaveQuery, [Number(id)]);
    await client.query("COMMIT");

    return res.status(200).json({
      message: "Leave rejected successfully",
      leave: result.rows[0],
    });
  } catch (error) {
    console.error("Error rejecting leave:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
});
module.exports = requestRoutes;
