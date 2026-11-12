import express from "express";
import { pool } from "../config/database.js";
import authMiddleware from "../middleware/auth.js";
const userRoutes = express.Router();


userRoutes.get("/getemployee", authMiddleware, async (req, res) => {
  try {
    const employeeId = req.user?.id;

    if (!employeeId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const query = `
      SELECT id, first_name, last_name, email, role, created_at
      FROM employees
      WHERE id = $1
    `;

    const result = await pool.query(query, [employeeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      message: "Employee found successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error in finding employee:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

userRoutes.patch("/updateEmployee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name } = req.body;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    if (!first_name || !last_name) {
      return res.status(400).json({
        message: "Please provide first name, last name",
      });
    }

    const query = `
        UPDATE employees
        SET first_name = $1 , 
            last_name = $2
        WHERE id = $3
        RETURNING id , first_name , last_name , email , role
        `;

    const values = [first_name.trim(), last_name.trim(), Number(id)];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "employee not found",
      });
    }

    return res.status(200).json({
      message: "employee updated successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating employee:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

userRoutes.delete("/deleteEmployee/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid employee ID",
      });
    }

    const query = `
    DELETE FROM employees
    WHERE id = $1
    RETURNING id, first_name, last_name, email, role
    `;

    const result = await pool.query(query, [Number(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      message: "Employee deleted successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting employee:", error.message);

    return res.status(500).json({
        message: "Internal server error"
    });
  }
  
});

userRoutes.get("/getAllEmployees", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          id,
          first_name,
          last_name,
          email,
          role,
          created_at
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

export default userRoutes;
