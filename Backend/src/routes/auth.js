import express from "express";
import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validatesignupdata from "../utils/validator.js";
import authMiddleware  from "../middleware/auth.js"
import { emitNotification, saveNotification } from "../utils/notifications.js";

const authRoutes = express.Router();

authRoutes.post("/signup" ,authMiddleware , async (req ,res) => {
    const client = await pool.connect();
    let notifications = [];
    try {
        if (req.user.role?.toLowerCase() !== "admin") {
            return res.status(403).json({
                message: "Only Admin can create new accounts.",
            });
        }
        const { first_name , last_name , email , password_hash , role } = req.body;
        validatesignupdata(req.body);

        const passwordhash = await bcrypt.hash(password_hash , 10);

        await client.query("BEGIN");
         const query = `
        INSERT INTO employees
            (first_name , last_name , email , password_hash , role)
        VALUES ($1 , $2 , $3 , $4 , $5)
        RETURNING id , first_name , last_name , email , role , created_at
        `;

        const values = [first_name, last_name, email, passwordhash , role];
        const result = await client.query(query, values);

        const savedUser = result.rows[0];

        const hrQuery = `
        SELECT id 
        FROM employees
        WHERE LOWER(role) = 'hr'
        `

        const hrResult = await client.query(hrQuery);

        for (const hr of hrResult.rows) {
            const notification = await saveNotification(client, {
                recipient_id: hr.id,
                leave_request_id: null,
                title: "New Account Created",
                message: `${savedUser.first_name} ${savedUser.last_name} has been added as a new ${savedUser.role}.`,
                type: "account_created",
            });

            notifications.push(notification);
        }
        await client.query("COMMIT");

        for(const notification of notifications) {
            emitNotification(notification);
        }
        
        return res.json({
            message : "User created successfully" , 
            data : savedUser
        });

    } catch (error) {
        await client.query("ROLLBACK");
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Employee already exists with this mail",
            });
        }
        return res.status(400).send("error saving the user :" + error.message);
    }
});

authRoutes.post("/login" , async (req , res) => {
    try {
        const { email , password_hash } = req.body;

        const query = `
        SELECT id , first_name , last_name , email , password_hash , role
        FROM employees
        WHERE LOWER(email) = LOWER($1)`;

        const result = await pool.query(query , [email]);

        const user = result.rows[0];

        if(!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password_hash , user.password_hash);
        
        if(!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn : "1d"}
        );

        res.cookie("token" , token);

        delete user.password_hash;

        res.status(200).json({
            message : "Login successful" , 
            data : user
        });
    } catch (error) {
        res.status(401).json({
            message : "Login failed",
            error : error.message
        });
    }
});

authRoutes.post("/logout" , async (req , res) => {
    res.cookie("token" , null , {
        expires : new Date(Date.now()),
    });
    res.send("user logout successfully");
})

export default authRoutes;

