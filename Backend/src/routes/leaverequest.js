import express from "express";
import { pool } from "../config/database.js";
import authMiddleware  from "../middleware/auth.js";
import bcrypt from "bcrypt";
import { saveNotification , emitNotification } from "../utils/notifications.js";
const leaveRequestRoutes = express.Router();


leaveRequestRoutes.post("/createLeave",authMiddleware , async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;
  let notifications = [];
  try {
    const employee_id = req.user.id;
    const {
      leave_type_id,
      start_date,
      end_date,
      requested_days,
      reason,
    } = req.body;

    if (
      !leave_type_id ||
      !start_date ||
      !end_date ||
      requested_days === undefined ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;
    
    const balanceQuery = `
    SELECT allocated_days , used_days
    FROM employee_leave_balance
    WHERE employee_id = $1 
      AND leave_type_id = $2
    `;

    const balanceResult = await client.query(balanceQuery, [
      Number(employee_id),
      Number(leave_type_id),
    ]);

    if (balanceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      return res.status(400).json({
        message: "No leave balance found for this employee and leave type",
      });
    }

    const { allocated_days, used_days } = balanceResult.rows[0];

    const availableBalance = Number(allocated_days) - Number(used_days);

    if (Number(requested_days) > availableBalance) {
      await client.query("ROLLBACK");
      transactionStarted = false;
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
    const result = await client.query(query, values);
    const leave = result.rows[0];

    const employeeResult = await client.query(
      `SELECT first_name , last_name FROM employees WHERE id = $1`,
      [employee_id]
    );

    const employeeName = `${employeeResult.rows[0].first_name} ${employeeResult.rows[0].last_name}`;

    const recipientsResult = await client.query(`
      SELECT id
      FROM employees
      WHERE LOWER(role) IN ('hr' , 'admin')
    `)
    
    for(const recipient of recipientsResult.rows) {
      const notification = await saveNotification(client , {
        recipient_id : recipient.id , 
        leave_request_id : leave.id ,
        title : "New Leave Request" ,
        message : `${employeeName} has submitted a new leave request`,
        type : "leave_created", 
      })
      notifications.push(notification)
    }
    await client.query("COMMIT");
    transactionStarted = false;

    for (const notification of notifications) {
      emitNotification(notification);
    }

    return res.status(201).json({
      message: "leave requested successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    console.error("Error creating leave request :", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

leaveRequestRoutes.get("/getLeaveRequests", authMiddleware ,async (req , res)=> {
  try {
    const id = req.user.id;

    if(!id) {
      return res.status(400).json({
        message : "employee_id is needed",
      });
    }
    if(!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message : "Invalid employee_id",
      })
    }

    const query = `SELECT * 
      FROM leave_request
      WHERE employee_id = $1`
    
    const values = [id];
    const result = await pool.query(query , values);

    return res.status(201).json({
      message : "All the leave information about the employee is here",
      employee_balance : result.rows ,
    })

  } catch (error) {
    
  }
})

leaveRequestRoutes.get("/getAllrequest", async (req, res) => {
  try {
    const query = `
      SELECT
        lr.id,
        lr.employee_id,
        e.first_name AS employee_name,
        e.email AS employee_email,
        lr.leave_type_id,
        lr.start_date,
        lr.end_date,
        lr.requested_days,
        lr.reason,
        lr.status,
        lr.reviewer_id,
        lr.reviewer_comment,
        lr.created_at,
        lr.updated_at
      FROM leave_request lr
      INNER JOIN employees e
        ON lr.employee_id = e.id
      ORDER BY lr.created_at DESC;
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      message: "All leave requests fetched successfully",
      leave_requests: result.rows,
    });

  } catch (error) {
    console.error("Error fetching leave requests:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

leaveRequestRoutes.patch("/approveLeave/:id", authMiddleware, async (req, res) => {
  let client;
  let transactionStarted = false;
  let notification;

  try {
   

    const { id } = req.params;
    const reviewer_id = req.user.id;
    const reviewer_comment =
      typeof req.body.reviewer_comment === "string"
        ? req.body.reviewer_comment.trim()
        : "";

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid leave request ID",
      });
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const leaveResult = await client.query(
      `SELECT employee_id, leave_type_id, requested_days, status
       FROM leave_request
       WHERE id = $1
       FOR UPDATE`,
      [Number(id)]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const leave = leaveResult.rows[0];

    if (String(leave.status).toLowerCase() !== "pending") {
      return res.status(400).json({
        message: "Only pending leave requests can be approved",
      });
    }

    const balanceResult = await client.query(
      `SELECT allocated_days, used_days
       FROM employee_leave_balance
       WHERE employee_id = $1 AND leave_type_id = $2
       FOR UPDATE`,
      [leave.employee_id, leave.leave_type_id]
    );

    if (balanceResult.rows.length === 0) {
      return res.status(400).json({
        message: "Leave balance not found",
      });
    }

    const balance = balanceResult.rows[0];

    const availableBalance =
      Number(balance.allocated_days) - Number(balance.used_days);

    if (Number(leave.requested_days) > availableBalance) {
      return res.status(400).json({
        message: "Insufficient leave balance to approve this request",
        available_balance: availableBalance,
        requested_days: Number(leave.requested_days),
      });
    }

    await client.query(
      `UPDATE employee_leave_balance
       SET used_days = used_days + $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE employee_id = $2 AND leave_type_id = $3`,
      [
        leave.requested_days,
        leave.employee_id,
        leave.leave_type_id,
      ]
    );

    const updateResult = await client.query(
      `UPDATE leave_request
       SET status = 'approved',
           reviewer_id = $1,
           reviewer_comment = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [reviewer_id, reviewer_comment || null, Number(id)]
    );

    notification = await saveNotification(client, {
      recipient_id: leave.employee_id,
      leave_request_id: Number(id),
      title: "Leave Request Approved",
      message: "Your leave request has been approved.",
      type: "leave_approved",
    });

    await client.query("COMMIT");
    transactionStarted = false;

    emitNotification(notification);

    return res.status(200).json({
      message: "Leave approved successfully",
      leave: updateResult.rows[0],
    });

  } catch (error) {
    if (transactionStarted && client) {
      await client.query("ROLLBACK");
    }

    console.error("Error approving leave:", error);

    return res.status(500).json({
      message: "Internal server error",
    });

  } finally {
    if (client) client.release();
  }
});

leaveRequestRoutes.patch("/rejectLeave/:id", authMiddleware, async (req, res) => {
  let client;
  let transactionStarted = false;

  try {
    

    const { id } = req.params;
    const reviewer_id = req.user.id;

    const reviewer_comment =
      typeof req.body.reviewer_comment === "string"
        ? req.body.reviewer_comment.trim()
        : "";

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid leave request ID",
      });
    }

    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    const leaveResult = await client.query(
      `SELECT employee_id, status
       FROM leave_request
       WHERE id = $1
       FOR UPDATE`,
      [Number(id)]
    );

    if (leaveResult.rows.length === 0) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    const leave = leaveResult.rows[0];

    if (String(leave.status).toLowerCase() !== "pending") {
      return res.status(400).json({
        message: "Only pending leave requests can be rejected",
      });
    }

    const updateResult = await client.query(
      `UPDATE leave_request
       SET status = 'rejected',
           reviewer_id = $1,
           reviewer_comment = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [reviewer_id, reviewer_comment || null, Number(id)]
    );

    const notification = await saveNotification(client, {
      recipient_id: leave.employee_id,
      leave_request_id: Number(id),
      title: "Leave Request Rejected",
      message: reviewer_comment
        ? `Your leave request has been rejected. Reason: ${reviewer_comment}`
        : "Your leave request has been rejected.",
      type: "leave_rejected",
    });

    await client.query("COMMIT");
    transactionStarted = false;

    emitNotification(notification);

    return res.status(200).json({
      message: "Leave rejected successfully",
      leave: updateResult.rows[0],
    });

  } catch (error) {
    if (transactionStarted && client) {
      await client.query("ROLLBACK");
    }

    console.error("Error rejecting leave:", error);

    return res.status(500).json({
      message: "Internal server error",
    });

  } finally {
    if (client) client.release();
  }
});

export default leaveRequestRoutes;