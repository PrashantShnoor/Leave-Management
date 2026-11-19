import express from "express";
import { pool } from "../config/database.js";
import authMiddleware from "../middleware/auth.js";

const activityLogRoute = express.Router();

activityLogRoute.get("/getActivityLogs", authMiddleware, async (req, res) => {
    try {
        const role = String(req.user?.role || "").toLowerCase();

        if (role !== "hr" && role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to view activity logs"
            });
        }
        const {
            page = 1,
            limit = 10,
            employee_id,
            action,
            start_date,
            end_date
        } = req.query;


        const currentPage = Number(page);
        const pageLimit = Number(limit);

        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isInteger(pageLimit) ||
            pageLimit < 1 ||
            pageLimit > 100
        ) {
            return res.status(400).json({
                message: "Invalid pagination values"
            });
        }

        let conditions = [];
        let values = [];

        if (employee_id) {

            if (!Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
                return res.status(400).json({
                    message: "Invalid employee_id"
                });
            }

            values.push(Number(employee_id));
            conditions.push(`al.employee_id = $${values.length}`);
        }


        if (action) {
            values.push(action);
            conditions.push(`al.action = $${values.length}`);
        }


        if (start_date) {

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(start_date) ||
                Number.isNaN(Date.parse(`${start_date}T00:00:00Z`))
            ) {
                return res.status(400).json({
                    message: "Invalid start_date. Use YYYY-MM-DD"
                });
            }

            values.push(start_date);
            conditions.push(`al.created_at >= $${values.length}::date`);
        }


        if (end_date) {

            if (
                !/^\d{4}-\d{2}-\d{2}$/.test(end_date) ||
                Number.isNaN(Date.parse(`${end_date}T00:00:00Z`))
            ) {
                return res.status(400).json({
                    message: "Invalid end_date. Use YYYY-MM-DD"
                });
            }

            values.push(end_date);
            conditions.push(`al.created_at < ($${values.length}::date + INTERVAL '1 day')`);
        }

        if (start_date && end_date && start_date > end_date) {
            return res.status(400).json({
                message: "start_date cannot be after end_date"
            });
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM activity_logs al
            ${whereClause}
        `;

        const countResult = await pool.query(countQuery, values);

        const totalRecords = Number(countResult.rows[0].total);

        const offset = (currentPage - 1) * pageLimit;

        const logsQuery = `
            SELECT
                al.id,
                al.action,
                al.description,
                al.entity_type,
                al.entity_id,
                al.old_value,
                al.new_value,
                al.created_at,
                al.employee_id,
                CONCAT_WS(' ', employee.first_name, employee.last_name)
                    AS employee_name,
                al.performed_by,
                CONCAT_WS(' ', actor.first_name, actor.last_name)
                    AS performed_by_name
            FROM activity_logs al
            LEFT JOIN employees employee
                ON al.employee_id = employee.id
            LEFT JOIN employees actor
                ON al.performed_by = actor.id
            ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT $${values.length + 1}
            OFFSET $${values.length + 2}
        `;

        const logsResult = await pool.query(logsQuery, [...values, pageLimit, offset]);
        return res.status(200).json({
            message: "Activity logs fetched successfully",
            data: logsResult.rows,
            pagination: {
                currentPage,
                limit: pageLimit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / pageLimit),
                hasNextPage: currentPage < Math.ceil(totalRecords / pageLimit),
                hasPreviousPage: currentPage > 1
            }
        });
    } catch (error) {
        console.log("Error fetching activity logs:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


export default activityLogRoute;
