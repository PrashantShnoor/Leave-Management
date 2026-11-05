import express from "express";
import { pool } from "../config/database.js";
import authMiddleware from "../middleware/auth.js";

const leaveBalanceRoute = express.Router();

leaveBalanceRoute.post("/createLeavebalance" , async (req , res) => {
    try {
        const { employee_id , leave_type_id , leave_year , allocated_days} = req.body;

        if( !employee_id || !leave_type_id || !leave_year || !allocated_days) {
            return res.status(400).json({
                message : "All fields are required",
            });
        }

        if(!Number.isInteger(Number(employee_id)) || Number(employee_id) <= 0) {
            return res.status(400).json({
                message : "Invalid employee_id",
            })
        }
        if(!Number.isInteger(Number(leave_type_id)) || Number(leave_type_id) <= 0) {
            return res.status(400).json({
                message : "Invalid leave_type_id",
            });
        }

        const query = `
            INSERT INTO employee_leave_balance
                (employee_id , leave_type_id , leave_year , allocated_days)
            VALUES ($1 , $2 , $3 , $4)
            RETURNING id , employee_id , leave_type_id , leave_year , allocated_days , used_days , created_at , updated_at
            `;
        
        const values = [ employee_id , leave_type_id , leave_year , allocated_days ];
        const result = await pool.query(query , values);

        console.log("Employee leave balance created successfully");

        return res.status(201).json({
            message : "Employee leave balance created successfully" ,
            employee_balance : result.rows[0],
        });
    } catch (error) {
        console.log("Error in creating employee leave balance :" , error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

leaveBalanceRoute.get("/getLeavebalance" , authMiddleware , async (req , res)=> {
    try {
        const  id  = req.user.id;
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

        const query =  `SELECT *
            FROM employee_leave_balance
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
leaveBalanceRoute.get("/getAllLeaveBalances", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          elb.id,
          elb.employee_id,
          elb.leave_type_id,
          elb.leave_year,
          elb.allocated_days,
          elb.used_days,
          (elb.allocated_days - elb.used_days) AS available_days,

          e.first_name,
          e.last_name,
          e.email,

          lt.type AS leave_type

       FROM employee_leave_balance elb

       INNER JOIN employees e
          ON elb.employee_id = e.id

       INNER JOIN leave_type lt
          ON elb.leave_type_id = lt.id

       ORDER BY e.first_name ASC, lt.type ASC`
    );

    return res.status(200).json({
      message: "Leave balances fetched successfully",
      data: result.rows,
    });

  } catch (error) {
    console.error("Get all leave balances error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default leaveBalanceRoute;