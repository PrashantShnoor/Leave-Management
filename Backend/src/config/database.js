const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "leave-managementdb",
  password: "914272",
  port: 5432,
});

const connectDB = async () => {
  return await pool.query("SELECT 1");
};

module.exports = { pool, connectDB };