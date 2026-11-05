import express from "express";
import { pool } from "../config/database.js";
import authMiddleware  from "../middleware/auth.js";
import bcrypt from "bcrypt";
const requestRoutes = express.Router();

requestRoutes.post("/createLeave",authMiddleware , async (req, res) => {
  try {
    const employee_id = req.user.id;
    const {
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

requestRoutes.get("/getLeaveRequests", authMiddleware ,async (req , res)=> {
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
requestRoutes.get("/getAllEmployees", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          first_name,
          last_name,
          email,
          role
       FROM employees
       WHERE LOWER(role) = 'employee'
       ORDER BY first_name ASC`
    );

    return res.status(200).json({
      message: "Employees fetched successfully",
      data: result.rows,
    });

  } catch (error) {
    console.error("Get all employees error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});
requestRoutes.get("/getAllrequest", async (req, res) => {
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


requestRoutes.get("/getAdminDashboard", authMiddleware, async (req, res) => {
  try {
    // 1. Organization statistics
    const organizationQuery = await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE LOWER(role) = 'employee'
        ) AS total_employees,

        COUNT(*) FILTER (
          WHERE LOWER(role) = 'hr'
        ) AS hr_accounts

      FROM employees
    `);

   

    // 3. Leave request statistics
    const leaveStatisticsQuery = await pool.query(`
      SELECT
        COUNT(*) AS leave_requests,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'pending'
        ) AS pending_requests,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'approved'
        ) AS approved_requests,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'rejected'
        ) AS rejected_requests

      FROM leave_request
    `);

    // 4. Employees currently on leave
    const employeesOnLeaveQuery = await pool.query(`
      SELECT COUNT(DISTINCT employee_id) AS employees_on_leave
      FROM leave_request
      WHERE LOWER(status) = 'approved'
        AND CURRENT_DATE BETWEEN start_date AND end_date
    `);

   

    // 6. Prepare dashboard response
    const organization = {
      totalEmployees: Number(
        organizationQuery.rows[0].total_employees
      ),
      hrAccounts: Number(
        organizationQuery.rows[0].hr_accounts
      ),
      
      leaveRequests: Number(
        leaveStatisticsQuery.rows[0].leave_requests
      ),
    };

    const leaveStatistics = {
      pendingRequests: Number(
        leaveStatisticsQuery.rows[0].pending_requests
      ),
      approvedRequests: Number(
        leaveStatisticsQuery.rows[0].approved_requests
      ),
      rejectedRequests: Number(
        leaveStatisticsQuery.rows[0].rejected_requests
      ),
      employeesOnLeave: Number(
        employeesOnLeaveQuery.rows[0].employees_on_leave
      ),
    };

    return res.status(200).json({
      message: "Admin dashboard data fetched successfully",
      data: {
        organization,
        leaveStatistics,
      },
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      message: "Failed to fetch admin dashboard data",
      error: error.message,
    });
  }
});

requestRoutes.get("/getAllHrAccounts", authMiddleware, async (req, res) => {
  try {
    // Debug: Check authenticated user
    console.log("Authenticated user:", req.user);

    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        role
      FROM employees
      WHERE LOWER(role) = 'hr'
      ORDER BY id DESC
    `);

    return res.status(200).json({
      message: "HR accounts fetched successfully.",
      data: result.rows,
    });

  } catch (error) {
    console.error("Get all HR accounts error:", error);

    return res.status(500).json({
      message: "Failed to fetch HR accounts.",
    });
  }
});

requestRoutes.post("/createHrAccount", authMiddleware, async (req, res) => {
  try {
    // Only admin can create HR accounts
    // if (req.user?.role !== "admin") {
    //   return res.status(403).json({
    //     message: "Access denied. Admin only.",
    //   });
    // }

    const { first_name, last_name, email, password } = req.body;

    // Validate required fields
    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      typeof password !== "string" ||
      !password.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      `SELECT id FROM employees WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert HR account
    const result = await pool.query(
      `INSERT INTO employees
        (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'hr')
       RETURNING id, first_name, last_name, email, role`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim(),
        hashedPassword,
      ]
    );

    return res.status(201).json({
      message: "HR account created successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Create HR account error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      message: "Failed to create HR account.",
    });
  }
});

requestRoutes.get("/hrDashboardSummary", authMiddleware, async (req, res) => {
  try {
    // Only HR and Admin can access this dashboard summary
    const role = req.user?.role?.toLowerCase();

    if (role !== "hr" && role !== "admin") {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const employeeQuery = `
      SELECT COUNT(*) AS total_employees
      FROM employees
      WHERE LOWER(role) = 'employee'
    `;

    const leaveQuery = `
      SELECT
        COUNT(*) FILTER (
          WHERE LOWER(status) = 'pending'
        ) AS pending_requests,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'approved'
        ) AS approved_leaves,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'rejected'
        ) AS rejected_leaves

      FROM leave_request
    `;

    const [employeeResult, leaveResult] = await Promise.all([
      pool.query(employeeQuery),
      pool.query(leaveQuery),
    ]);

    return res.status(200).json({
      message: "HR dashboard summary fetched successfully.",
      data: {
        totalEmployees: Number(employeeResult.rows[0].total_employees),
        pendingRequests: Number(leaveResult.rows[0].pending_requests),
        approvedLeaves: Number(leaveResult.rows[0].approved_leaves),
        rejectedLeaves: Number(leaveResult.rows[0].rejected_leaves),
      },
    });

  } catch (error) {
    console.error("HR Dashboard Summary Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch dashboard summary.",
    });
  }
});

export default requestRoutes;
