import express from "express";
import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validatesignupdata from "../utils/validator.js";

const authRoutes = express.Router();

authRoutes.post("/signup" , async (req ,res) => {
    try {
        const { first_name , last_name , email , password_hash , role } = req.body;
        validatesignupdata(req.body);

        const passwordhash = await bcrypt.hash(password_hash , 10);

         const query = `
        INSERT INTO employees
            (first_name , last_name , email , password_hash , role)
        VALUES ($1 , $2 , $3 , $4 , $5)
        RETURNING id , first_name , last_name , email , role , created_at
        `;

        const values = [first_name, last_name, email, passwordhash , role];
        const result = await pool.query(query, values);

        const savedUser = result.rows[0];

        const token = jwt.sign(
            {id : savedUser.id},
            process.env.JWT_SECRET_KEY,
            {expiresIn : "1d"}
        );
        
        res.cookie("token" , token);

        res.json({
            message : "User created successfully" , 
            data : savedUser
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Employee already exists with this mail",
            });
        }
        res.status(400).send("error saving the user :" + error.message);
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

