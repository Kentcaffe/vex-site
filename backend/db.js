require("dotenv").config();
const { Pool } = require("pg");

const { DATABASE_URL, DB_SSL } = process.env;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment variables.");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function query(text, params = []) {
  return pool.query(text, params);
}

module.exports = { pool, query };
