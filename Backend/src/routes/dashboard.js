import express from "express";
import { pool } from "../config/database.js";
import authMiddleware  from "../middleware/auth.js";
import bcrypt from "bcrypt";
import { saveNotification , emitNotification } from "../utils/notifications.js";
const dashboardRoutes = express.Router();

dashboardRoutes.get("/getAdminDashboard", authMiddleware, async (req, res) => {
  try {
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

    const employeesOnLeaveQuery = await pool.query(`
      SELECT COUNT(DISTINCT employee_id) AS employees_on_leave
      FROM leave_request
      WHERE LOWER(status) = 'approved'
        AND CURRENT_DATE BETWEEN start_date AND end_date
    `);

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
      pendingRequests: Number(leaveStatisticsQuery.rows[0].pending_requests),
      approvedRequests: Number(leaveStatisticsQuery.rows[0].approved_requests),
      rejectedRequests: Number(leaveStatisticsQuery.rows[0].rejected_requests),
      employeesOnLeave: Number(employeesOnLeaveQuery.rows[0].employees_on_leave),
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

dashboardRoutes.get("/hrDashboardSummary", authMiddleware, async (req, res) => {
  try {
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

export default dashboardRoutes;