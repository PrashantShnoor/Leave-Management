import express from "express";
import validator from "validator";
import { pool } from "../config/database.js";
import authMiddleware  from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import bcrypt from "bcrypt";
import { saveNotification , emitNotification } from "../utils/notifications.js";
const hrRoutes = express.Router();

hrRoutes.get("/getAllHrAccounts", authMiddleware, async (req, res) => {
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

hrRoutes.post("/createHrAccount", authMiddleware,requireRole("admin") , async (req, res) => {
  try {

    const { first_name, last_name, email, password } = req.body;
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
    if (!validator.isEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.",
      });
    }
    const existingUser = await pool.query(
      `SELECT id FROM employees WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

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

export default hrRoutes;
