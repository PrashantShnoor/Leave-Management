const express = require("express");
const { pool } = require("../config/database");

const userRoutes = express.Router();

userRoutes.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password_hash } = req.body;

    if (!first_name || !last_name || !email || !password_hash) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const query = `
        INSERT INTO employees
            (first_name , last_name , email , password_hash)
        VALUES ($1 , $2 , $3 , $4)
        RETURNING id , first_name , last_name , email , role , created_at
        `;

    const values = [first_name, last_name, email, password_hash];
    const result = await pool.query(query, values);

    console.log("Employee inserted successfully:");

    return res.status(201).json({
      message: "Employee inserted successfully",
      employee: result.rows[0],
    });
  } catch (error) {
    console.error("Error inserting employee:", error.message);
  }
});

userRoutes.get("/getemployee", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Please fill valid email",
      });
    }

    const query = `
        SELECT * FROM employees WHERE LOWER(email) = LOWER($1)
        `;
    const value = [email.trim()];
    const result = await pool.query(query, value);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    return res.status(201).json({
      message: "Employee found",
      result: result.rows,
    });
  } catch (error) {
    console.error("Error in finding employee :", error.message);
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
module.exports = userRoutes;
