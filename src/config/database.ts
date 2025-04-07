import { Pool } from "pg";
import logger from "./logger";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "call_logs_db",
  user: process.env.DB_USER || "calluser",
  password: process.env.DB_PASSWORD || "your_secure_password",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

pool.query("SELECT NOW()", err => {
  if (err) {
    logger.error("Database connection error", { error: err.message });
  } else {
    logger.info("Connected to PostgreSQL database");
  }
});

pool.on("error", err => {
  logger.error("Unexpected database error", { error: err.message });
});

export const query = async (text: string, params: any[] = []) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.info("Executed query", {
      query: text,
      duration,
      rows: result.rowCount
    });

    return result;
  } catch (error) {
    logger.error("Query error", {
      query: text,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

export default pool;
