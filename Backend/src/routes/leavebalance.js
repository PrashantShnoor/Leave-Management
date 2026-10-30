const express = require("express");
const { pool } = require("../config/database");

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

module.exports = leaveBalanceRoute;