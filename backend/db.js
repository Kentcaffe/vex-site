require("dotenv").config();
const { Pool } = require("pg");

const { DATABASE_URL, DB_SSL } = process.env;
let pool = null;
let initError = null;

function getPool() {
  if (pool) return pool;
  if (!DATABASE_URL) {
    initError = new Error("Missing DATABASE_URL in environment variables.");
    return null;
  }
  try {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    });
    return pool;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    return null;
  }
}

async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) {
    throw initError ?? new Error("Database pool is not available.");
  }
  return activePool.query(text, params);
}

function getDbStatus() {
  if (pool) return { ok: true, message: "connected" };
  if (initError) return { ok: false, message: initError.message };
  if (!DATABASE_URL) return { ok: false, message: "DATABASE_URL missing" };
  return { ok: false, message: "not initialized" };
}

module.exports = { getPool, query, getDbStatus };
